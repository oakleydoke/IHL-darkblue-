
/**
 * AUTH SERVICE
 * ------------------------------------------------------------------
 * STORAGE POLICY: This application uses browser localStorage for persistence.
 * Keys: 
 * - 'ihavelanded_users': Maps email -> { password, orderIds }
 * - 'ihavelanded_orders': A global ledger of all transactions on this device.
 * 
 * NOTE: For production multi-device support, these should be moved to a
 * centralized database (e.g. Supabase, Firebase, or PostgreSQL).
 * ------------------------------------------------------------------
 */

export interface UserAccount {
  email: string;
  password?: string;
  orderIds: string[];
}

export interface OrderLedgerEntry {
  id: string;
  email: string;
  timestamp: string;
  [key: string]: any;
}

export class AuthService {
  private static USERS_KEY = 'ihavelanded_users';
  private static ORDERS_KEY = 'ihavelanded_orders';

  private static getUsers(): Record<string, UserAccount> {
    const data = localStorage.getItem(this.USERS_KEY);
    return data ? JSON.parse(data) : {};
  }

  /**
   * Saves an order to the device's global ledger.
   * This ensures that even "Guest" checkouts are tracked for the dashboard.
   */
  static saveOrderToLedger(order: any): void {
    const orders: OrderLedgerEntry[] = JSON.parse(localStorage.getItem(this.ORDERS_KEY) || '[]');
    const normalizedEmail = order.email.toLowerCase().trim();
    
    // Check if order already exists
    const existingIdx = orders.findIndex((o) => o.id === order.id);
    const entry = {
      ...order,
      email: normalizedEmail,
      timestamp: order.timestamp || new Date().toISOString()
    };

    if (existingIdx === -1) {
      orders.push(entry);
    } else {
      // Update existing (useful if activation code arrived later)
      orders[existingIdx] = entry;
    }
    
    localStorage.setItem(this.ORDERS_KEY, JSON.stringify(orders));
    
    // Auto-link to user profile if it exists
    const users = this.getUsers();
    if (users[normalizedEmail]) {
      this.addOrderToUser(normalizedEmail, order.id);
    }
  }

  /**
   * Registers a new account or attaches a password to a guest account.
   */
  static register(email: string, password: string, firstOrderId: string): void {
    const users = this.getUsers();
    const normalizedEmail = email.toLowerCase().trim();
    
    // Retrieve all historical orders for this email from our local device ledger
    const ledger: OrderLedgerEntry[] = JSON.parse(localStorage.getItem(this.ORDERS_KEY) || '[]');
    const userOrders = ledger
      .filter((o) => o.email.toLowerCase() === normalizedEmail)
      .map((o) => o.id);

    users[normalizedEmail] = {
      email: normalizedEmail,
      password,
      orderIds: Array.from(new Set([...userOrders, firstOrderId]))
    };
    
    localStorage.setItem(this.USERS_KEY, JSON.stringify(users));
  }

  static addOrderToUser(email: string, orderId: string): void {
    const users = this.getUsers();
    const normalizedEmail = email.toLowerCase().trim();
    if (users[normalizedEmail]) {
      if (!users[normalizedEmail].orderIds.includes(orderId)) {
        users[normalizedEmail].orderIds.push(orderId);
        localStorage.setItem(this.USERS_KEY, JSON.stringify(users));
      }
    }
  }

  /**
   * Authenticates a user.
   * If the user exists in 'ihavelanded_users' with a password, it validates.
   */
  static login(email: string, password: string): UserAccount | null {
    const users = this.getUsers();
    const normalizedEmail = email.toLowerCase().trim();
    const user = users[normalizedEmail];
    
    if (user && user.password === password) {
      return user;
    }
    return null;
  }
}
