
const functions = require('firebase-functions');
const admin = require('firebase-admin');
const stripe = require('stripe')(functions.config().stripe ? functions.config().stripe.secret : '');
const cors = require('cors')({ origin: true });

admin.initializeApp();

/**
 * Main API entry point for secure Stripe checkout session creation.
 */
exports.api = functions.https.onRequest((req, res) => {
  return cors(req, res, async () => {
    // Only allow specific POST route for payments
    if (req.path.includes('/payments/create-session') && req.method === 'POST') {
      try {
        const { email, items, successUrl, cancelUrl } = req.body;

        if (!items || items.length === 0) {
          return res.status(400).json({ error: 'Cart is empty' });
        }

        const session = await stripe.checkout.sessions.create({
          // Fixed: Use automatic_payment_methods to avoid invalid string errors
          automatic_payment_methods: { enabled: true },
          customer_email: email,
          line_items: items.map(item => ({
            price: item.priceId,
            quantity: 1,
          })),
          mode: 'payment',
          success_url: successUrl,
          cancel_url: cancelUrl,
          automatic_tax: { enabled: true },
          metadata: {
            customer_email: email,
            plan_ids: items.map(i => i.priceId).join(',')
          }
        });

        return res.status(200).json({ checkoutUrl: session.url });
      } catch (error) {
        console.error('Stripe Session Error:', error);
        return res.status(500).json({ error: error.message });
      }
    }
    
    // Catch-all 404
    res.status(404).json({ error: 'Endpoint not provisioned' });
  });
});
