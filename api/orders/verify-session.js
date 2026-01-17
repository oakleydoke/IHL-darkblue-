
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const axios = require('axios');

/**
 * PRODUCTION MAPPING TABLE
 * Maps Stripe Price IDs to eSIMAccess Package Codes.
 */
const PACKAGE_MAP = {
  // USA
  'price_us_5gb_prod': { location: 'US', package: 'US_5GB_30D' },
  'price_us_10gb_prod': { location: 'US', package: 'US_10GB_30D' },
  'price_1SqhSYCPrRzENMHl0tebNgtr': { location: 'US', package: 'PKY3WHPRZ' }, // Academic Unlimited
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

    console.log(`[Provisioning] Session: ${sessionId} | Price: ${priceId} | Pkg: ${planConfig.package}`);

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
        timeout: 12000 // Slightly longer timeout for carrier sync
      });

      const esimData = esimResponse.data;
      console.log(`[Carrier Response] Code: ${esimData.code} | Msg: ${esimData.message}`);

      // eSIMAccess usually returns "000000" as a string on success
      const isSuccess = esimData.code === "000000" || esimData.code === 0;

      if (!isSuccess) {
          throw new Error(`Carrier Rejection: ${esimData.message || 'Unknown provider error'}`);
      }

      // 4a. Success Case: Return the real carrier data
      return res.status(200).json({
        id: session.id,
        email: session.customer_email,
        status: 'completed',
        items: [], // Reconstructed on frontend
        total: session.amount_total / 100,
        currency: 'USD',
        qrCode: esimData.orderList?.[0]?.acCode ? 
          `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${esimData.orderList[0].acCode}` : 
          null,
        activationCode: esimData.orderList?.[0]?.acCode || null
      });

    } catch (esimError) {
      console.warn('[Provisioning Alert] Background sync delayed:', esimError.message);
      
      // 4b. "Pending" Success Case: Payment is confirmed, UI must move forward.
      return res.status(200).json({
        id: session.id,
        email: session.customer_email,
        status: 'completed', 
        items: [],
        total: session.amount_total / 100,
        currency: 'USD',
        qrCode: null, 
        activationCode: 'PROVISIONING_PENDING',
        isPendingCarrier: true
      });
    }

  } catch (error) {
    console.error('[Critical Error] Session verification failed:', error.message);
    res.status(500).json({ error: 'System busy. We are verifying your order manually.' });
  }
}
