import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { OrderService } from '../../services/order.service';
import { AddressService } from '../../services/address.service';
import { User } from '../../data/user.model';
import { Order } from '../../data/order.model';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css']
})
export class ProfileComponent implements OnInit {
  user: (User & { token: string }) | null = null;

  orders: Order[] = [];
  defaultAddress = '';
  selectedOrder: Order | null = null;

  isEditing = false;
  editError = '';
  editSuccess = '';

  isChangingPassword = false;
  passwordError = '';
  passwordSuccess = '';

  passwordForm = {
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  };

  form = {
    fullName: '',
    phoneNumber: '',
    dateOfBirth: '',
    gender: '' as '' | 'Nam' | 'Nữ' | 'Khác',
    address: ''
  };

  readonly heroImage = 'https://lh3.googleusercontent.com/aida-public/AB6AXuAf6L8PVZ7PN0KDzXMc8pq2VkYINUGaXiNgZTaQrTO7luDfG_NIbd5moQKCEqV830s94aODfBcM0SBR0DXt5VU5xrONXrnn3D3bRC8rstKBIYQpRWRYmtvlpOT206TaZntBexbKd2vQIzV-rVzwbQS_ID6Th_3CosQQCF6lXaGnuKbH9-iesFCgyOwNatrQB0gWZklIdz-pM3YOfAiqyO92S96Gl0yKQvs0SJdjf6Hrq1Qj4WajA4HgiChDP0Y60uLq9qEsTWI059I';

  constructor(
    private authService: AuthService,
    private orderService: OrderService,
    private addressService: AddressService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadData();
  }

  get memberSince(): string {
    if (!this.user?.createdAt) return '2025';
    const year = new Date(this.user.createdAt).getFullYear();
    return Number.isNaN(year) ? '2025' : String(year);
  }

  private async loadData(): Promise<void> {
    this.user = this.authService.getCurrentUser();
    if (!this.user) return;

    this.orders = this.orderService.getByUserId(this.user.userId)
      .slice()
      .sort((a, b) => (b.createdAt || '').localeCompare(a.createdAt || ''));

    const addr = await this.addressService.getDefault(this.user.userId);
    this.defaultAddress = addr ? addr.addressDetails : '';

    this.resetForm();
  }

  private resetForm(): void {
    if (!this.user) return;
    this.form = {
      fullName: this.user.fullName,
      phoneNumber: this.user.phoneNumber,
      dateOfBirth: this.user.dateOfBirth || '',
      gender: this.user.gender || '',
      address: this.defaultAddress
    };
  }

  startEdit(): void {
    this.isEditing = true;
    this.editError = '';
    this.editSuccess = '';
    this.isChangingPassword = false;
    this.passwordError = '';
    this.passwordSuccess = '';
    this.resetForm();
  }

  startChangePassword(): void {
    this.isChangingPassword = true;
    this.passwordError = '';
    this.passwordSuccess = '';
    this.isEditing = false;
    this.editError = '';
    this.editSuccess = '';
    this.passwordForm = {
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    };
  }

  startManageAddress(): void {
    this.startEdit();
  }

  cancelEdit(): void {
    this.isEditing = false;
    this.editError = '';
    this.resetForm();
  }

  cancelChangePassword(): void {
    this.isChangingPassword = false;
    this.passwordError = '';
    this.passwordSuccess = '';
    this.passwordForm = {
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    };
  }

  async saveProfile(): Promise<void> {
    if (!this.user) return;
    this.editError = '';
    this.editSuccess = '';

    if (!this.form.fullName.trim()) {
      this.editError = 'Họ và tên không được để trống.';
      return;
    }

    const result = await this.authService.updateProfile(this.user.userId, {
      fullName: this.form.fullName.trim(),
      phoneNumber: this.form.phoneNumber.trim(),
      dateOfBirth: this.form.dateOfBirth.trim(),
      gender: this.form.gender || undefined
    });

    if (!result.success) {
      this.editError = result.message;
      return;
    }

    if (this.form.address.trim()) {
      await this.addressService.upsertDefault(this.user.userId, this.form.address.trim());
    }

    this.editSuccess = 'Cập nhật thông tin thành công.';
    this.isEditing = false;
    this.loadData();
  }

  async savePassword(): Promise<void> {
    if (!this.user) return;

    this.passwordError = '';
    this.passwordSuccess = '';

    if (!this.passwordForm.currentPassword.trim()) {
      this.passwordError = 'Vui lòng nhập mật khẩu hiện tại.';
      return;
    }

    if (!this.passwordForm.newPassword.trim()) {
      this.passwordError = 'Vui lòng nhập mật khẩu mới.';
      return;
    }

    if (this.passwordForm.newPassword.trim().length < 6) {
      this.passwordError = 'Mật khẩu mới phải có ít nhất 6 ký tự.';
      return;
    }

    if (this.passwordForm.confirmPassword.trim() !== this.passwordForm.newPassword.trim()) {
      this.passwordError = 'Mật khẩu xác nhận không khớp.';
      return;
    }

    const result = await this.authService.changePassword(
      this.user.userId,
      this.passwordForm.currentPassword,
      this.passwordForm.newPassword
    );

    if (!result.success) {
      this.passwordError = result.message;
      return;
    }

    this.passwordSuccess = result.message;
    this.isChangingPassword = false;
    this.passwordForm = {
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    };
    this.loadData();
  }

  formatCurrency(value: number | undefined): string {
    const amount = value ?? 0;
    return amount.toLocaleString('vi-VN') + ' VNĐ';
  }

  getStatusLabel(status: Order['orderStatus']): string {
    const map: Record<Order['orderStatus'], string> = {
      'Pending': 'Chờ xử lý',
      'Processing': 'Đang xử lý',
      'Shipping': 'Đang giao hàng',
      'Completed': 'Hoàn tất',
      'Cancelled': 'Đã hủy'
    };
    return map[status];
  }

  getPaymentMethodLabel(method: Order['paymentMethod']): string {
    const map: Record<Order['paymentMethod'], string> = {
      cod: 'Tiền mặt (COD)',
      bank_transfer: 'Chuyển khoản',
      e_wallet: 'Ví điện tử',
      credit_card: 'Thẻ quốc tế'
    };
    return map[method];
  }

  getShippingMethodLabel(method: Order['shippingMethod']): string {
    return method === 'standard' ? 'Giao hàng tiêu chuẩn' : 'Giao hàng nhanh';
  }

  viewOrderDetails(order: Order): void {
    this.selectedOrder = order;
  }

  closeOrderDetails(): void {
    this.selectedOrder = null;
  }

  trackSelectedOrder(): void {
    if (!this.selectedOrder) return;
    this.router.navigate(['/order-tracking'], {
      queryParams: { orderId: this.selectedOrder.orderId }
    });
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}