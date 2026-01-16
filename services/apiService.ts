
import { ENV } from '../config';

export class ApiService {
  protected static async request<T>(endpoint: string, options: RequestInit = {}): Promise<T | null> {
    if (ENV.USE_MOCKS) {
      console.debug(`[MOCK-MODE] Bypassing real network for: ${endpoint}`);
      return null;
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), ENV.API_TIMEOUT);
    
    const API_KEY = 'EA_PROD_9921_SECRET'; 
    const headers = {
      'Content-Type': 'application/json',
      'X-API-Key': API_KEY,
      ...options.headers,
    };

    try {
      console.debug(`[PROD-CORE] Request: ${endpoint}`);
      const response = await fetch(endpoint, {
        ...options,
        headers,
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);

      if (!response.ok) return null;
      return await response.json();
    } catch (error) {
      console.warn('[PROD-CORE-TIMEOUT/ERROR] Falling back to local data', error);
      return null;
    }
  }
}
