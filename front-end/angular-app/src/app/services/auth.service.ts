import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { User } from '../data/user.model';
import seedUsers from '../data/mock-data/users.json';

const USERS_KEY = 'users';
const SESSION_KEY = 'currentUser';
const ADMIN_SESSION_KEY = 'adminUser';
const INITIAL_USERS = seedUsers as User[];

const SEED_BACKOFFICE_USERS: User[] = [
  {
    userId: 'ADMIN001',
    email: 'admin@lelixir.vn',
    password: 'admin123',
    fullName: 'Quản trị viên Hệ thống',
    phoneNumber: '0909000001',
    role: 'admin',
    status: 'active',
    createdAt: '2025-01-01T00:00:00.000Z'
  },
  {
    userId: 'STAFF001',
    email: 'staff@lelixir.vn',
    password: 'staff123',
    fullName: 'Nhân viên Vận hành',
    phoneNumber: '0909000002',
    role: 'staff',
    status: 'active',
    createdAt: '2025-01-01T00:00:00.000Z'
  },
  {
    userId: 'AUDIT001',
    email: 'audit@lelixir.vn',
    password: 'audit123',
    fullName: 'Kiểm toán viên Hệ thống',
    phoneNumber: '0909000003',
    role: 'audit',
    status: 'active',
    createdAt: '2025-01-01T00:00:00.000Z'
  }
];

@Injectable({ providedIn: 'root' })
export class AuthService {
  private currentUserSubject = new BehaviorSubject<(User & { token: string }) | null>(this.getCurrentUser());
  currentUser$ = this.currentUserSubject.asObservable();

  private adminUserSubject = new BehaviorSubject<(User & { token: string }) | null>(this.getAdminUser());
  adminUser$ = this.adminUserSubject.asObservable();

  constructor() {
    this.syncSeedUsers();
  }

  private syncSeedUsers(): User[] {
    const raw = localStorage.getItem(USERS_KEY);
    const storedUsers = raw ? (JSON.parse(raw) as User[]) : [];
    const mergedUsers = [...storedUsers];

    const allSeedUsers = [...SEED_BACKOFFICE_USERS, ...INITIAL_USERS];

    for (const seedUser of allSeedUsers) {
      const exists = mergedUsers.some(user => user.userId === seedUser.userId || user.email.toLowerCase() === seedUser.email.toLowerCase());
      if (!exists) {
        mergedUsers.push({
          ...seedUser,
          status: seedUser.status || 'active'
        });
      }
    }

    localStorage.setItem(USERS_KEY, JSON.stringify(mergedUsers));
    return mergedUsers;
  }

  private getUsers(): User[] {
    const raw = localStorage.getItem(USERS_KEY);
    if (raw) {
      return JSON.parse(raw) as User[];
    }

    return this.syncSeedUsers();
  }

  private saveUsers(users: User[]): void {
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
  }

  isValidEmail(email: string): boolean {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }

  isValidFullName(fullName: string): boolean {
    const trimmed = fullName.trim();
    return /[A-Za-zÀ-ÿ]/.test(trimmed) && !/^\d+$/.test(trimmed);
  }

  private normalizePhone(phone: string): string {
    return String(phone ?? '').trim().replace(/\s+/g, '');
  }

  getPhoneValidationError(phone: string): string | null {
    const normalized = this.normalizePhone(phone);

    if (!normalized) {
      return 'Số điện thoại không được để trống.';
    }

    if (!/^\d+$/.test(normalized)) {
      return 'Số điện thoại không hợp lệ (không phải số, không bắt đầu bằng số 0).';
    }

    if (normalized.length !== 10) {
      return 'Số điện thoại phải đủ 10 chữ số.';
    }

    if (!normalized.startsWith('0')) {
      return 'Số điện thoại không hợp lệ (không phải số, không bắt đầu bằng số 0).';
    }

    return null;
  }

  isValidPhone(phone: string): boolean {
    return this.getPhoneValidationError(phone) === null;
  }

