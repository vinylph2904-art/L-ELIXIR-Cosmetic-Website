import { Injectable } from '@angular/core';
import { User } from '../data/user.model';
const USERS_KEY = 'users';
const SESSION_KEY = 'currentUser';
const INITIAL_USERS: User[] = [
  {
    userId: 'U1718000000000',
    email: 'nguyenvana@gmail.com',
    password: '123456',
    fullName: 'Nguyễn Văn A',
    phoneNumber: '0901234567',
    role: 'customer',
    dateOfBirth: '15/05/1990',
    gender: 'Nam',
    avatarUrl: '',
    createdAt: '2025-01-01T00:00:00.000Z'
  },
  {
    userId: 'U1781977136020',
    email: 'aybixi@gmail.com',
    password: 'aaa',
    fullName: 'Ây bi xi',
    phoneNumber: '1234567989',
    role: 'customer',
    createdAt: '2026-06-20T17:38:56.020Z'
  }
];

@Injectable({ providedIn: 'root' })
export class AuthService {

  private getUsers(): User[] {
    const raw = localStorage.getItem(USERS_KEY);
    if (raw) {
      return JSON.parse(raw) as User[];
    }

    localStorage.setItem(USERS_KEY, JSON.stringify(INITIAL_USERS));
    return [...INITIAL_USERS];
  }

  private saveUsers(users: User[]): void {
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
  }

  isValidEmail(email: string): boolean {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }

  isValidPhone(phone: string): boolean {
    return /^\d{10}$/.test(phone.trim());
  }

  async emailExists(email: string): Promise<boolean> {
    return this.getUsers().some(u => u.email.toLowerCase() === email.trim().toLowerCase());
  }

  async phoneExists(phone: string): Promise<boolean> {
    return this.getUsers().some(u => u.phoneNumber === phone.trim());
  }

  async signup(data: { email: string; password: string; fullName: string; phoneNumber: string }): Promise<{ success: boolean; message: string }> {
    if (!this.isValidEmail(data.email)) {
      return { success: false, message: 'Email không đúng định dạng.' };
    }

    if (!this.isValidPhone(data.phoneNumber)) {
      return { success: false, message: 'Số điện thoại phải gồm đúng 10 chữ số.' };
    }

    const users = this.getUsers();
    const emailExists = users.some(u => u.email.toLowerCase() === data.email.toLowerCase());
    if (emailExists) {
      return { success: false, message: 'Email đã tồn tại, vui lòng nhập email khác.' };
    }

    const phoneExists = users.some(u => u.phoneNumber === data.phoneNumber.trim());
    if (phoneExists) {
      return { success: false, message: 'Số điện thoại đã tồn tại, vui lòng nhập số điện thoại khác.' };
    }

    const newUser: User = {
      userId: 'U' + Date.now().toString(),
      email: data.email,
      password: data.password,
      fullName: data.fullName,
      phoneNumber: data.phoneNumber.trim(),
      role: 'customer',
      createdAt: new Date().toISOString()
    };

    users.push(newUser);
    await this.saveUsers(users);
    return { success: true, message: 'Đăng ký thành công.' };
  }

  async login(email: string, password: string): Promise<{ success: boolean; message: string }> {
    const users = this.getUsers();
    const user = users.find(u => u.email.toLowerCase() === email.toLowerCase());

    if (!user) {
      return { success: false, message: 'Tài khoản không tồn tại.' };
    }

    if (user.password !== password) {
      return { success: false, message: 'Mật khẩu không đúng.' };
    }

    const sessionToken = btoa(user.userId + ':' + Date.now());
    sessionStorage.setItem(SESSION_KEY, JSON.stringify({ ...user, token: sessionToken }));
    return { success: true, message: 'Đăng nhập thành công.' };
  }

  logout(): void {
    sessionStorage.removeItem(SESSION_KEY);
  }

  getCurrentUser(): (User & { token: string }) | null {
    const raw = sessionStorage.getItem(SESSION_KEY);
    return raw ? JSON.parse(raw) : null;
  }

  isLoggedIn(): boolean {
    return this.getCurrentUser() !== null;
  }

  /** Cập nhật thông tin cá nhân (không gồm email/password) và đồng bộ lại session hiện tại */
  async updateProfile(userId: string, data: Partial<Pick<User, 'fullName' | 'phoneNumber' | 'dateOfBirth' | 'gender' | 'avatarUrl'>>): Promise<{ success: boolean; message: string }> {
    const users = this.getUsers();
    const idx = users.findIndex(u => u.userId === userId);
    if (idx === -1) {
      return { success: false, message: 'Không tìm thấy người dùng.' };
    }

    if (data.phoneNumber && !this.isValidPhone(data.phoneNumber)) {
      return { success: false, message: 'Số điện thoại phải gồm đúng 10 chữ số.' };
    }

    users[idx] = { ...users[idx], ...data };
    await this.saveUsers(users);

    const current = this.getCurrentUser();
    if (current && current.userId === userId) {
      sessionStorage.setItem(SESSION_KEY, JSON.stringify({ ...users[idx], token: current.token }));
    }

    return { success: true, message: 'Cập nhật thông tin thành công.' };
  }

  async changePassword(userId: string, currentPassword: string, newPassword: string): Promise<{ success: boolean; message: string }> {
    if (!currentPassword.trim() || !newPassword.trim()) {
      return { success: false, message: 'Vui lòng nhập đầy đủ mật khẩu hiện tại và mật khẩu mới.' };
    }

    if (newPassword.trim().length < 6) {
      return { success: false, message: 'Mật khẩu mới phải có ít nhất 6 ký tự.' };
    }

    const users = this.getUsers();
    const idx = users.findIndex(u => u.userId === userId);
    if (idx === -1) {
      return { success: false, message: 'Không tìm thấy người dùng.' };
    }

    if (users[idx].password !== currentPassword) {
      return { success: false, message: 'Mật khẩu hiện tại không đúng.' };
    }

    users[idx] = { ...users[idx], password: newPassword };
    await this.saveUsers(users);

    const current = this.getCurrentUser();
    if (current && current.userId === userId) {
      sessionStorage.setItem(SESSION_KEY, JSON.stringify({ ...users[idx], token: current.token }));
    }

    return { success: true, message: 'Đổi mật khẩu thành công.' };
  }
}
