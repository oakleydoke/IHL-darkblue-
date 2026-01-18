
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const axios = require('axios');
const crypto = require('crypto');

/**
 * MAPPING TABLE
 * Use the value found in the "Package Code", "Slug", or "Offer ID" column 
 * of your eSIMAccess / SimHub portal.
 */
const PACKAGE_MAP = {
  'price_us_5gb_prod': { locationCode: 'US', packageCode: 'US_5GB_30D' },
  'price_us_10gb_prod': { locationCode: 'US', packageCode: 'US_10GB_30D' },
  'price_1SqhSYCPrRzENMHl0tebNgtr': { locationCode: 'US', packageCode: 'USCA-2_1_Daily' },
  'price_uk_3gb_prod': { locationCode: 'GB', packageCode: 'GB_3GB_30D' },
  'price_uk_10gb_prod': { locationCode: 'GB', packageCode: 'GB_10GB_30D' },
  'price_uk_unlimited_prod': { locationCode: 'GB', packageCode: 'GB_UL_30D' },
};

export default async function handler(req, res) {
  const { sessionId } = req.query;

  if (!sessionId) return res.status(400).json({ error: 'Session ID required' });

  try {
    const session = await stripe.checkout.sessions.retrieve(sessionId);
    if (session.payment_status !== 'paid') {
      return res.status(400).json({ error: 'Payment not completed' });
    }

    const priceId = session.metadata?.plan_ids?.split(',')[0];
    const planConfig = PACKAGE_MAP[priceId] || { locationCode: 'US', packageCode: 'US_5GB_30D' };
    const customerEmail = session.customer_email.toLowerCase();

    // eSIMAccess V1/V2 Auth Protocol
    const appKey = process.env.ESIM_ACCESS_APP_KEY;
    const appSecret = process.env.ESIM_ACCESS_APP_SECRET;
    const timestamp = Date.now().toString();
    
    // RT-Sign = SHA256(Key + Secret + Timestamp)
    const sign = crypto.createHash('sha256').update(appKey + appSecret + timestamp).digest('hex');

    const requestBody = {
      locationCode: planConfig.locationCode,
      packageCode: planConfig.packageCode, // Note: Try changing this key to 'slug' if packageCode is failing
      quantity: 1,
      externalOrderNo: session.id,
      email: customerEmail 
    };

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
      console.log(`[PROVISIONER] Success response for ${session.id}:`, JSON.stringify(esimData));

      const isSuccess = esimData.code === '000000' || esimData.code === 0 || esimData.code === "0";

      return res.status(200).json({
        id: session.id,
        email: customerEmail,
        status: 'completed',
        total: session.amount_total / 100,
        currency: 'USD',
        activationCode: isSuccess ? (esimData.obj?.activationCode || 'PROVISIONED_VIA_EMAIL') : `ERROR: ${esimData.message || 'Unknown Provider Error'} (Code: ${esimData.code})`,
        debug: {
            sentPackage: planConfig.packageCode,
            providerCode: esimData.code
        }
      });

    } catch (esimError) {
      const errorData = esimError.response?.data || { message: esimError.message };
      console.error('[PROVISIONER] API Rejected Request:', JSON.stringify(errorData));
      
      return res.status(200).json({
        id: session.id,
        email: customerEmail,
        status: 'completed', 
        total: session.amount_total / 100,
        currency: 'USD',
        activationCode: `CONNECTION_ERROR: ${errorData.message || 'Check Server Logs'} (Payload: ${planConfig.packageCode})`
      });
    }

  } catch (error) {
    console.error('[SERVER] Fatal Auth Error:', error.message);
    res.status(500).json({ error: 'System handshake failed.' });
  }
}
