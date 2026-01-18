
import { eSIMPlan, Order } from '../types';
import { ENV } from '../config';
import { ApiService } from './apiService';

export interface ESimUsage {
  totalVolume: number;
  usedVolume: number;
  remainingVolume: number;
  expiryTime?: string;
  status: string;
}

export class ESimService extends ApiService {
  static async getOrderByStripeSession(sessionId: string): Promise<Order> {
    const response = await fetch(`${ENV.API_BASE_URL}/orders/verify-session?sessionId=${sessionId}`);
    if (!response.ok) throw new Error('Provisioning check failed');
    return await response.json();
  }

  static async getUsageMetrics(iccid: string): Promise<ESimUsage> {
    const response = await fetch(`${ENV.API_BASE_URL}/esim/usage?iccid=${iccid}`);
    if (!response.ok) throw new Error('Usage fetch failed');
    return await response.json();
  }

  static async fetchLivePricing(locationCode: string): Promise<Partial<eSIMPlan>[]> {
    return []; // Handled by serverless logic in real production
  }

  static async getUserESims(orderIds: string[]): Promise<any[]> {
    // In a full build, this queries your DB. For now, we return based on locally tracked orders
    return orderIds.map(id => ({
      iccid: '8986...',
      country: 'Global',
      flag: '🌍',
      planName: 'Scholar Premium',
      purchasedDate: new Date().toLocaleDateString()
    }));
  }
}
