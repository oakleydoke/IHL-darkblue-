
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const axios = require('axios');

/**
 * PRODUCTION MAPPING TABLE
 * Map your Stripe Price IDs to eSIMAccess Package Codes.
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

    // 2. Identify what was purchased from Stripe Metadata
    const priceId = session.metadata?.plan_ids?.split(',')[0];
    const planConfig = PACKAGE_MAP[priceId] || { locationCode: 'US', packageCode: 'US_5GB_30D' };
    const customerEmail = session.customer_email.toLowerCase();

    // 3. Provision with eSIMAccess API
    const ESIM_API_URL = 'https://api.esimaccess.com/order/v1/buy';
    
    try {
      const esimResponse = await axios.post(ESIM_API_URL, {
        locationCode: planConfig.locationCode,
        packageCode: planConfig.packageCode,
        quantity: 1,
        externalOrderNo: session.id,
        email: customerEmail // CRITICAL: This triggers the eSIMAccess automated email to the customer
      }, {
        headers: {
          'RT-AppKey': process.env.ESIM_ACCESS_APP_KEY,
          'Content-Type': 'application/json'
        },
        timeout: 15000
      });

      const esimData = esimResponse.data;

      // Code "000000" or 0 is Success
      const isSuccess = esimData.code === '000000' || esimData.code === 0;

      // 4a. Success Case: Return activation data
      return res.status(200).json({
        id: session.id,
        email: customerEmail,
        status: 'completed',
        items: [],
        total: session.amount_total / 100,
        currency: 'USD',
        activationCode: isSuccess ? (esimData.obj?.activationCode || 'PROVISIONED_VIA_EMAIL') : 'PROVISIONING_PENDING'
      });

    } catch (esimError) {
      console.warn('eSIMAccess Provisioning Delayed:', esimError.message);
      
      // 4b. "Delayed" Success Case: We still return 200 so the UI shows success.
      return res.status(200).json({
        id: session.id,
        email: customerEmail,
        status: 'completed', 
        items: [],
        total: session.amount_total / 100,
        currency: 'USD',
        activationCode: 'PROVISIONING_PENDING',
        isPendingCarrier: true
      });
    }

  } catch (error) {
    console.error('Critical verification error:', error.message);
    res.status(500).json({ error: 'Payment verified. Provisioning logic error.' });
  }
}
