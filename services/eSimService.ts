
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
    try {
      const response = await fetch(`${ENV.API_BASE_URL}/orders/verify-session?sessionId=${sessionId}`);
      
      const contentType = response.headers.get("content-type");
      if (!response.ok) {
        if (contentType && contentType.includes("application/json")) {
          const errorData = await response.json();
          throw new Error(errorData.details || errorData.error || 'Provisioning sequence interrupted.');
        } else {
          // Likely a 504 Gateway Timeout from Vercel (HTML page)
          throw new Error('Carrier nodes are experiencing high latency. Your asset is being secured in the background. Please remain on this page.');
        }
      }
      
      return await response.json();
    } catch (e: any) {
      console.error("[ESimService] Handshake Delayed:", e.message);
      throw e;
    }
  }

  static async getUsageMetrics(iccid: string): Promise<ESimUsage> {
    const response = await fetch(`${ENV.API_BASE_URL}/esim/usage?iccid=${iccid}`);
    if (!response.ok) throw new Error('Usage telemetry unreachable');
    return await response.json();
  }

  static async fetchLivePricing(locationCode: string): Promise<Partial<eSIMPlan>[]> {
    return []; 
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
