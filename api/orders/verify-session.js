
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const axios = require('axios');
const crypto = require('crypto');

/**
 * eSIMAccess V1 MAPPING
 * Key: Stripe Price ID
 * Value: { locationCode, packageCode }
 * 
 * IMPORTANT: Even though the portal calls it "Slug", 
 * the API key in the JSON body MUST be "packageCode".
 */
const CATALOG_MAP = {
  // USA - Map these to the exact "Slug" in your portal
  'price_us_5gb_prod': { locationCode: 'US', packageCode: 'united-states-5gb-30d' },
  'price_us_10gb_prod': { locationCode: 'US', packageCode: 'united-states-10gb-30d' },
  'price_1SqhSYCPrRzENMHl0tebNgtr': { locationCode: 'US', packageCode: 'united-states-unlimited-daily' },
  
  // UK
  'price_uk_3gb_prod': { locationCode: 'GB', packageCode: 'united-kingdom-3gb-30d' },
  'price_uk_10gb_prod': { locationCode: 'GB', packageCode: 'united-kingdom-10gb-30d' },
  'price_uk_unlimited_prod': { locationCode: 'GB', packageCode: 'united-kingdom-unlimited-30d' },
};

export default async function handler(req, res) {
  const { sessionId } = req.query;
  const protocol = req.headers['x-forwarded-proto'] || 'http';
  const host = req.headers.host;
  const webhookUrl = `${protocol}://${host}/api/orders/webhook`;

  if (!sessionId) return res.status(400).json({ error: 'Session ID required' });

  try {
    const session = await stripe.checkout.sessions.retrieve(sessionId);
    if (session.payment_status !== 'paid') {
      return res.status(400).json({ error: 'Payment not completed' });
    }

    const priceId = session.metadata?.plan_ids?.split(',')[0];
    const planConfig = CATALOG_MAP[priceId] || { locationCode: 'US', packageCode: 'united-states-5gb-30d' };
    const customerEmail = session.customer_email.toLowerCase();

    // eSIMAccess V1 Credentials
    const appKey = process.env.ESIM_ACCESS_APP_KEY;
    const appSecret = process.env.ESIM_ACCESS_APP_SECRET;
    const timestamp = Date.now().toString();

    // RT-Sign = SHA256(AppKey + AppSecret + Timestamp)
    const signSource = appKey + appSecret + timestamp;
    const sign = crypto.createHash('sha256').update(signSource).digest('hex');

    /**
     * REQUEST BODY (Per docs.esimaccess.com)
     * Key must be 'packageCode', but value should be the 'Slug' from your portal.
     */
    const requestBody = {
      locationCode: planConfig.locationCode,
      packageCode: planConfig.packageCode, 
      quantity: 1,
      externalOrderNo: session.id,
      email: customerEmail 
    };

    console.log('[PROVISIONER] Outbound Request:', JSON.stringify({
        url: 'https://api.esimaccess.com/order/v1/buy',
        headers: { 'RT-AppKey': appKey, 'RT-Timestamp': timestamp },
        body: requestBody
    }));

    try {
      const esimResponse = await axios.post('https://api.esimaccess.com/order/v1/buy', requestBody, {
        headers: {
          'RT-AppKey': appKey,
          'RT-Timestamp': timestamp,
          'RT-Sign': sign,
          'Content-Type': 'application/json'
        },
        timeout: 15000
      });

      const esimData = esimResponse.data;
      console.log('[PROVISIONER] Raw Response:', JSON.stringify(esimData));

      // Code 000000 is success in eSIMAccess
      const isSuccess = esimData.code === '000000' || esimData.code === 0;

      let errorMsg = esimData.message;
      if (esimData.code === '800102') errorMsg = "Insufficient Balance in eSIMAccess Wallet";
      if (esimData.code === '800101') errorMsg = "Invalid Package Code/Slug (Check Favorites)";
      if (esimData.code === '100003') errorMsg = "IP Not Whitelisted (Check Portal Settings)";

      return res.status(200).json({
        id: session.id,
        email: customerEmail,
        status: 'completed',
        total: session.amount_total / 100,
        currency: 'USD',
        activationCode: isSuccess ? (esimData.obj?.activationCode || 'PROVISIONED_VIA_EMAIL') : `ERROR: ${errorMsg} (Code: ${esimData.code})`,
        debug: {
            sentPackage: planConfig.packageCode,
            providerCode: esimData.code,
            webhookUrl: webhookUrl
        }
      });

    } catch (esimError) {
      const errorDetail = esimError.response?.data || { message: esimError.message };
      console.error('[PROVISIONER] Connection Fail:', JSON.stringify(errorDetail));
      
      return res.status(200).json({
        id: session.id,
        email: customerEmail,
        status: 'completed',
        activationCode: `GATEWAY_ERROR: ${errorDetail.message || 'Check Server IP Whitelist'}`,
        debug: { webhookUrl: webhookUrl }
      });
    }

  } catch (error) {
    console.error('[SERVER] Critical Error:', error.message);
    res.status(500).json({ error: 'Handshake failed' });
  }
}
