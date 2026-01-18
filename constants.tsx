
import { Country } from './types';

/**
 * PRODUCTION MAPPING:
 * Replace 'price_...' placeholders with real Price IDs from your Stripe Product Catalog.
 * Stripe Dashboard > Products > [Your Product] > Price > API ID
 */
export const TOP_COUNTRIES: Country[] = [
  {
    id: 'usa',
    name: 'United States',
    code: 'US',
    flag: '🇺🇸',
    image: 'https://images.unsplash.com/photo-1485738422979-f5c462d49f74?auto=format&fit=crop&w=800&q=80',
    plans: [
      { id: 'us-1', name: 'Student Essential', data: '5GB', validity: '30 Days', price: 15, currency: 'USD', coverage: 'USA (Verizon/T-Mobile)', stripePriceId: 'price_us_5gb_prod' },
      { id: 'us-2', name: 'Student Pro', data: '10GB', validity: '30 Days', price: 25, currency: 'USD', coverage: 'USA (Verizon/T-Mobile)', stripePriceId: 'price_us_10gb_prod' },
      { id: 'us-3', name: 'Academic Unlimited', data: 'Unlimited', validity: '30 Days', price: 45, currency: 'USD', coverage: 'USA (Verizon/T-Mobile)', stripePriceId: 'price_1SqhSYCPrRzENMHl0tebNgtr' },
    ]
  },
  {
    id: 'sandbox',
    name: 'Testing Sandbox',
    code: 'US',
    flag: '🛠️',
    image: 'https://images.unsplash.com/photo-1516116216624-53e697fedbea?auto=format&fit=crop&w=800&q=80',
    plans: [
      { id: 'test-1', name: 'Dev Test Plan', data: '1GB', validity: '7 Days', price: 1, currency: 'USD', coverage: 'Global Testing Node', stripePriceId: 'price_sandbox_test' },
    ]
  },
  {
    id: 'uk',
    name: 'United Kingdom',
    code: 'GB',
    flag: '🇬🇧',
    image: 'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?auto=format&fit=crop&w=800&q=80',
    plans: [
      { id: 'uk-1', name: 'Brit Study', data: '3GB', validity: '30 Days', price: 13, currency: 'USD', coverage: 'UK (Vodafone)', stripePriceId: 'price_uk_3gb_prod' },
      { id: 'uk-2', name: 'London Connect', data: '10GB', validity: '30 Days', price: 26, currency: 'USD', coverage: 'UK (Vodafone)', stripePriceId: 'price_uk_10gb_prod' },
      { id: 'uk-3', name: 'King\'s Unlimited', data: 'Unlimited', validity: '30 Days', price: 45, currency: 'USD', coverage: 'UK (Vodafone)', stripePriceId: 'price_uk_unlimited_prod' },
    ]
  }
];
