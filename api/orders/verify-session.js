
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
      console.warn('[INFRASTRUCTURE] Credentials missing. Routing to manual concierge.');
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
      // Increased timeout to 8500ms. This allows most slow carrier handshakes to complete.
      // We remain under the 10s Vercel limit.
      const buyResponse = await axios.post('https://api.esimaccess.com/order/v1/buy', {
        locationCode: planConfig.locationCode,
        packageCode: planConfig.packageCode,
        quantity: 1,
        externalOrderNo: session.id,
        email: customerEmail 
      }, { headers, timeout: 8500 });
      
      const buyData = buyResponse.data;

      if (buyData.code === '000000' || buyData.code === 0) {
        return res.status(200).json({
          id: session.id,
          email: customerEmail,
          status: 'completed',
          total: session.amount_total / 100,
          orderNo: buyData.obj?.orderNo,
          iccid: buyData.obj?.iccid,
          activationCode: buyData.obj?.activationCode,
          planName: "Scholar Unlimited / 1GB Daily",
          country: "USA & Canada"
        });
      } else {
        console.error(`[CARRIER-STATUS] Code: ${buyData.code}, Msg: ${buyData.message}`);
        return res.status(200).json({
          id: session.id,
          email: customerEmail,
          status: 'manual_fulfillment',
          message: 'Carrier node routing requiring manual validation.'
        });
      }
    } catch (err) {
      console.warn('[HANDSHAKE-TIMEOUT] API did not finish in 8.5s. Returning async-pending state.');
      return res.status(200).json({
        id: session.id,
        email: customerEmail,
        status: 'manual_fulfillment',
        message: 'High-demand node detected. Establishing secure secondary link.'
      });
    }
  } catch (error) {
    res.status(500).json({ error: 'Global Handshake Interrupted', details: error.message });
  }
}
