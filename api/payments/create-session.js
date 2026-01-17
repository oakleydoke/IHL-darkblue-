
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { email, items, successUrl, cancelUrl } = req.body;

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
      // Metadata allows us to track the order details through the Stripe flow
      metadata: {
        customer_email: email,
        plan_ids: items.map(i => i.priceId).join(',')
      }
    });

    res.status(200).json({ checkoutUrl: session.url });
  } catch (error) {
    console.error('Stripe Error:', error);
    res.status(500).json({ error: error.message });
  }
}
