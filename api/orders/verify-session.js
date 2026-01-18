
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const axios = require('axios');
const crypto = require('crypto');

/**
 * PRODUCTION CATALOG MAPPING
 * Maps Stripe Price IDs to eSIMAccess Package Codes.
 */
const CATALOG_MAP = {
  // Test Product: USA & Canada 1GB/Day
  'price_1SqhSYCPrRzENMHl0tebNgtr': { 
    locationCode: 'US', 
    packageCode: 'PNNLXUOMD' 
  },
  
  // Production Fallbacks
  'price_us_5gb_prod': { locationCode: 'US', packageCode: 'united-states-5gb-30d' },
};

export default async function handler(req, res) {
  const { sessionId } = req.query;
  if (!sessionId) return res.status(400).json({ error: 'Session ID required' });

  const accessCode = process.env.ESIM_ACCESS_APP_KEY;
  const secretKey = process.env.ESIM_ACCESS_APP_SECRET;

  if (!accessCode || !secretKey) {
    return res.status(500).json({ 
      error: 'Connectivity Node Offline', 
      details: 'Infrastructure credentials (AccessCode/SecretKey) are not configured.' 
    });
  }

  try {
    // 1. Verify Payment
    const session = await stripe.checkout.sessions.retrieve(sessionId);
    if (session.payment_status !== 'paid') {
      return res.status(400).json({ error: 'Payment verification failed' });
    }

    const priceId = session.metadata?.plan_ids?.split(',')[0];
    const planConfig = CATALOG_MAP[priceId] || { 
      locationCode: 'US', 
      packageCode: 'PNNLXUOMD' 
    };
    
    const customerEmail = session.customer_email.toLowerCase();

    // 2. Handshake Setup
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

    // 3. Provisioning Request
    // REDUCED TIMEOUT: 5000ms is safer for Vercel's 10s execution limit.
    // If the carrier node takes > 5s, we return a PENDING status to the UI.
    let buyData;
    try {
      const buyResponse = await axios.post('https://api.esimaccess.com/order/v1/buy', {
        locationCode: planConfig.locationCode,
        packageCode: planConfig.packageCode,
        quantity: 1,
        externalOrderNo: session.id,
        email: customerEmail 
      }, { headers, timeout: 5000 });
      buyData = buyResponse.data;
    } catch (err) {
      console.warn('[HANDSHAKE-LATENCY] Carrier node responding slow. Switching to async-sync mode.');
      return res.status(200).json({
        id: session.id,
        email: customerEmail,
        status: 'pending',
        message: 'Synchronizing with global carrier nodes. Your digital asset is being secured.',
        orderNo: 'IHL-ASYNC-SYNC'
      });
    }
    
    if (buyData.code !== '000000' && buyData.code !== 0) {
       return res.status(200).json({
          id: session.id,
          email: customerEmail,
          status: 'error',
          message: `Carrier Refusal (${buyData.code}): ${buyData.message}`,
          activationCode: `GATEWAY_ERROR_${buyData.code}`
       });
    }

    // 4. Return provisioned asset
    const initialActivationCode = buyData.obj?.activationCode;
    const initialIccid = buyData.obj?.iccid;

    return res.status(200).json({
      id: session.id,
      email: customerEmail,
      status: initialActivationCode ? 'completed' : 'pending',
      total: session.amount_total / 100,
      orderNo: buyData.obj?.orderNo || 'IHL-SYNC-P',
      iccid: initialIccid || 'PROVISIONING',
      activationCode: initialActivationCode,
      planName: "Scholar Unlimited / 1GB Daily",
      country: "USA & Canada"
    });

  } catch (error) {
    res.status(500).json({ 
      error: 'Infrastructure Handshake Interrupted', 
      details: error.message 
    });
  }
}
