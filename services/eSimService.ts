
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
    // In production, this would call eSIMAccess Usage API via your Vercel backend
    const data = await this.request<ESimUsage>(`${ENV.API_BASE_URL}/esim/usage?iccid=${iccid}`);
    
    if (!data) {
      return {
        iccid,
        totalVolume: 10737418240, // 10GB
        usedVolume: 0,
        remainingVolume: 10737418240,
        expiryTime: new Date(Date.now() + 86400000 * 30).toISOString(),
        status: 'active',
        carrier: 'Premium Tier-1'
      };
    }
    return data;
  }

  static async fetchLivePricing(locationCode: string): Promise<Partial<eSIMPlan>[]> {
    // Direct link to your pricing proxy
    const data = await this.request<Partial<eSIMPlan>[]>(`${ENV.API_BASE_URL}/catalog/pricing?location=${locationCode}`);
    return data || [];
  }

  static async getUserESims(orderIds: string[]): Promise<any[]> {
    const data = await this.request<any[]>(`${ENV.API_BASE_URL}/users/esims`, {
      method: 'POST',
      body: JSON.stringify({ orderIds })
    });
    return data || [];
  }
}
