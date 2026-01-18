
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const axios = require('axios');

/**
 * eSIMAccess Mapping
 * locationCode: ISO alpha-2 country code (e.g., 'US', 'GB')
 * packageCode: Unique identifier from the eSIMAccess catalog.
 */
const PACKAGE_MAP = {
  // Developer Testing
  'price_sandbox_test': { locationCode: 'US', packageCode: 'US_1GB_7D' },
  
  // Production Mapping
  'price_us_5gb_prod': { locationCode: 'US', packageCode: 'US_5GB_30D' },
  'price_us_10gb_prod': { locationCode: 'US', packageCode: 'US_10GB_30D' },
  'price_1SqhSYCPrRzENMHl0tebNgtr': { locationCode: 'US', packageCode: 'PKY3WHPRZ' },
  'price_uk_3gb_prod': { locationCode: 'GB', packageCode: 'GB_3GB_30D' },
  'price_uk_10gb_prod': { locationCode: 'GB', packageCode: 'GB_10GB_30D' },
  'price_uk_unlimited_prod': { locationCode: 'GB', packageCode: 'GB_UL_30D' },
  'price_fr_5gb_prod': { locationCode: 'FR', packageCode: 'FR_5GB_30D' },
  'price_fr_15gb_prod': { locationCode: 'FR', packageCode: 'FR_15GB_30D' },
  'price_fr_unlimited_prod': { locationCode: 'FR', packageCode: 'FR_UL_30D' },
  'price_de_5gb_prod': { locationCode: 'DE', packageCode: 'DE_5GB_30D' },
  'price_de_15gb_prod': { locationCode: 'DE', packageCode: 'DE_15GB_30D' },
  'price_de_unlimited_prod': { locationCode: 'DE', packageCode: 'DE_UL_30D' },
  'price_es_5gb_prod': { locationCode: 'ES', packageCode: 'ES_5GB_30D' },
  'price_es_15gb_prod': { locationCode: 'ES', packageCode: 'ES_15GB_30D' },
  'price_es_unlimited_prod': { locationCode: 'ES', packageCode: 'ES_UL_30D' },
  'price_it_5gb_prod': { locationCode: 'IT', packageCode: 'IT_5GB_30D' },
  'price_it_15gb_prod': { locationCode: 'IT', packageCode: 'IT_15GB_30D' },
  'price_it_unlimited_prod': { locationCode: 'IT', packageCode: 'IT_UL_30D' },
  'price_ca_5gb_prod': { locationCode: 'CA', packageCode: 'CA_5GB_30D' },
  'price_ca_15gb_prod': { locationCode: 'CA', packageCode: 'CA_15GB_30D' },
  'price_ca_unlimited_prod': { locationCode: 'CA', packageCode: 'CA_UL_30D' },
  'price_jp_3gb_prod': { locationCode: 'JP', packageCode: 'JP_3GB_30D' },
  'price_jp_10gb_prod': { locationCode: 'JP', packageCode: 'JP_10GB_30D' },
  'price_jp_unlimited_prod': { locationCode: 'JP', packageCode: 'JP_UL_30D' },
  'price_au_5gb_prod': { locationCode: 'AU', packageCode: 'AU_5GB_30D' },
  'price_au_15gb_prod': { locationCode: 'AU', packageCode: 'AU_15GB_30D' },
  'price_au_unlimited_prod': { locationCode: 'AU', packageCode: 'AU_UL_30D' },
  'price_kr_5gb_prod': { locationCode: 'KR', packageCode: 'KR_5GB_30D' },
  'price_kr_15gb_prod': { locationCode: 'KR', packageCode: 'KR_15GB_30D' },
  'price_kr_unlimited_prod': { locationCode: 'KR', packageCode: 'KR_UL_30D' },
  'price_ie_5gb_prod': { locationCode: 'IE', packageCode: 'IE_5GB_30D' },
  'price_ie_15gb_prod': { locationCode: 'IE', packageCode: 'IE_15GB_30D' },
  'price_ie_unlimited_prod': { locationCode: 'IE', packageCode: 'IE_UL_30D' },
  'price_mx_5gb_prod': { locationCode: 'MX', packageCode: 'MX_5GB_30D' },
  'price_mx_10gb_prod': { locationCode: 'MX', packageCode: 'MX_10GB_30D' },
  'price_mx_unlimited_prod': { locationCode: 'MX', packageCode: 'MX_UL_30D' },
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

    try {
      /**
       * Purchase Request to eSIMAccess
       * Ensures quantity is 1 and externalOrderNo is unique.
       */
      const esimResponse = await axios.post('https://api.esimaccess.com/order/v1/buy', {
        locationCode: planConfig.locationCode,
        packageCode: planConfig.packageCode,
        quantity: 1,
        externalOrderNo: session.id,
        email: customerEmail 
      }, {
        headers: {
          'RT-AppKey': process.env.ESIM_ACCESS_APP_KEY,
          'Content-Type': 'application/json'
        },
        timeout: 15000
      });

      const response = esimResponse.data;
      const isSuccess = response.code === "000000" || response.code === 0;
      
      // Extract activation code (e.g., LPA:1$...) from provider response
      const activationCode = response.obj?.activationCode || 'PROVISIONING_PENDING';

      return res.status(200).json({
        id: session.id,
        email: customerEmail,
        status: 'completed',
        total: session.amount_total / 100,
        currency: 'USD',
        activationCode: isSuccess ? activationCode : 'PROVISIONING_PENDING'
      });

    } catch (esimError) {
      console.error('eSimAccess Provisioning Error:', esimError.response?.data || esimError.message);
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
    console.error('Order Verification Error:', error);
    res.status(500).json({ error: 'Verification error' });
  }
}
