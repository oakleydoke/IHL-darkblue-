
export interface UserAccount {
  email: string;
  password?: string;
  orderIds: string[];
}

export class AuthService {
  private static USERS_KEY = 'ihavelanded_users';
  private static ORDERS_KEY = 'ihavelanded_orders';

  private static getUsers(): Record<string, UserAccount> {
    const data = localStorage.getItem(this.USERS_KEY);
    return data ? JSON.parse(data) : {};
  }

  /**
   * Saves a verified order to the global ledger.
   * This is our "database" for all transactions on this device.
   */
  static saveOrderToLedger(order: any): void {
    const orders = JSON.parse(localStorage.getItem(this.ORDERS_KEY) || '[]');
    const normalizedEmail = order.email.toLowerCase().trim();
    
    // Check if order already exists in ledger
    const existingIdx = orders.findIndex((o: any) => o.id === order.id);
    const orderData = {
      ...order,
      email: normalizedEmail,
      timestamp: order.timestamp || new Date().toISOString()
    };

    if (existingIdx === -1) {
      orders.push(orderData);
    } else {
      // Update existing record (e.g. if QR code arrived later)
      orders[existingIdx] = orderData;
    }
    
    localStorage.setItem(this.ORDERS_KEY, JSON.stringify(orders));
    
    // If user is logged in, link it to their account object automatically
    const activeEmail = localStorage.getItem('ihavelanded_active_email');
    if (activeEmail && activeEmail.toLowerCase() === normalizedEmail) {
      this.addOrderToUser(activeEmail, order.id);
    }
  }

  static register(email: string, password: string, firstOrderId: string): void {
    const users = this.getUsers();
    const normalizedEmail = email.toLowerCase().trim();
    
    // Gather all historical orders for this email from our device ledger
    const ledger = JSON.parse(localStorage.getItem(this.ORDERS_KEY) || '[]');
    const userOrders = ledger
      .filter((o: any) => o.email.toLowerCase() === normalizedEmail)
      .map((o: any) => o.id);

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
