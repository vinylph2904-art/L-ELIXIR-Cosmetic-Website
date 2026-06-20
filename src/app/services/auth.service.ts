import { Injectable } from '@angular/core';
import { User } from '../data/user.model';

const USERS_KEY = 'users';
const SESSION_KEY = 'currentUser';

@Injectable({ providedIn: 'root' })
export class AuthService {

  private getUsers(): User[] {
    const raw = localStorage.getItem(USERS_KEY);
    return raw ? JSON.parse(raw) : [];
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

  emailExists(email: string): boolean {
    return this.getUsers().some(u => u.email.toLowerCase() === email.trim().toLowerCase());
  }

  phoneExists(phone: string): boolean {
    return this.getUsers().some(u => u.phoneNumber === phone.trim());
  }

  signup(data: { email: string; password: string; fullName: string; phoneNumber: string }): { success: boolean; message: string } {
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
      role: 'customer'
    };

    users.push(newUser);
    this.saveUsers(users);
    return { success: true, message: 'Đăng ký thành công.' };
  }

  login(email: string, password: string): { success: boolean; message: string } {
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
}