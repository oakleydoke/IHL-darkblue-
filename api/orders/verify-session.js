
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const axios = require('axios');
const crypto = require('crypto');

/**
 * PRODUCTION MAPPING TABLE
 * Map your Stripe Price IDs to your SUBSCRIBED eSIMAccess Package Codes.
 */
const PACKAGE_MAP = {
  // Sandbox / Testing
  'price_sandbox_test': { locationCode: 'US', packageCode: 'US_1GB_7D' },

  // USA - Ensure these are "Subscribed" in your portal
  'price_us_5gb_prod': { locationCode: 'US', packageCode: 'US_5GB_30D' },
  'price_us_10gb_prod': { locationCode: 'US', packageCode: 'US_10GB_30D' },
  'price_1SqhSYCPrRzENMHl0tebNgtr': { locationCode: 'US', packageCode: 'USCA-2_1_Daily' },
  
  // UK
  'price_uk_3gb_prod': { locationCode: 'GB', packageCode: 'GB_3GB_30D' },
  'price_uk_10gb_prod': { locationCode: 'GB', packageCode: 'GB_10GB_30D' },
  'price_uk_unlimited_prod': { locationCode: 'GB', packageCode: 'GB_UL_30D' },
};

export default async function handler(req, res) {
  const { sessionId } = req.query;

  if (!sessionId) {
    return res.status(400).json({ error: 'Session ID required' });
  }

  try {
    const session = await stripe.checkout.sessions.retrieve(sessionId);
    if (session.payment_status !== 'paid') {
      return res.status(400).json({ error: 'Payment not completed' });
    }

    const priceId = session.metadata?.plan_ids?.split(',')[0];
    const planConfig = PACKAGE_MAP[priceId] || { locationCode: 'US', packageCode: 'US_5GB_30D' };
    const customerEmail = session.customer_email.toLowerCase();

    // Security Headers
    const appKey = process.env.ESIM_ACCESS_APP_KEY;
    const appSecret = process.env.ESIM_ACCESS_APP_SECRET;
    const timestamp = Date.now().toString();
    const sign = crypto.createHash('sha256').update(appKey + appSecret + timestamp).digest('hex');

    try {
      const esimResponse = await axios.post('https://api.esimaccess.com/order/v1/buy', {
        locationCode: planConfig.locationCode,
        packageCode: planConfig.packageCode,
        quantity: 1,
        externalOrderNo: session.id,
        email: customerEmail 
      }, {
        headers: {
          'RT-AppKey': appKey,
          'RT-Timestamp': timestamp,
          'RT-Sign': sign,
          'Content-Type': 'application/json'
        },
        timeout: 15000
      });

      const esimData = esimResponse.data;
      console.log(`eSIMAccess Result [${session.id}]:`, JSON.stringify(esimData));

      const isSuccess = esimData.code === '000000' || esimData.code === 0 || esimData.code === "0";

      return res.status(200).json({
        id: session.id,
        email: customerEmail,
        status: 'completed',
        total: session.amount_total / 100,
        currency: 'USD',
        // If it failed, we return the error message so you can see it in the UI
        activationCode: isSuccess ? (esimData.obj?.activationCode || 'PROVISIONED_VIA_EMAIL') : `ERROR: ${esimData.message || 'Unknown Provider Error'}`
      });

    } catch (esimError) {
      const errorDetail = esimError.response?.data || { message: esimError.message };
      console.error('eSIMAccess API Fatal:', JSON.stringify(errorDetail));
      
      return res.status(200).json({
        id: session.id,
        email: customerEmail,
        status: 'completed', 
        total: session.amount_total / 100,
        currency: 'USD',
        activationCode: `CONNECTION_ERROR: ${errorDetail.message || 'Check Server Logs'}`
      });
    }

  } catch (error) {
    console.error('Verification System Error:', error.message);
    res.status(500).json({ error: 'Payment verified, but provisioning system is offline.' });
  }
}
