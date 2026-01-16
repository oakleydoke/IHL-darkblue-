
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
      { id: 'us-3', name: 'Academic Unlimited', data: 'Unlimited', validity: '30 Days', price: 45, currency: 'USD', coverage: 'USA (Verizon/T-Mobile)', stripePriceId: 'price_us_unlimited_prod' },
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
  },
  {
    id: 'france',
    name: 'France',
    code: 'FR',
    flag: '🇫🇷',
    image: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=800&q=80',
    plans: [
      { id: 'fr-1', name: 'Parisian Starter', data: '5GB', validity: '30 Days', price: 12, currency: 'USD', coverage: 'France (Orange)', stripePriceId: 'price_fr_5gb_prod' },
      { id: 'fr-2', name: 'Sorbonne Scholar', data: '15GB', validity: '30 Days', price: 22, currency: 'USD', coverage: 'France (Orange)', stripePriceId: 'price_fr_15gb_prod' },
      { id: 'fr-3', name: 'French Unlimited', data: 'Unlimited', validity: '30 Days', price: 40, currency: 'USD', coverage: 'France (Orange)', stripePriceId: 'price_fr_unlimited_prod' },
    ]
  },
  {
    id: 'germany',
    name: 'Germany',
    code: 'DE',
    flag: '🇩🇪',
    image: 'https://images.unsplash.com/photo-1467269204594-9661b134dd2b?auto=format&fit=crop&w=800&q=80',
    plans: [
      { id: 'de-1', name: 'Berlin Basic', data: '5GB', validity: '30 Days', price: 14, currency: 'USD', coverage: 'Germany (Telekom)', stripePriceId: 'price_de_5gb_prod' },
      { id: 'de-2', name: 'Munich Master', data: '15GB', validity: '30 Days', price: 24, currency: 'USD', coverage: 'Germany (Telekom)', stripePriceId: 'price_de_15gb_prod' },
      { id: 'de-3', name: 'Autobahn Unlimited', data: 'Unlimited', validity: '30 Days', price: 42, currency: 'USD', coverage: 'Germany (Telekom)', stripePriceId: 'price_de_unlimited_prod' },
    ]
  },
  {
    id: 'spain',
    name: 'Spain',
    code: 'ES',
    flag: '🇪🇸',
    image: 'https://images.unsplash.com/photo-1543783207-ec64e4d95325?auto=format&fit=crop&w=800&q=80',
    plans: [
      { id: 'es-1', name: 'Siesta Data', data: '5GB', validity: '30 Days', price: 12, currency: 'USD', coverage: 'Spain (Movistar)', stripePriceId: 'price_es_5gb_prod' },
      { id: 'es-2', name: 'Madrid Scholar', data: '15GB', validity: '30 Days', price: 24, currency: 'USD', coverage: 'Spain (Movistar)', stripePriceId: 'price_es_15gb_prod' },
      { id: 'es-3', name: 'Iberian Unlimited', data: 'Unlimited', validity: '30 Days', price: 38, currency: 'USD', coverage: 'Spain (Movistar)', stripePriceId: 'price_es_unlimited_prod' },
    ]
  },
  {
    id: 'italy',
    name: 'Italy',
    code: 'IT',
    flag: '🇮🇹',
    image: 'https://images.unsplash.com/photo-1529260830199-42c42dda5f6d?auto=format&fit=crop&w=800&q=80',
    plans: [
      { id: 'it-1', name: 'Roman Roam', data: '5GB', validity: '30 Days', price: 12, currency: 'USD', coverage: 'Italy (TIM)', stripePriceId: 'price_it_5gb_prod' },
      { id: 'it-2', name: 'Milan Connect', data: '15GB', validity: '30 Days', price: 23, currency: 'USD', coverage: 'Italy (TIM)', stripePriceId: 'price_it_15gb_prod' },
      { id: 'it-3', name: 'Dolce Vita Unlimited', data: 'Unlimited', validity: '30 Days', price: 39, currency: 'USD', coverage: 'Italy (TIM)', stripePriceId: 'price_it_unlimited_prod' },
    ]
  },
  {
    id: 'canada',
    name: 'Canada',
    code: 'CA',
    flag: '🇨🇦',
    image: 'https://images.unsplash.com/photo-1503614472-8c93d56e92ce?auto=format&fit=crop&w=800&q=80',
    plans: [
      { id: 'ca-1', name: 'Maple Connect', data: '5GB', validity: '30 Days', price: 13, currency: 'USD', coverage: 'Canada', stripePriceId: 'price_ca_5gb_prod' },
      { id: 'ca-2', name: 'Snowy Scholar', data: '15GB', validity: '30 Days', price: 22, currency: 'USD', coverage: 'Canada', stripePriceId: 'price_ca_15gb_prod' },
      { id: 'ca-3', name: 'Great North', data: 'Unlimited', validity: '30 Days', price: 37, currency: 'USD', coverage: 'Canada', stripePriceId: 'price_ca_unlimited_prod' },
    ]
  },
  {
    id: 'japan',
    name: 'Japan',
    code: 'JP',
    flag: '🇯🇵',
    image: 'https://images.unsplash.com/photo-1542051841857-5f90071e7989?auto=format&fit=crop&w=800&q=80',
    plans: [
      { id: 'jp-1', name: 'Tokyo Tech', data: '3GB', validity: '30 Days', price: 12, currency: 'USD', coverage: 'Japan (SoftBank)', stripePriceId: 'price_jp_3gb_prod' },
      { id: 'jp-2', name: 'Kyoto Scholar', data: '10GB', validity: '30 Days', price: 25, currency: 'USD', coverage: 'Japan (SoftBank)', stripePriceId: 'price_jp_10gb_prod' },
      { id: 'jp-3', name: 'Samurai Unlimited', data: 'Unlimited', validity: '30 Days', price: 45, currency: 'USD', coverage: 'Japan (SoftBank)', stripePriceId: 'price_jp_unlimited_prod' },
    ]
  },
  {
    id: 'australia',
    name: 'Australia',
    code: 'AU',
    flag: '🇦🇺',
    image: 'https://images.unsplash.com/photo-1523482580672-f109ba8cb9be?auto=format&fit=crop&w=800&q=80',
    plans: [
      { id: 'au-1', name: 'Outback Starter', data: '5GB', validity: '30 Days', price: 14, currency: 'USD', coverage: 'Australia (Telstra)', stripePriceId: 'price_au_5gb_prod' },
      { id: 'au-2', name: 'Sydney Surfer', data: '15GB', validity: '30 Days', price: 25, currency: 'USD', coverage: 'Australia (Telstra)', stripePriceId: 'price_au_15gb_prod' },
      { id: 'au-3', name: 'Down Under Max', data: 'Unlimited', validity: '30 Days', price: 42, currency: 'USD', coverage: 'Australia (Telstra)', stripePriceId: 'price_au_unlimited_prod' },
    ]
  },
  {
    id: 'south-korea',
    name: 'South Korea',
    code: 'KR',
    flag: '🇰🇷',
    image: 'https://images.unsplash.com/photo-1517154421773-0529f29ea451?auto=format&fit=crop&w=800&q=80',
    plans: [
      { id: 'kr-1', name: 'Seoul Speed', data: '5GB', validity: '30 Days', price: 12, currency: 'USD', coverage: 'South Korea (SKT)', stripePriceId: 'price_kr_5gb_prod' },
      { id: 'kr-2', name: 'K-Pop Connect', data: '15GB', validity: '30 Days', price: 22, currency: 'USD', coverage: 'South Korea (SKT)', stripePriceId: 'price_kr_15gb_prod' },
      { id: 'kr-3', name: 'Gangnam Unlimited', data: 'Unlimited', validity: '30 Days', price: 38, currency: 'USD', coverage: 'South Korea (SKT)', stripePriceId: 'price_kr_unlimited_prod' },
    ]
  },
  {
    id: 'ireland',
    name: 'Ireland',
    code: 'IE',
    flag: '🇮🇪',
    image: 'https://images.unsplash.com/photo-1590089415225-401cd6f9e69c?auto=format&fit=crop&w=800&q=80',
    plans: [
      { id: 'ie-1', name: 'Dublin Data', data: '5GB', validity: '30 Days', price: 12, currency: 'USD', coverage: 'Ireland (Vodafone)', stripePriceId: 'price_ie_5gb_prod' },
      { id: 'ie-2', name: 'Emerald Isle', data: '15GB', validity: '30 Days', price: 22, currency: 'USD', coverage: 'Ireland (Vodafone)', stripePriceId: 'price_ie_15gb_prod' },
      { id: 'ie-3', name: 'Celtic Unlimited', data: 'Unlimited', validity: '30 Days', price: 36, currency: 'USD', coverage: 'Ireland (Vodafone)', stripePriceId: 'price_ie_unlimited_prod' },
    ]
  },
  {
    id: 'mexico',
    name: 'Mexico',
    code: 'MX',
    flag: '🇲🇽',
    image: 'https://images.unsplash.com/photo-1518105779142-d975f22f1b0a?auto=format&fit=crop&w=800&q=80',
    plans: [
      { id: 'mx-1', name: 'Taco Tech', data: '5GB', validity: '30 Days', price: 11, currency: 'USD', coverage: 'Mexico (Telcel)', stripePriceId: 'price_mx_5gb_prod' },
      { id: 'mx-2', name: 'Cancun Connect', data: '10GB', validity: '30 Days', price: 20, currency: 'USD', coverage: 'Mexico (Telcel)', stripePriceId: 'price_mx_10gb_prod' },
      { id: 'mx-3', name: 'Fiesta Max', data: 'Unlimited', validity: '30 Days', price: 35, currency: 'USD', coverage: 'Mexico (Telcel)', stripePriceId: 'price_mx_unlimited_prod' },
    ]
  }
];
