
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
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.details || errorData.error || 'Provisioning handshake timeout');
    }
    
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
    return orderIds.map(id => ({
      iccid: '8986...',
      country: 'Global',
      flag: '🌍',
      planName: 'Scholar Premium',
      purchasedDate: new Date().toLocaleDateString()
    }));
  }
}
