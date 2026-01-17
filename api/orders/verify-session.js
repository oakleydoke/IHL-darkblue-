
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const axios = require('axios');

const PACKAGE_MAP = {
  'price_us_5gb_prod': { location: 'US', package: 'US_5GB_30D' },
  'price_us_10gb_prod': { location: 'US', package: 'US_10GB_30D' },
  'price_1SqhSYCPrRzENMHl0tebNgtr': { location: 'US', package: 'PKY3WHPRZ' },
  'price_uk_3gb_prod': { location: 'GB', package: 'GB_3GB_30D' },
  'price_uk_10gb_prod': { location: 'GB', package: 'GB_10GB_30D' },
  'price_uk_unlimited_prod': { location: 'GB', package: 'GB_UL_30D' },
  'price_fr_5gb_prod': { location: 'FR', package: 'FR_5GB_30D' },
  'price_fr_15gb_prod': { location: 'FR', package: 'FR_15GB_30D' },
  'price_fr_unlimited_prod': { location: 'FR', package: 'FR_UL_30D' },
  'price_de_5gb_prod': { location: 'DE', package: 'DE_5GB_30D' },
  'price_de_15gb_prod': { location: 'DE', package: 'DE_15GB_30D' },
  'price_de_unlimited_prod': { location: 'DE', package: 'DE_UL_30D' },
  'price_es_5gb_prod': { location: 'ES', package: 'ES_5GB_30D' },
  'price_es_15gb_prod': { location: 'ES', package: 'ES_15GB_30D' },
  'price_es_unlimited_prod': { location: 'ES', package: 'ES_UL_30D' },
  'price_it_5gb_prod': { location: 'IT', package: 'IT_5GB_30D' },
  'price_it_15gb_prod': { location: 'IT', package: 'IT_15GB_30D' },
  'price_it_unlimited_prod': { location: 'IT', package: 'IT_UL_30D' },
  'price_ca_5gb_prod': { location: 'CA', package: 'CA_5GB_30D' },
  'price_ca_15gb_prod': { location: 'CA', package: 'CA_15GB_30D' },
  'price_ca_unlimited_prod': { location: 'CA', package: 'CA_UL_30D' },
  'price_jp_3gb_prod': { location: 'JP', package: 'JP_3GB_30D' },
  'price_jp_10gb_prod': { location: 'JP', package: 'JP_10GB_30D' },
  'price_jp_unlimited_prod': { location: 'JP', package: 'JP_UL_30D' },
  'price_au_5gb_prod': { location: 'AU', package: 'AU_5GB_30D' },
  'price_au_15gb_prod': { location: 'AU', package: 'AU_15GB_30D' },
  'price_au_unlimited_prod': { location: 'AU', package: 'AU_UL_30D' },
  'price_kr_5gb_prod': { location: 'KR', package: 'KR_5GB_30D' },
  'price_kr_15gb_prod': { location: 'KR', package: 'KR_15GB_30D' },
  'price_kr_unlimited_prod': { location: 'KR', package: 'KR_UL_30D' },
  'price_ie_5gb_prod': { location: 'IE', package: 'IE_5GB_30D' },
  'price_ie_15gb_prod': { location: 'IE', package: 'IE_15GB_30D' },
  'price_ie_unlimited_prod': { location: 'IE', package: 'IE_UL_30D' },
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
    const session = await stripe.checkout.sessions.retrieve(sessionId);
    if (session.payment_status !== 'paid') {
      return res.status(400).json({ error: 'Payment not completed' });
    }

    const priceId = session.metadata?.plan_ids?.split(',')[0];
    const planConfig = PACKAGE_MAP[priceId] || { location: 'US', package: 'US_5GB_30D' };
    const customerEmail = session.customer_email.toLowerCase();

    try {
      // We pass the email to eSIMAccess so their system can handle automated delivery
      const esimResponse = await axios.post('https://api.esimaccess.com/order/v1/buy', {
        locationCode: planConfig.location,
        packageCode: planConfig.package,
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

      return res.status(200).json({
        id: session.id,
        email: customerEmail,
        status: 'completed',
        total: session.amount_total / 100,
        currency: 'USD',
        // We no longer return the QR code to the UI to focus on email delivery
        activationCode: isSuccess ? 'PROVISIONED_VIA_EMAIL' : 'PROVISIONING_PENDING'
      });

    } catch (esimError) {
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
    res.status(500).json({ error: 'Verification error' });
  }
}