  async emailExists(email: string): Promise<boolean> {
    return this.getUsers().some(u => u.email.toLowerCase() === email.trim().toLowerCase());
  }

  async phoneExists(phone: string): Promise<boolean> {
    return this.getUsers().some(u => u.phoneNumber === phone.trim());
  }

  async signup(data: { email: string; password: string; fullName: string; phoneNumber: string }): Promise<{ success: boolean; message: string }> {
    if (!this.isValidFullName(data.fullName)) {
      return { success: false, message: 'Sai định dạng.' };
    }

    if (!this.isValidEmail(data.email)) {
      return { success: false, message: 'Email không đúng định dạng.' };
    }

    const phoneError = this.getPhoneValidationError(data.phoneNumber);
    if (phoneError) {
      return { success: false, message: phoneError };
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

    if (user.status === 'locked') {
      return { success: false, message: 'Tài khoản của bạn đã bị tạm khóa. Vui lòng liên hệ hỗ trợ.' };
    }

    if (user.password !== password) {
      return { success: false, message: 'Mật khẩu không đúng.' };
    }

    const sessionToken = btoa(user.userId + ':' + Date.now());
    const currentUser = { ...user, token: sessionToken };
    sessionStorage.setItem(SESSION_KEY, JSON.stringify(currentUser));
    this.currentUserSubject.next(currentUser);
    return { success: true, message: 'Đăng nhập thành công.' };
  }

  logout(): void {
    sessionStorage.removeItem(SESSION_KEY);
    this.currentUserSubject.next(null);
  }

  getCurrentUser(): (User & { token: string }) | null {
    const raw = sessionStorage.getItem(SESSION_KEY);
    return raw ? JSON.parse(raw) : null;
  }

  isLoggedIn(): boolean {
    return this.getCurrentUser() !== null;
  }

  // --- BACK-OFFICE AUTHENTICATION & MANAGEMENT ---
  async adminLogin(email: string, password: string): Promise<{ success: boolean; message: string; user?: User }> {
    const users = this.getUsers();
    const user = users.find(u => u.email.toLowerCase() === email.trim().toLowerCase());

    if (!user) {
      return { success: false, message: 'Tài khoản không tồn tại trong hệ thống.' };
    }

    if (user.password !== password) {
      return { success: false, message: 'Mật khẩu không chính xác.' };
    }

    if (user.role === 'customer') {
      return { success: false, message: 'Tài khoản khách hàng không có quyền truy cập Back-office.' };
    }

    if (user.status === 'locked') {
      return { success: false, message: 'Tài khoản của bạn đã bị khóa bởi quản trị viên.' };
    }

    const sessionToken = btoa('admin:' + user.userId + ':' + Date.now());
    const adminUser = { ...user, token: sessionToken };
    sessionStorage.setItem(ADMIN_SESSION_KEY, JSON.stringify(adminUser));
    this.adminUserSubject.next(adminUser);

    return { success: true, message: `Đăng nhập thành công với vai trò ${user.role.toUpperCase()}`, user };
  }

  adminLogout(): void {
    sessionStorage.removeItem(ADMIN_SESSION_KEY);
    this.adminUserSubject.next(null);
  }

  getAdminUser(): (User & { token: string }) | null {
    const raw = sessionStorage.getItem(ADMIN_SESSION_KEY);
    return raw ? JSON.parse(raw) : null;
  }

  isAdminLoggedIn(): boolean {
    const admin = this.getAdminUser();
    return admin !== null && (admin.role === 'admin' || admin.role === 'staff' || admin.role === 'audit') && admin.status !== 'locked';
  }

  getAllUsers(): User[] {
    return this.getUsers();
  }

  updateUserRole(userId: string, newRole: 'admin' | 'staff' | 'audit' | 'customer'): boolean {
    const users = this.getUsers();
    const idx = users.findIndex(u => u.userId === userId);
    if (idx === -1) return false;

    users[idx].role = newRole;
    this.saveUsers(users);

    const admin = this.getAdminUser();
    if (admin && admin.userId === userId) {
      admin.role = newRole;
      sessionStorage.setItem(ADMIN_SESSION_KEY, JSON.stringify(admin));
      this.adminUserSubject.next(admin);
    }
    return true;
  }

  toggleUserStatus(userId: string): boolean {
    const users = this.getUsers();
    const idx = users.findIndex(u => u.userId === userId);
    if (idx === -1) return false;

    users[idx].status = users[idx].status === 'locked' ? 'active' : 'locked';
    this.saveUsers(users);

    const admin = this.getAdminUser();
    if (admin && admin.userId === userId && users[idx].status === 'locked') {
      this.adminLogout();
    }
    const current = this.getCurrentUser();
    if (current && current.userId === userId && users[idx].status === 'locked') {
      this.logout();
    }
    return true;
  }

  createUser(userData: Partial<User>): { success: boolean; message: string; user?: User } {
    if (!userData.email || !userData.fullName || !userData.password) {
      return { success: false, message: 'Vui lòng điền đầy đủ email, họ tên và mật khẩu.' };
    }

    const users = this.getUsers();
    if (users.some(u => u.email.toLowerCase() === userData.email!.trim().toLowerCase())) {
      return { success: false, message: 'Email đã tồn tại.' };
    }

    const newUser: User = {
      userId: 'U' + Date.now().toString(),
      email: userData.email.trim(),
      password: userData.password,
      fullName: userData.fullName.trim(),
      phoneNumber: (userData.phoneNumber || '').trim(),
      role: userData.role || 'customer',
      status: userData.status || 'active',
      createdAt: new Date().toISOString()
    };

    users.push(newUser);
    this.saveUsers(users);
    return { success: true, message: 'Tạo tài khoản thành công.', user: newUser };
  }

  // --- OTP PASSWORD RESET SIMULATION ---
  requestPasswordResetOtp(identifier: string): { success: boolean; message: string; otp?: string; identifierType: 'email' | 'phone'; maskedTarget: string } {
    const trimmed = identifier.trim();
    const users = this.getUsers();
    const isEmail = this.isValidEmail(trimmed);
    const normalizedPhone = trimmed.replace(/\s+/g, '');

    const user = isEmail
      ? users.find(u => u.email.toLowerCase() === trimmed.toLowerCase())
      : users.find(u => u.phoneNumber.replace(/\s+/g, '') === normalizedPhone);

    if (!user) {
      return {
        success: false,
        message: isEmail ? 'Không tìm thấy tài khoản với email này.' : 'Không tìm thấy tài khoản với số điện thoại này.',
        identifierType: isEmail ? 'email' : 'phone',
        maskedTarget: trimmed
      };
    }

    // Generate fixed/predictable 6-digit OTP for testing with high convenience
    const otp = '123456';
    const maskedTarget = isEmail
      ? user.email.replace(/(.{2})(.*)(?=@)/, (_gp1, h, b) => h + '*'.repeat(Math.max(b.length, 3)))
      : user.phoneNumber.replace(/(\d{3})\d{4}(\d{3})/, '$1****$2');

    sessionStorage.setItem('reset_otp_data', JSON.stringify({
      userId: user.userId,
      identifier: trimmed,
      otp,
      expiresAt: Date.now() + 5 * 60 * 1000 // 5 minutes
    }));

    return {
      success: true,
      message: `Mã OTP xác thực 6 chữ số đã được gửi tới ${maskedTarget}.`,
      otp,
      identifierType: isEmail ? 'email' : 'phone',
      maskedTarget
    };
  }

  verifyResetOtp(identifier: string, inputOtp: string): { success: boolean; message: string } {
    const raw = sessionStorage.getItem('reset_otp_data');
    if (!raw) {
      return { success: false, message: 'Yêu cầu OTP đã hết hạn hoặc không tồn tại. Vui lòng gửi lại mã.' };
    }

    try {
      const data = JSON.parse(raw);
      if (Date.now() > data.expiresAt) {
        return { success: false, message: 'Mã OTP đã hết hiệu lực. Vui lòng lấy mã mới.' };
      }

      if (data.otp !== inputOtp.trim()) {
        return { success: false, message: 'Mã OTP không chính xác. Vui lòng kiểm tra lại.' };
      }

      return { success: true, message: 'Xác thực OTP thành công.' };
    } catch {
      return { success: false, message: 'Lỗi xác thực OTP.' };
    }
  }

  async confirmPasswordResetWithOtp(identifier: string, inputOtp: string, newPassword: string): Promise<{ success: boolean; message: string }> {
    const verifyResult = this.verifyResetOtp(identifier, inputOtp);
    if (!verifyResult.success) {
      return verifyResult;
    }

    if (newPassword.trim().length < 6) {
      return { success: false, message: 'Mật khẩu mới phải có ít nhất 6 ký tự.' };
    }

    const raw = sessionStorage.getItem('reset_otp_data');
    if (!raw) return { success: false, message: 'Phiên đặt lại mật khẩu đã hết hạn.' };

    const data = JSON.parse(raw);
    const users = this.getUsers();
    const idx = users.findIndex(u => u.userId === data.userId);
    if (idx === -1) {
      return { success: false, message: 'Không tìm thấy tài khoản người dùng.' };
    }

    users[idx].password = newPassword.trim();
    this.saveUsers(users);
    sessionStorage.removeItem('reset_otp_data');

    return { success: true, message: 'Đặt lại mật khẩu thành công! Bạn có thể đăng nhập ngay.' };
  }

  async updateProfile(userId: string, data: Partial<Pick<User, 'fullName' | 'phoneNumber' | 'dateOfBirth' | 'gender' | 'avatarUrl'>>): Promise<{ success: boolean; message: string }> {
    const users = this.getUsers();
    const idx = users.findIndex(u => u.userId === userId);
    if (idx === -1) {
      return { success: false, message: 'Không tìm thấy người dùng.' };
    }

    if (data.fullName && !this.isValidFullName(data.fullName)) {
      return { success: false, message: 'Sai định dạng.' };
    }

    if (data.phoneNumber && !this.isValidPhone(data.phoneNumber)) {
      return { success: false, message: 'Số điện thoại phải gồm đúng 10 chữ số.' };
    }

    users[idx] = { ...users[idx], ...data };
    await this.saveUsers(users);

    const current = this.getCurrentUser();
    if (current && current.userId === userId) {
      const updatedUser = { ...users[idx], token: current.token };
      sessionStorage.setItem(SESSION_KEY, JSON.stringify(updatedUser));
      this.currentUserSubject.next(updatedUser);
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
      const updatedUser = { ...users[idx], token: current.token };
      sessionStorage.setItem(SESSION_KEY, JSON.stringify(updatedUser));
      this.currentUserSubject.next(updatedUser);
    }

    return { success: true, message: 'Đổi mật khẩu thành công.' };
  }

  async resetPassword(email: string, newPassword: string): Promise<{ success: boolean; message: string }> {
    const users = this.getUsers();
    const idx = users.findIndex(u => u.email.toLowerCase() === email.trim().toLowerCase());
    if (idx === -1) {
      return { success: false, message: 'Không tìm thấy tài khoản với email này.' };
    }

    if (newPassword.trim().length < 6) {
      return { success: false, message: 'Mật khẩu mới phải có ít nhất 6 ký tự.' };
    }

    users[idx] = { ...users[idx], password: newPassword };
    await this.saveUsers(users);

    const current = this.getCurrentUser();
    if (current && current.userId === users[idx].userId) {
      const updatedUser = { ...users[idx], token: current.token };
      sessionStorage.setItem(SESSION_KEY, JSON.stringify(updatedUser));
      this.currentUserSubject.next(updatedUser);
    }

    return { success: true, message: 'Mật khẩu đã được đặt lại. Vui lòng đăng nhập lại.' };
  }
}