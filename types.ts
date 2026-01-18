
export type CurrencyCode = 'USD' | 'EUR' | 'GBP';

export interface eSIMPlan {
  id: string;
  name: string;
  data: string;
  validity: string;
  price: number; 
  currency: string;
  coverage: string;
  stripePriceId: string;
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
  status: 'pending' | 'completed' | 'error';
  qrCode?: string;
  activationCode?: string;
  iccid?: string;
  orderNo?: string;
  message?: string;
}
