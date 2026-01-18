
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
  
  // Production Fallbacks (Ensure these are favorited in eSIMAccess portal)
  'price_us_5gb_prod': { locationCode: 'US', packageCode: 'united-states-5gb-30d' },
};

export default async function handler(req, res) {
  const { sessionId } = req.query;
  if (!sessionId) return res.status(400).json({ error: 'Session ID required' });

  // AccessCode (eSIMAccess) -> ESIM_ACCESS_APP_KEY
  // SecretKey (eSIMAccess) -> ESIM_ACCESS_APP_SECRET
  const accessCode = process.env.ESIM_ACCESS_APP_KEY;
  const secretKey = process.env.ESIM_ACCESS_APP_SECRET;

  if (!accessCode || !secretKey) {
    console.error('[CRITICAL] Missing eSIMAccess Credentials (AccessCode/SecretKey)');
    return res.status(500).json({ 
      error: 'Connectivity Node Offline', 
      details: 'Environment variables ESIM_ACCESS_APP_KEY or ESIM_ACCESS_APP_SECRET are not configured.' 
    });
  }

  try {
    // 1. Verify Payment Authenticity
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

    // 2. Security Handshake Generation
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

    console.log(`[HANDSHAKE] Provisioning ${planConfig.packageCode} for ${customerEmail}`);

    // 3. Carrier Provisioning (Short timeout to stay within Vercel's 10s limit)
    let buyData;
    try {
      const buyResponse = await axios.post('https://api.esimaccess.com/order/v1/buy', {
        locationCode: planConfig.locationCode,
        packageCode: planConfig.packageCode,
        quantity: 1,
        externalOrderNo: session.id,
        email: customerEmail 
      }, { headers, timeout: 6500 });
      buyData = buyResponse.data;
    } catch (err) {
      console.warn('[PROVISIONING-DELAY] Carrier node slow. Returning PENDING state.');
      return res.status(200).json({
        id: session.id,
        email: customerEmail,
        status: 'pending',
        message: 'Carrier synchronization in progress. Your digital asset will appear shortly.',
        orderNo: 'SYNCING_IN_BACKGROUND'
      });
    }
    
    // Handle Provider-level Errors (e.g., Insufficient Balance, Non-favorited package)
    if (buyData.code !== '000000' && buyData.code !== 0) {
       console.error(`[CARRIER-ERROR] ${buyData.code}: ${buyData.message}`);
       return res.status(200).json({
          id: session.id,
          email: customerEmail,
          status: 'error',
          message: `Provider Node Refusal (${buyData.code}): ${buyData.message}`,
          activationCode: `GATEWAY_ERROR_${buyData.code}`
       });
    }

    // 4. Finalize Manifest
    const initialActivationCode = buyData.obj?.activationCode;
    const initialIccid = buyData.obj?.iccid;

    return res.status(200).json({
      id: session.id,
      email: customerEmail,
      status: initialActivationCode ? 'completed' : 'pending',
      total: session.amount_total / 100,
      currency: 'USD',
      orderNo: buyData.obj?.orderNo || 'IHL-SYNC-P',
      iccid: initialIccid || 'PROVISIONING',
      activationCode: initialActivationCode,
      planName: "Scholar Unlimited / 1GB Daily",
      country: "USA & Canada"
    });

  } catch (error) {
    console.error('[INFRASTRUCTURE-FATAL]', error.message);
    res.status(500).json({ 
      error: 'Global Node Handshake Interrupted', 
      details: error.message 
    });
  }
}
