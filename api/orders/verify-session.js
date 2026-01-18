
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const axios = require('axios');
const crypto = require('crypto');

/**
 * eSIMAccess V1/V2 CATALOG MAPPING
 * Hard-coded PNNLXUOMD for your specific test product.
 */
const CATALOG_MAP = {
  // USA - Map your specific Price ID to the provided Test Product Code
  'price_1SqhSYCPrRzENMHl0tebNgtr': { 
    locationCode: 'US', 
    packageCode: 'PNNLXUOMD' // USA & Canada 1GB/Day
  },
  
  // UK / Others
  'price_us_5gb_prod': { locationCode: 'US', packageCode: 'united-states-5gb-30d' },
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

    // Security Handshake
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

    // STEP 1: Purchase
    const buyResponse = await axios.post('https://api.esimaccess.com/order/v1/buy', {
      locationCode: planConfig.locationCode,
      packageCode: planConfig.packageCode,
      quantity: 1,
      externalOrderNo: session.id,
      email: customerEmail 
    }, { headers, timeout: 15000 });

    const buyData = buyResponse.data;
    
    // Check for "000000" Success code from eSIMAccess
    if (buyData.code !== '000000' && buyData.code !== 0) {
       return res.status(200).json({
          id: session.id,
          email: customerEmail,
          status: 'error',
          message: buyData.message || 'Provisioning Node Refused Handshake',
          activationCode: `GATEWAY_ERROR_${buyData.code}`
       });
    }

    // STEP 2: Query Detailed Manifest (Fetching ICCID)
    const orderNo = buyData.obj?.orderNo;
    const queryResponse = await axios.get(`https://api.esimaccess.com/order/v1/query?orderNo=${orderNo}`, { headers });
    const queryData = queryResponse.data;

    res.status(200).json({
      id: session.id,
      email: customerEmail,
      status: 'completed',
      total: session.amount_total / 100,
      currency: 'USD',
      orderNo: orderNo,
      iccid: queryData.obj?.iccid || 'PENDING',
      activationCode: buyData.obj?.activationCode || queryData.obj?.activationCode,
      planName: "USA & Canada 1GB/Day", // Explicit for the test product
      country: "USA & Canada"
    });

  } catch (error) {
    console.error('[SERVER] Critical Handshake Failure:', error.message);
    res.status(500).json({ error: 'Infrastructure handshake failed' });
  }
}
