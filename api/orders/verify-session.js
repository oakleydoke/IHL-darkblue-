
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const axios = require('axios');
const crypto = require('crypto');

/**
 * PRODUCTION MAPPING TABLE
 * Maps Stripe Price IDs to eSIMAccess Catalog Codes.
 */
const PACKAGE_MAP = {
  // Test/Sandbox Code
  'price_sandbox_test': { locationCode: 'US', packageCode: 'US_1GB_7D' },

  // USA
  'price_us_5gb_prod': { locationCode: 'US', packageCode: 'US_5GB_30D' },
  'price_us_10gb_prod': { locationCode: 'US', packageCode: 'US_10GB_30D' },
  'price_1SqhSYCPrRzENMHl0tebNgtr': { locationCode: 'US', packageCode: 'US_3_Daily' },
  
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
    // 1. Verify payment with Stripe
    const session = await stripe.checkout.sessions.retrieve(sessionId);
    
    if (session.payment_status !== 'paid') {
      return res.status(400).json({ error: 'Payment not completed' });
    }

    // 2. Identify what was purchased
    const priceId = session.metadata?.plan_ids?.split(',')[0];
    const planConfig = PACKAGE_MAP[priceId] || { locationCode: 'US', packageCode: 'US_5GB_30D' };
    const customerEmail = session.customer_email.toLowerCase();

    // 3. Prepare eSIMAccess Security Headers
    const appKey = process.env.ESIM_ACCESS_APP_KEY;
    const appSecret = process.env.ESIM_ACCESS_APP_SECRET; // REQUIRED: Found in portal settings
    const timestamp = Date.now().toString();
    
    // RT-Sign = SHA256(AppKey + AppSecret + Timestamp)
    const sign = crypto
      .createHash('sha256')
      .update(appKey + appSecret + timestamp)
      .digest('hex');

    // 4. Provision with eSIMAccess API
    const ESIM_API_URL = 'https://api.esimaccess.com/order/v1/buy';
    
    try {
      const esimResponse = await axios.post(ESIM_API_URL, {
        locationCode: planConfig.locationCode,
        packageCode: planConfig.packageCode,
        quantity: 1,
        externalOrderNo: session.id, // Must be unique
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
      
      // LOGS: Essential for debugging in production logs
      console.log(`eSIMAccess Response for Order ${session.id}:`, JSON.stringify(esimData));

      // Code "000000" or 0 is Success
      const isSuccess = esimData.code === '000000' || esimData.code === 0 || esimData.code === "0";

      return res.status(200).json({
        id: session.id,
        email: customerEmail,
        status: 'completed',
        total: session.amount_total / 100,
        currency: 'USD',
        // Activation code typically looks like: LPA:1$SM-DP.GSMA.COM$XXXXX
        activationCode: isSuccess ? (esimData.obj?.activationCode || 'PROVISIONED_VIA_EMAIL') : 'PROVISIONING_PENDING'
      });

    } catch (esimError) {
      // Capture the exact rejection reason (e.g., "Invalid Signature", "No Balance", "Package Not Found")
      const errorDetail = esimError.response?.data || esimError.message;
      console.error('CRITICAL: eSIMAccess API Rejection:', JSON.stringify(errorDetail));
      
      return res.status(200).json({
        id: session.id,
        email: customerEmail,
        status: 'completed', 
        total: session.amount_total / 100,
        currency: 'USD',
        activationCode: 'PROVISIONING_PENDING'
      });
    }

  } catch (error) {
    console.error('Verify Session Logic Error:', error.message);
    res.status(500).json({ error: 'Server node error during verification.' });
  }
}
