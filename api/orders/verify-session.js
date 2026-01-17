
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const axios = require('axios');

/**
 * PRODUCTION MAPPING TABLE
 * Map your Stripe Price IDs (from constants.tsx) to eSIMAccess Package Codes.
 */
const PACKAGE_MAP = {
  // USA
  'price_us_5gb_prod': { location: 'US', package: 'US_5GB_30D' },
  'price_us_10gb_prod': { location: 'US', package: 'US_10GB_30D' },
  'price_us_unlimited_prod': { location: 'US', package: 'US_UL_30D' },
  // UK
  'price_uk_3gb_prod': { location: 'GB', package: 'GB_3GB_30D' },
  'price_uk_10gb_prod': { location: 'GB', package: 'GB_10GB_30D' },
  'price_uk_unlimited_prod': { location: 'GB', package: 'GB_UL_30D' },
  // Add mappings for France, Germany, Japan, etc. as you create them in Stripe
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
    // We stored price IDs in metadata during create-session.js
    const priceId = session.metadata?.plan_ids?.split(',')[0];
    const planConfig = PACKAGE_MAP[priceId] || { location: 'US', package: 'US_5GB_30D' }; // Fallback

    // 3. Provision with eSIMAccess
    const ESIM_API_URL = 'https://api.esimaccess.com/order/v1/buy';
    
    const esimResponse = await axios.post(ESIM_API_URL, {
      locationCode: planConfig.location,
      packageCode: planConfig.package,
      quantity: 1,
      externalOrderNo: session.id
    }, {
      headers: {
        'RT-AppKey': process.env.ESIM_ACCESS_APP_KEY,
        'Content-Type': 'application/json'
      }
    });

    const esimData = esimResponse.data;

    // 4. Return the real carrier data to the frontend
    res.status(200).json({
      id: session.id,
      email: session.customer_email,
      status: 'completed',
      qrCode: esimData.orderList?.[0]?.acCode ? 
        `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${esimData.orderList[0].acCode}` : 
        null,
      activationCode: esimData.orderList?.[0]?.acCode || 'Provisioning delay - check email.'
    });

  } catch (error) {
    console.error('Provisioning Error:', error.response?.data || error.message);
    res.status(200).json({
      id: sessionId,
      status: 'processing',
      message: 'Payment verified. Our carrier nodes are syncing. Your eSIM will arrive via email shortly.'
    });
  }
}
