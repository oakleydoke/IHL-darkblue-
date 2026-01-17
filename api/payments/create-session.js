
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  if (!process.env.STRIPE_SECRET_KEY) {
    console.error('CRITICAL: STRIPE_SECRET_KEY is not set in environment variables.');
    return res.status(500).json({ error: 'Payment Gateway Configuration Error: Missing Secret Key. Check Vercel Dashboard.' });
  }

  try {
    const { email, items, successUrl, cancelUrl } = req.body;

    if (!items || items.length === 0) {
      return res.status(400).json({ error: 'Cart is empty' });
    }

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card', 'apple_pay', 'google_pay'],
      customer_email: email,
      line_items: items.map(item => ({
        price: item.priceId,
        quantity: 1,
      })),
      mode: 'payment',
      success_url: successUrl,
      cancel_url: cancelUrl,
      metadata: {
        customer_email: email,
        plan_ids: items.map(i => i.priceId).join(',')
      }
    });

    res.status(200).json({ checkoutUrl: session.url });
  } catch (error) {
    console.error('Stripe Error:', error);
    // Return the actual stripe error message so the user knows what's wrong (e.g. invalid Price ID)
    res.status(400).json({ error: error.message || 'Payment session creation failed' });
  }
}
