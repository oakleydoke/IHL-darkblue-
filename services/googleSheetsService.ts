
import { ApiService } from './apiService';
import { Order } from '../types';

/**
 * PRODUCTION LEDGER & FULFILLMENT:
 * Synchronizes with the "IHL 2026" Master Infrastructure.
 */
const SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbwbAUQ-1s8WZpHPzG4aqp5GVWGdxXw_G7ezkdLNmyFab7iVM9s3V0KDa8Mp0eh3DbpO/exec';

export class GoogleSheetsService extends ApiService {
  /**
   * Records transaction data and triggers the Fulfillment Email via Apps Script.
   */
  static async recordSignup(email: string, source: 'GIVEAWAY_ENTRY' | 'CUSTOMER_PURCHASE', order?: Order): Promise<boolean> {
    // Extract first item details if order exists
    const item = order?.items[0];
    const iccid = order?.activationCode?.split('$').pop() || 'N/A';

    const payload = { 
      email: email.toLowerCase().trim(), 
      source: source, 
      orderId: order?.id || 'GIVEAWAY',
      iccid: iccid,
      activationCode: order?.activationCode || 'N/A',
      plan: item?.plan.name || 'N/A',
      country: item?.country.name || 'N/A',
      timestamp: new Date().toISOString(),
      status: 'LIVE'
    };

    try {
      if (!email || !email.includes('@')) return false;

      // Fire-and-forget background sync
      fetch(SCRIPT_URL, {
        method: 'POST',
        mode: 'no-cors',
        headers: {
          'Content-Type': 'text/plain',
        },
        body: JSON.stringify(payload)
      }).catch(err => console.debug('[Ledger Sync - Silent Catch]', err));

      return true;
    } catch (error) {
      console.error('[Ledger Sync Error]', error);
      return true; 
    }
  }
}
