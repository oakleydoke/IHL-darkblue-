
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
   * Saves a verified order to the global ledger so it persists even before account creation.
   */
  static saveOrderToLedger(order: any): void {
    const orders = JSON.parse(localStorage.getItem(this.ORDERS_KEY) || '[]');
    // Prevent duplicates
    if (!orders.find((o: any) => o.id === order.id)) {
      orders.push({
        ...order,
        timestamp: new Date().toISOString()
      });
      localStorage.setItem(this.ORDERS_KEY, JSON.stringify(orders));
    }
    
    // If user is already logged in, link it to their account object too
    const activeEmail = localStorage.getItem('ihavelanded_active_email');
    if (activeEmail) {
      this.addOrderToUser(activeEmail, order.id);
    }
  }

  static register(email: string, password: string, firstOrderId: string): void {
    const users = this.getUsers();
    // Gather all historical orders for this email from the ledger
    const ledger = JSON.parse(localStorage.getItem(this.ORDERS_KEY) || '[]');
    const userOrders = ledger
      .filter((o: any) => o.email.toLowerCase() === email.toLowerCase())
      .map((o: any) => o.id);

    users[email] = {
      email,
      password,
      orderIds: Array.from(new Set([...userOrders, firstOrderId]))
    };
    localStorage.setItem(this.USERS_KEY, JSON.stringify(users));
  }

  static addOrderToUser(email: string, orderId: string): void {
    const users = this.getUsers();
    if (users[email]) {
      if (!users[email].orderIds.includes(orderId)) {
        users[email].orderIds.push(orderId);
        localStorage.setItem(this.USERS_KEY, JSON.stringify(users));
      }
    }
  }

  static login(email: string, password: string): UserAccount | null {
    const users = this.getUsers();
    const user = users[email];
    if (user && user.password === password) {
      return user;
    }
    return null;
  }
}
