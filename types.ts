
export type CurrencyCode = 'USD' | 'EUR' | 'GBP';

export interface eSIMPlan {
  id: string;
  name: string;
  data: string;
  validity: string;
  price: number; 
  currency: string;
  coverage: string;
  stripePriceId: string; // REQUIRED FOR PRODUCTION
}

export interface Country {
  id: string;
  name: string;
  code: string;
  flag: string;
  image: string;
  plans: eSIMPlan[];
}

export interface CartItem {
  plan: eSIMPlan;
  country: Country;
  quantity: number;
}

export interface Order {
  id: string;
  email: string;
  items: CartItem[];
  total: number;
  currency: CurrencyCode;
  status: 'pending' | 'completed';
  qrCode?: string;
  activationCode?: string;
}
