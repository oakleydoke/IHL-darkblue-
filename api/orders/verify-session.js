
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
  'price_1SqhSYCPrRzENMHl0tebNgtr': { location: 'US', package: 'PKY3WHPRZ' }, // Fixed ID to match constants.tsx
  // UK
  'price_uk_3gb_prod': { location: 'GB', package: 'GB_3GB_30D' },
  'price_uk_10gb_prod': { location: 'GB', package: 'GB_10GB_30D' },
  'price_uk_unlimited_prod': { location: 'GB', package: 'GB_UL_30D' },
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
    const planConfig = PACKAGE_MAP[priceId] || { location: 'US', package: 'US_5GB_30D' };

    // 3. Provision with eSIMAccess
    const ESIM_API_URL = 'https://api.esimaccess.com/order/v1/buy';
    
    try {
      const esimResponse = await axios.post(ESIM_API_URL, {
        locationCode: planConfig.location,
        packageCode: planConfig.package,
        quantity: 1,
        externalOrderNo: session.id
      }, {
        headers: {
          'RT-AppKey': process.env.ESIM_ACCESS_APP_KEY,
          'Content-Type': 'application/json'
        },
        timeout: 10000
      });

      const esimData = esimResponse.data;

      // 4a. Success Case: Return the real carrier data
      return res.status(200).json({
        id: session.id,
        email: session.customer_email,
        status: 'completed',
        items: [], // Optional: add logic to reconstruct items if needed for UI
        total: session.amount_total / 100,
        currency: 'USD',
        qrCode: esimData.orderList?.[0]?.acCode ? 
          `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${esimData.orderList[0].acCode}` : 
          null,
        activationCode: esimData.orderList?.[0]?.acCode || null
      });

    } catch (esimError) {
      console.warn('eSIMAccess Provisioning Delayed (Likely Credit/API issue):', esimError.message);
      
      // 4b. "Pending" Success Case: Payment is confirmed, so we MUST return a valid Order object
      // so the frontend moves to the confirmation page instead of staying on home.
      return res.status(200).json({
        id: session.id,
        email: session.customer_email,
        status: 'completed', // We mark as completed because payment IS done
        items: [],
        total: session.amount_total / 100,
        currency: 'USD',
        qrCode: null, // UI handles null by showing "Provisioning" state
        activationCode: 'PENDING_PROVISIONING',
        isPendingCarrier: true
      });
    }

  } catch (error) {
    console.error('Stripe Session Retrieval Error:', error.message);
    res.status(500).json({ error: 'Internal system error verifying session.' });
  }
}
