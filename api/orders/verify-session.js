
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const axios = require('axios');
const crypto = require('crypto');

/**
 * eSIMAccess V1/V2 CATALOG MAPPING
 * Mapping Stripe Price IDs to eSIMAccess Package Codes.
 */
const CATALOG_MAP = {
  // Your Test Product: USA & Canada 1GB/Day
  'price_1SqhSYCPrRzENMHl0tebNgtr': { 
    locationCode: 'US', 
    packageCode: 'PNNLXUOMD' 
  },
  
  // Example Production Fallbacks
  'price_us_5gb_prod': { locationCode: 'US', packageCode: 'united-states-5gb-30d' },
};

export default async function handler(req, res) {
  const { sessionId } = req.query;
  if (!sessionId) return res.status(400).json({ error: 'Session ID required' });

  // Map eSIMAccess Credentials
  // AccessCode -> ESIM_ACCESS_APP_KEY
  // SecretKey  -> ESIM_ACCESS_APP_SECRET
  const accessCode = process.env.ESIM_ACCESS_APP_KEY;
  const secretKey = process.env.ESIM_ACCESS_APP_SECRET;

  if (!accessCode || !secretKey) {
    console.error('[CRITICAL] Missing eSIMAccess Credentials in Environment Variables.');
    return res.status(500).json({ 
      error: 'Connectivity Bridge Offline', 
      details: 'ESIM_ACCESS_APP_KEY (AccessCode) or ESIM_ACCESS_APP_SECRET (SecretKey) is missing from server configuration.' 
    });
  }

  try {
    // 1. Verify Payment Session
    const session = await stripe.checkout.sessions.retrieve(sessionId);
    if (session.payment_status !== 'paid') {
      return res.status(400).json({ error: 'Payment status verification failed' });
    }

    const priceId = session.metadata?.plan_ids?.split(',')[0];
    
    // Default to the specific test product PNNLXUOMD if no mapping found
    const planConfig = CATALOG_MAP[priceId] || { 
      locationCode: 'US', 
      packageCode: 'PNNLXUOMD' 
    };
    
    const customerEmail = session.customer_email.toLowerCase();

    // 2. Generate Security Signature for eSIMAccess
    const timestamp = Date.now().toString();
    const sign = crypto.createHash('sha256')
      .update(accessCode + secretKey + timestamp)
      .digest('hex');

    const headers = {
      'RT-AppKey': accessCode,
      'RT-Timestamp': timestamp,
      'RT-Sign': sign,
      'Content-Type': 'application/json'
    };

    console.log(`[PROVISIONING] Handshake started for ${planConfig.packageCode} -> ${customerEmail}`);

    // 3. Purchase Request (Step 1)
    const buyResponse = await axios.post('https://api.esimaccess.com/order/v1/buy', {
      locationCode: planConfig.locationCode,
      packageCode: planConfig.packageCode,
      quantity: 1,
      externalOrderNo: session.id,
      email: customerEmail 
    }, { headers, timeout: 25000 });

    const buyData = buyResponse.data;
    
    // Check for success code (000000)
    if (buyData.code !== '000000' && buyData.code !== 0) {
       console.error(`[CARRIER-ERROR] Code: ${buyData.code}, Msg: ${buyData.message}`);
       return res.status(200).json({
          id: session.id,
          email: customerEmail,
          status: 'error',
          message: `Carrier Refusal (${buyData.code}): ${buyData.message}`,
          activationCode: `GATEWAY_ERROR_${buyData.code}`
       });
    }

    // 4. Fetch Detailed Manifest for ICCID (Step 2)
    const orderNo = buyData.obj?.orderNo;
    let queryData = { obj: {} };
    
    try {
      const queryResponse = await axios.get(`https://api.esimaccess.com/order/v1/query?orderNo=${orderNo}`, { headers, timeout: 10000 });
      queryData = queryResponse.data;
    } catch (e) {
      console.warn(`[QUERY-WARN] Real-time ICCID fetch delayed. Order: ${orderNo}`);
    }

    return res.status(200).json({
      id: session.id,
      email: customerEmail,
      status: 'completed',
      total: session.amount_total / 100,
      currency: 'USD',
      orderNo: orderNo || 'SYNC_PENDING',
      iccid: queryData.obj?.iccid || buyData.obj?.iccid || 'PROVISIONING',
      activationCode: buyData.obj?.activationCode || queryData.obj?.activationCode,
      planName: "Scholar Unlimited / 1GB Daily",
      country: "USA & Canada"
    });

  } catch (error) {
    console.error('[GATEWAY-FATAL]', error.message);
    res.status(500).json({ 
      error: 'Infrastructure Handshake Timeout', 
      details: 'The carrier node took too long to respond. Please check your dashboard.' 
    });
  }
}
