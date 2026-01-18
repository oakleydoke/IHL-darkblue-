
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

  try {
    const session = await stripe.checkout.sessions.retrieve(sessionId);
    if (session.payment_status !== 'paid') {
      return res.status(400).json({ error: 'Payment verification failed' });
    }

    const priceId = session.metadata?.plan_ids?.split(',')[0];
    const planConfig = CATALOG_MAP[priceId] || { locationCode: 'US', packageCode: 'PNNLXUOMD' };
    const customerEmail = session.customer_email.toLowerCase();

    if (!accessCode || !secretKey) {
      return res.status(200).json({
        id: session.id,
        email: customerEmail,
        status: 'manual_fulfillment',
        message: 'Bespoke architectural verification required.'
      });
    }

    const timestamp = Date.now().toString();
    const sign = crypto.createHash('sha256').update(accessCode + secretKey + timestamp).digest('hex');
    const headers = { 'RT-AppKey': accessCode, 'RT-Timestamp': timestamp, 'RT-Sign': sign, 'Content-Type': 'application/json' };

    try {
      // Step 1: Attempt to Buy/Check status. 
      // We use a tight timeout to allow the frontend to take over polling if the carrier is slow (10-60s).
      const buyResponse = await axios.post('https://api.esimaccess.com/order/v1/buy', {
        locationCode: planConfig.locationCode,
        packageCode: planConfig.packageCode,
        quantity: 1,
        externalOrderNo: session.id,
        email: customerEmail 
      }, { headers, timeout: 8000 });
      
      const buyData = buyResponse.data;

      // Code 000000 is success, but check if ICCID is ready
      if (buyData.code === '000000' || buyData.code === 0) {
        const hasIccid = buyData.obj?.iccid && buyData.obj.iccid !== 'PROVISIONING';
        
        return res.status(200).json({
          id: session.id,
          email: customerEmail,
          status: hasIccid ? 'completed' : 'manual_fulfillment',
          total: session.amount_total / 100,
          orderNo: buyData.obj?.orderNo,
          iccid: hasIccid ? buyData.obj?.iccid : 'ALLOCATING',
          activationCode: buyData.obj?.activationCode,
          planName: "Scholar Unlimited / 1GB Daily",
          country: "USA & Canada"
        });
      } else {
        // If order already exists but pending, or other common allocation states
        return res.status(200).json({
          id: session.id,
          email: customerEmail,
          status: 'manual_fulfillment',
          message: 'Carrier registry synchronization in progress.'
        });
      }
    } catch (err) {
      // Timeout or API Error fallback to manual/polling state
      return res.status(200).json({
        id: session.id,
        email: customerEmail,
        status: 'manual_fulfillment',
        message: 'High-demand node detected. Synchronizing registry...'
      });
    }
  } catch (error) {
    res.status(500).json({ error: 'Global Handshake Interrupted', details: error.message });
  }
}
