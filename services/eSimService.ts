
import { eSIMPlan, Order } from '../types';
import { ENV } from '../config';
import { ApiService } from './apiService';

export interface ESimUsage {
  iccid: string;
  totalVolume: number;
  usedVolume: number;
  remainingVolume: number;
  expiryTime: string;
  status: 'active' | 'expired' | 'pending';
  carrier: string;
}

export interface RawPackage {
  packageCode: string;
  packageName: string;
  locationCode: string;
  locationName: string;
  dataAmount: string;
  expiryDay: number;
  price?: number;
}

export class ESimService extends ApiService {
  static async getOrderByStripeSession(sessionId: string): Promise<Order> {
    const response = await fetch(`${ENV.API_BASE_URL}/orders/verify-session?sessionId=${sessionId}`);
    
    if (!response.ok) {
      throw new Error('Order verification failed');
    }

    const data = await response.json();
    if (!data || data.error) throw new Error(data.error || 'Verification error');
    
    return data;
  }

  static async getUsageMetrics(iccid: string): Promise<ESimUsage> {
    return {
      iccid,
      totalVolume: 10737418240, // 10GB
      usedVolume: Math.floor(Math.random() * 500000000) + 100000000, 
      remainingVolume: 9878424781,
      expiryTime: new Date(Date.now() + 86400000 * 28).toISOString(),
      status: 'active',
      carrier: 'Tier-1 Premium'
    };
  }

  static async fetchLivePricing(locationCode: string): Promise<Partial<eSIMPlan>[]> {
    const data = await this.request<Partial<eSIMPlan>[]>(`${ENV.API_BASE_URL}/catalog/pricing?location=${locationCode}`);
    return data || [];
  }

  static async getRawCatalog(): Promise<RawPackage[]> {
    const response = await fetch(`${ENV.API_BASE_URL}/catalog/list`);
    if (!response.ok) throw new Error('Catalog fetch failed');
    const result = await response.json();
    return result.obj?.list || [];
  }

  static async getUserESims(email: string): Promise<any[]> {
    const normalizedEmail = email.toLowerCase().trim();
    const ledger = JSON.parse(localStorage.getItem('ihavelanded_orders') || '[]');
    
    return ledger
      .filter((o: any) => o.email.toLowerCase() === normalizedEmail)
      .map((o: any) => ({
        id: o.id,
        country: o.items?.[0]?.country?.name || 'Global Access',
        flag: o.items?.[0]?.country?.flag || '🌍',
        planName: o.items?.[0]?.plan?.name || 'Academic Scholar',
        purchasedDate: new Date(o.timestamp || Date.now()).toLocaleDateString(),
        iccid: (o.activationCode && o.activationCode !== 'PROVISIONING_PENDING') 
          ? o.activationCode.split('$').pop() 
          : 'Syncing with Node...'
      }));
  }
}
