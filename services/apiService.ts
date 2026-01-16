
import { ENV } from '../config';

export class ApiService {
  protected static async request<T>(endpoint: string, options: RequestInit = {}): Promise<T | null> {
    // If we're in a local preview or forced mock mode, don't attempt real network calls
    if (ENV.USE_MOCKS || !ENV.STRIPE_PUBLIC_KEY) {
      console.debug(`[MOCK-MODE] Bypassing network for: ${endpoint}`);
      return null;
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), ENV.API_TIMEOUT);
    
    // Attempt to get the eSIM API key from various env locations
    const meta = import.meta as any;
    const API_KEY = (meta.env && meta.env.VITE_ESIM_ACCESS_KEY) || 
                    (typeof process !== 'undefined' && process.env.VITE_ESIM_ACCESS_KEY) || 
                    '';
    
    const headers = {
      'Content-Type': 'application/json',
      'X-API-Key': API_KEY,
      ...options.headers,
    };

    try {
      const response = await fetch(endpoint, {
        ...options,
        headers,
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);

      if (!response.ok) return null;
      return await response.json();
    } catch (error) {
      console.warn('[API-ERROR] Network request failed:', error);
      return null;
    }
  }
}
