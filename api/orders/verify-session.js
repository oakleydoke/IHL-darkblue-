
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const axios = require('axios');

const PACKAGE_MAP = {
  'price_us_5gb_prod': { location: 'US', package: 'US_5GB_30D' },
  'price_us_10gb_prod': { location: 'US', package: 'US_10GB_30D' },
  'price_1SqhSYCPrRzENMHl0tebNgtr': { location: 'US', package: 'PKY3WHPRZ' },
  'price_uk_3gb_prod': { location: 'GB', package: 'GB_3GB_30D' },
  'price_uk_10gb_prod': { location: 'GB', package: 'GB_10GB_30D' },
  'price_uk_unlimited_prod': { location: 'GB', package: 'GB_UL_30D' },
  // ... maps for other regions should be here
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
    const planConfig = PACKAGE_MAP[priceId] || { location: 'US', package: 'US_5GB_30D' };

    console.log(`[Provisioning] Session: ${sessionId} | Plan: ${planConfig.package}`);

    try {
      const esimResponse = await axios.post('https://api.esimaccess.com/order/v1/buy', {
        locationCode: planConfig.location,
        packageCode: planConfig.package,
        quantity: 1,
        externalOrderNo: session.id
      }, {
        headers: {
          'RT-AppKey': process.env.ESIM_ACCESS_APP_KEY,
          'Content-Type': 'application/json'
        },
        timeout: 15000
      });

      const esimResponseData = esimResponse.data;
      const isSuccess = esimResponseData.code === "000000" || esimResponseData.code === 0;
      
      // Dig into nested data for the acCode
      const carrierPayload = esimResponseData.data || {};
      const orderList = carrierPayload.orderList || [];
      const acCode = orderList[0]?.acCode || carrierPayload.acCode;

      if (!isSuccess) {
        throw new Error(`Carrier Error: ${esimResponseData.message}`);
      }

      return res.status(200).json({
        id: session.id,
        email: session.customer_email.toLowerCase(),
        status: 'completed',
        total: session.amount_total / 100,
        currency: 'USD',
        qrCode: acCode ? `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${acCode}` : null,
        activationCode: acCode || 'PROVISIONING_PENDING'
      });

    } catch (esimError) {
      console.warn('[Provisioning Warning] Background carrier sync delayed:', esimError.message);
      return res.status(200).json({
        id: session.id,
        email: session.customer_email.toLowerCase(),
        status: 'completed',
        total: session.amount_total / 100,
        currency: 'USD',
        qrCode: null,
        activationCode: 'PROVISIONING_PENDING',
        isPendingCarrier: true
      });
    }
  } catch (error) {
    res.status(500).json({ error: 'System busy. We are verifying manually.' });
  }
}
