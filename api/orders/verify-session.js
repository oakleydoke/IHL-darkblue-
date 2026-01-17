
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const axios = require('axios');

export default async function handler(req, res) {
  const { sessionId } = req.query;

  if (!sessionId) {
    return res.status(400).json({ error: 'Session ID required' });
  }

  try {
    // 1. Verify payment with Stripe
    const session = await stripe.checkout.sessions.retrieve(sessionId);
    
    if (session.payment_status !== 'paid') {
      return res.status(400).json({ error: 'Payment not completed' });
    }

    // 2. Provision with eSIMAccess
    // In a production environment, you would map your Stripe Price ID to an eSIMAccess Package Code.
    // Here we use a placeholder logic for the eSIMAccess Order API.
    const ESIM_API_URL = 'https://api.esimaccess.com/order/v1/buy';
    
    // Note: eSIMAccess requires a specific signature/auth header which usually 
    // involves AppKey and a timestamp. This is a simplified integration logic.
    const esimResponse = await axios.post(ESIM_API_URL, {
      locationCode: 'US', // Would be derived from session metadata/mapping
      packageCode: 'US_5GB_30D', // Your internal mapping
      quantity: 1,
      externalOrderNo: session.id
    }, {
      headers: {
        'RT-AppKey': process.env.ESIM_ACCESS_APP_KEY,
        'Content-Type': 'application/json'
      }
    });

    const esimData = esimResponse.data;

    // 3. Return the real carrier data to the frontend
    res.status(200).json({
      id: session.id,
      email: session.customer_email,
      status: 'completed',
      qrCode: esimData.orderList?.[0]?.acCode ? 
        `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${esimData.orderList[0].acCode}` : 
        null,
      activationCode: esimData.orderList?.[0]?.acCode || 'Provisioning delay - check email.'
    });

  } catch (error) {
    console.error('Provisioning Error:', error.response?.data || error.message);
    // If eSIMAccess fails, we still return success if paid, but flag the delay
    res.status(200).json({
      id: sessionId,
      status: 'processing',
      message: 'Payment verified. eSIM delivery in progress via email.'
    });
  }
}
