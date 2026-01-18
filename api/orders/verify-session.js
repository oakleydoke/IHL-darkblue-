
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const axios = require('axios');
const crypto = require('crypto');

const CATALOG_MAP = {
  'price_us_5gb_prod': { locationCode: 'US', packageCode: 'united-states-5gb-30d' },
  'price_us_10gb_prod': { locationCode: 'US', packageCode: 'united-states-10gb-30d' },
  'price_1SqhSYCPrRzENMHl0tebNgtr': { locationCode: 'US', packageCode: 'united-states-unlimited-daily' },
  'price_uk_3gb_prod': { locationCode: 'GB', packageCode: 'united-kingdom-3gb-30d' },
  'price_uk_10gb_prod': { locationCode: 'GB', packageCode: 'united-kingdom-10gb-30d' },
  'price_uk_unlimited_prod': { locationCode: 'GB', packageCode: 'united-kingdom-unlimited-30d' },
};

export default async function handler(req, res) {
  const { sessionId } = req.query;
  if (!sessionId) return res.status(400).json({ error: 'Session ID required' });

  try {
    const session = await stripe.checkout.sessions.retrieve(sessionId);
    if (session.payment_status !== 'paid') {
      return res.status(400).json({ error: 'Payment not completed' });
    }

    const priceId = session.metadata?.plan_ids?.split(',')[0];
    const planConfig = CATALOG_MAP[priceId] || { locationCode: 'US', packageCode: 'united-states-5gb-30d' };
    const customerEmail = session.customer_email.toLowerCase();

    const appKey = process.env.ESIM_ACCESS_APP_KEY;
    const appSecret = process.env.ESIM_ACCESS_APP_SECRET;
    const timestamp = Date.now().toString();
    const sign = crypto.createHash('sha256').update(appKey + appSecret + timestamp).digest('hex');

    const headers = {
      'RT-AppKey': appKey,
      'RT-Timestamp': timestamp,
      'RT-Sign': sign,
      'Content-Type': 'application/json'
    };

    // STAGE 1: Purchase Order
    const buyResponse = await axios.post('https://api.esimaccess.com/order/v1/buy', {
      locationCode: planConfig.locationCode,
      packageCode: planConfig.packageCode,
      quantity: 1,
      externalOrderNo: session.id,
      email: customerEmail 
    }, { headers, timeout: 15000 });

    const buyData = buyResponse.data;
    
    if (buyData.code !== '000000' && buyData.code !== 0) {
       return res.status(200).json({
          status: 'error',
          message: buyData.message || 'Provider Rejected Order',
          activationCode: `ERROR: ${buyData.code}`
       });
    }

    // STAGE 2: Query Order Details (To get ICCID and detailed status)
    const orderNo = buyData.obj?.orderNo;
    const queryResponse = await axios.get(`https://api.esimaccess.com/order/v1/query?orderNo=${orderNo}`, { headers });
    const queryData = queryResponse.data;

    return res.status(200).json({
      id: session.id,
      email: customerEmail,
      status: 'completed',
      total: session.amount_total / 100,
      currency: 'USD',
      orderNo: orderNo,
      iccid: queryData.obj?.iccid || 'PENDING',
      activationCode: buyData.obj?.activationCode || queryData.obj?.activationCode,
      planName: planConfig.packageCode,
      country: planConfig.locationCode
    });

  } catch (error) {
    console.error('[SERVER] Fatal:', error.message);
    res.status(500).json({ error: 'System processing failure.' });
  }
}
