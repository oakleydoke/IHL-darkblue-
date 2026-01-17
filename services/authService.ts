
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

  static saveOrderToLedger(order: any): void {
    const orders = JSON.parse(localStorage.getItem(this.ORDERS_KEY) || '[]');
    const normalizedEmail = order.email.toLowerCase().trim();
    
    if (!orders.find((o: any) => o.id === order.id)) {
      orders.push({
        ...order,
        email: normalizedEmail,
        timestamp: new Date().toISOString()
      });
      localStorage.setItem(this.ORDERS_KEY, JSON.stringify(orders));
    }
    
    // Auto-link to existing user if they happen to be logged in
    const activeEmail = localStorage.getItem('ihavelanded_active_email');
    if (activeEmail && activeEmail.toLowerCase() === normalizedEmail) {
      this.addOrderToUser(activeEmail, order.id);
    }
  }

  static register(email: string, password: string, firstOrderId: string): void {
    const users = this.getUsers();
    const normalizedEmail = email.toLowerCase().trim();
    
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
    
    // Support "guest login" for testing: if they have orders but no password, we still need a full account
    if (user && user.password === password) {
      return user;
    }
    return null;
  }
}
