
export interface UserAccount {
  email: string;
  password?: string;
  orderIds: string[];
}

export class AuthService {
  private static STORAGE_KEY = 'ihavelanded_users';

  private static getUsers(): Record<string, UserAccount> {
    const data = localStorage.getItem(this.STORAGE_KEY);
    return data ? JSON.parse(data) : {};
  }

  static register(email: string, password: string, firstOrderId: string): void {
    const users = this.getUsers();
    users[email] = {
      email,
      password,
      orderIds: [firstOrderId]
    };
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(users));
  }

  static addOrderToUser(email: string, orderId: string): void {
    const users = this.getUsers();
    if (users[email]) {
      if (!users[email].orderIds.includes(orderId)) {
        users[email].orderIds.push(orderId);
        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(users));
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

  static userExists(email: string): boolean {
    return !!this.getUsers()[email];
  }
}
