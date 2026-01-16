
/**
 * GOOGLE CLOUD FUNCTION: index.js
 * 
 * SETUP CHECKLIST:
 * 1. Trigger: HTTPS -> "Allow unauthenticated invocations".
 * 2. Environment Variable (Under "Runtime settings" at the bottom of Page 1):
 *    - Name: STRIPE_SECRET_KEY
 *    - Value: sk_live_... (Get this from Stripe Dashboard > Developers > API Keys)
 * 3. Runtime: Node.js 20
 * 4. Entry point: createSession
 */

const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

exports.createSession = async (req, res) => {
  // 1. SET SECURITY HEADERS (CORS)
  res.set('Access-Control-Allow-Origin', '*'); 
  res.set('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.set('Access-Control-Allow-Headers', 'Content-Type, X-App-Origin');

  // 2. HANDLE PRE-FLIGHT REQUESTS
  if (req.method === 'OPTIONS') {
    res.status(204).send('');
    return;
  }

  // 3. MAIN LOGIC
  try {
    const { email, items, successUrl, cancelUrl } = req.body;

    if (!items || items.length === 0) {
      throw new Error('No items in cart');
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
    });

    res.status(200).json({ checkoutUrl: session.url });

  } catch (error) {
    console.error('Stripe Error:', error);
    res.status(500).json({ 
      message: 'Payment Gateway Error',
      details: error.message 
    });
  }
};
