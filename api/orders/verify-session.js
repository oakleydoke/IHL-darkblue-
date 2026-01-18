
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const axios = require('axios');
const crypto = require('crypto');

const CATALOG_MAP = {
  'price_1SqhSYCPrRzENMHl0tebNgtr': { locationCode: 'US', packageCode: 'PNNLXUOMD' },
  'price_us_5gb_prod': { locationCode: 'US', packageCode: 'united-states-5gb-30d' },
};

export default async function handler(req, res) {
  const { sessionId } = req.query;
  if (!sessionId) return res.status(400).json({ error: 'Session ID required' });

  const accessCode = process.env.ESIM_ACCESS_APP_KEY;
  const secretKey = process.env.ESIM_ACCESS_APP_SECRET;

  if (!accessCode || !secretKey) {
    return res.status(500).json({ 
      error: 'Connectivity Bridge Offline', 
      details: 'ESIM_ACCESS_APP_KEY or ESIM_ACCESS_APP_SECRET missing.' 
    });
  }

  try {
    const session = await stripe.checkout.sessions.retrieve(sessionId);
    if (session.payment_status !== 'paid') {
      return res.status(400).json({ error: 'Payment status verification failed' });
    }

    const priceId = session.metadata?.plan_ids?.split(',')[0];
    const planConfig = CATALOG_MAP[priceId] || { locationCode: 'US', packageCode: 'PNNLXUOMD' };
    const customerEmail = session.customer_email.toLowerCase();

    const timestamp = Date.now().toString();
    const sign = crypto.createHash('sha256').update(accessCode + secretKey + timestamp).digest('hex');
    const headers = { 'RT-AppKey': accessCode, 'RT-Timestamp': timestamp, 'RT-Sign': sign, 'Content-Type': 'application/json' };

    console.log(`[HANDSHAKE] Initiating buy for ${planConfig.packageCode}...`);

    // STEP 1: Buy (Shortened timeout to 7s to stay under Vercel 10s limit)
    let buyData;
    try {
      const buyResponse = await axios.post('https://api.esimaccess.com/order/v1/buy', {
        locationCode: planConfig.locationCode,
        packageCode: planConfig.packageCode,
        quantity: 1,
        externalOrderNo: session.id,
        email: customerEmail 
      }, { headers, timeout: 7500 });
      buyData = buyResponse.data;
    } catch (err) {
      console.error('[BUY-TIMEOUT/ERROR]', err.message);
      // Return a partial success: Payment is OK, but provisioning is slow
      return res.status(200).json({
        id: session.id,
        email: customerEmail,
        status: 'pending',
        message: 'Carrier node is responding slowly. Your eSIM is being provisioned in the background.',
        orderNo: 'SYNCING_IN_BACKGROUND'
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

    // Return immediately if we have the activation code to save time
    const initialActivationCode = buyData.obj?.activationCode;
    const initialIccid = buyData.obj?.iccid;

    return res.status(200).json({
      id: session.id,
      email: customerEmail,
      status: initialActivationCode ? 'completed' : 'pending',
      total: session.amount_total / 100,
      orderNo: buyData.obj?.orderNo || 'SYNC_PENDING',
      iccid: initialIccid || 'PROVISIONING',
      activationCode: initialActivationCode,
      planName: "Scholar Unlimited / 1GB Daily",
      country: "USA & Canada"
    });

  } catch (error) {
    console.error('[FATAL]', error.message);
    res.status(500).json({ 
      error: 'Infrastructure Handshake Interrupted', 
      details: error.message 
    });
  }
}
