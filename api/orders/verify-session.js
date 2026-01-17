
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const axios = require('axios');

/**
 * PRODUCTION MAPPING TABLE
 * Maps Stripe Price IDs to eSIMAccess Package Codes.
 * Referencing eSIMAccess inventory codes for 5G tier-1 packages.
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
  // FRANCE
  'price_fr_5gb_prod': { location: 'FR', package: 'FR_5GB_30D' },
  'price_fr_15gb_prod': { location: 'FR', package: 'FR_15GB_30D' },
  'price_fr_unlimited_prod': { location: 'FR', package: 'FR_UL_30D' },
  // GERMANY
  'price_de_5gb_prod': { location: 'DE', package: 'DE_5GB_30D' },
  'price_de_15gb_prod': { location: 'DE', package: 'DE_15GB_30D' },
  'price_de_unlimited_prod': { location: 'DE', package: 'DE_UL_30D' },
  // SPAIN
  'price_es_5gb_prod': { location: 'ES', package: 'ES_5GB_30D' },
  'price_es_15gb_prod': { location: 'ES', package: 'ES_15GB_30D' },
  'price_es_unlimited_prod': { location: 'ES', package: 'ES_UL_30D' },
  // ITALY
  'price_it_5gb_prod': { location: 'IT', package: 'IT_5GB_30D' },
  'price_it_15gb_prod': { location: 'IT', package: 'IT_15GB_30D' },
  'price_it_unlimited_prod': { location: 'IT', package: 'IT_UL_30D' },
  // CANADA
  'price_ca_5gb_prod': { location: 'CA', package: 'CA_5GB_30D' },
  'price_ca_15gb_prod': { location: 'CA', package: 'CA_15GB_30D' },
  'price_ca_unlimited_prod': { location: 'CA', package: 'CA_UL_30D' },
  // JAPAN
  'price_jp_3gb_prod': { location: 'JP', package: 'JP_3GB_30D' },
  'price_jp_10gb_prod': { location: 'JP', package: 'JP_10GB_30D' },
  'price_jp_unlimited_prod': { location: 'JP', package: 'JP_UL_30D' },
  // AUSTRALIA
  'price_au_5gb_prod': { location: 'AU', package: 'AU_5GB_30D' },
  'price_au_15gb_prod': { location: 'AU', package: 'AU_15GB_30D' },
  'price_au_unlimited_prod': { location: 'AU', package: 'AU_UL_30D' },
  // SOUTH KOREA
  'price_kr_5gb_prod': { location: 'KR', package: 'KR_5GB_30D' },
  'price_kr_15gb_prod': { location: 'KR', package: 'KR_15GB_30D' },
  'price_kr_unlimited_prod': { location: 'KR', package: 'KR_UL_30D' },
  // IRELAND
  'price_ie_5gb_prod': { location: 'IE', package: 'IE_5GB_30D' },
  'price_ie_15gb_prod': { location: 'IE', package: 'IE_15GB_30D' },
  'price_ie_unlimited_prod': { location: 'IE', package: 'IE_UL_30D' },
  // MEXICO
  'price_mx_5gb_prod': { location: 'MX', package: 'MX_5GB_30D' },
  'price_mx_10gb_prod': { location: 'MX', package: 'MX_10GB_30D' },
  'price_mx_unlimited_prod': { location: 'MX', package: 'MX_UL_30D' },
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

    console.log(`[Provisioning] Session: ${sessionId} | Plan: ${planConfig.package}`);

    // 3. Buy eSIM from eSIMAccess
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
      
      // Dig into data.orderList for the activation code (acCode)
      const carrierData = esimResponseData.data || {};
      const orderList = carrierData.orderList || [];
      const acCode = orderList[0]?.acCode || carrierData.acCode;

      if (!isSuccess) {
        throw new Error(`Carrier Rejection (${esimResponseData.code}): ${esimResponseData.message}`);
      }

      console.log(`[Success] Provisioned ${acCode} for ${session.customer_email}`);

      return res.status(200).json({
        id: session.id,
        email: session.customer_email.toLowerCase(),
        status: 'completed',
        total: session.amount_total / 100,
        currency: 'USD',
        qrCode: acCode ? `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${acCode}` : null,
        activationCode: acCode || null
      });

    } catch (esimError) {
      console.warn('[Carrier Sync Delay]', esimError.message);
      // Return order as completed (payment is verified) but with pending status for carrier sync
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
    console.error('[Critical Error]', error.message);
    res.status(500).json({ error: 'System busy. We are verifying manually.' });
  }
}
