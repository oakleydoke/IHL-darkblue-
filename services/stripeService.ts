
import { CartItem } from '../types';
import { ENV } from '../config';

export class StripeService {
  static async redirectToCheckout(items: CartItem[], email: string): Promise<void> {
    const response = await fetch(`${ENV.API_BASE_URL}/payments/create-session`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: email,
        items: items.map(i => ({ priceId: i.plan.stripePriceId })),
        successUrl: `${ENV.APP_URL}?status=success&session_id={CHECKOUT_SESSION_ID}`,
        cancelUrl: `${ENV.APP_URL}?status=cancelled`
      })
    });

    if (!response.ok) {
      let errorMessage = 'Gateway connection failed';
      try {
        const errorData = await response.json();
        errorMessage = errorData.error || errorMessage;
      } catch (e) {
        errorMessage = `Server Error: ${response.status} ${response.statusText}`;
      }
      throw new Error(errorMessage);
    }

    const { checkoutUrl } = await response.json();
    if (checkoutUrl) {
      window.location.assign(checkoutUrl);
    } else {
      throw new Error('No checkout URL returned from server');
    }
  }
}
