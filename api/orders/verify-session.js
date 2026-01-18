
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

    // If credentials are missing, we immediately move to manual fulfillment to save the UX
    if (!accessCode || !secretKey) {
      console.warn('[INFRASTRUCTURE] Credentials missing. Moving to manual desk.');
      return res.status(200).json({
        id: session.id,
        email: customerEmail,
        status: 'manual_fulfillment',
        message: 'A bespoke specialist is manually securing your asset.'
      });
    }

    const timestamp = Date.now().toString();
    const sign = crypto.createHash('sha256').update(accessCode + secretKey + timestamp).digest('hex');
    const headers = { 'RT-AppKey': accessCode, 'RT-Timestamp': timestamp, 'RT-Sign': sign, 'Content-Type': 'application/json' };

    try {
      // We use a tight 4s timeout to leave room for the rest of the Vercel execution
      const buyResponse = await axios.post('https://api.esimaccess.com/order/v1/buy', {
        locationCode: planConfig.locationCode,
        packageCode: planConfig.packageCode,
        quantity: 1,
        externalOrderNo: session.id,
        email: customerEmail 
      }, { headers, timeout: 4500 });
      
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
        // Log the specific error for the admin, but don't show the user "Error 800101"
        console.error(`[CARRIER-REJECTION] Code: ${buyData.code}, Msg: ${buyData.message}`);
        return res.status(200).json({
          id: session.id,
          email: customerEmail,
          status: 'manual_fulfillment',
          message: 'Security node requiring manual architectural validation.'
        });
      }
    } catch (err) {
      console.warn('[HANDSHAKE-TIMEOUT] Carrier node slow. Routing to manual desk.');
      return res.status(200).json({
        id: session.id,
        email: customerEmail,
        status: 'manual_fulfillment',
        message: 'High-demand node detected. A dedicated specialist is securing your line.'
      });
    }
  } catch (error) {
    res.status(500).json({ error: 'Fatal Handshake Interruption', details: error.message });
  }
}
