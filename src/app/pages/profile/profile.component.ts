import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { OrderService } from '../../services/order.service';
import { AddressService } from '../../services/address.service';
import { ReviewService } from '../../services/review.service';
import { User } from '../../data/user.model';
import { Order } from '../../data/order.model';
import PRODUCTS from '../../data/mock-products.json';

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
  recommendedProducts: any[] = [];
  hasSurveyData = false;
  displaySkinType = '';
  displayProblems: string[] = [];
  displayTargets: string[] = [];
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

  reviewModalOpen = false;
  reviewOrder: Order | null = null;
  reviewableProducts: Array<{ productId: string; name: string }> = [];
  selectedReviewProductId = '';
  reviewDraft = {
    title: '',
    comment: '',
    rating: 0
  };
  reviewError = '';
  reviewSubmitting = false;

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
    private reviewService: ReviewService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.ensureHitidiSeedData();
    this.loadData();
    this.loadRecommendedProducts();
  }

  get memberSince(): string {
    if (!this.user?.createdAt) return '2025';
    const year = new Date(this.user.createdAt).getFullYear();
    return Number.isNaN(year) ? '2025' : String(year);
  }

  private getAccountSuffix(): string {
    return this.user ? `_${this.user.userId}` : '_guest';
  }

  private async loadData(): Promise<void> {
    this.user = this.authService.getCurrentUser();
    if (!this.user) return;

    this.orders = this.orderService.getByUserId(this.user.userId)
      .slice()
      .sort((a, b) => this.getOrderSortDate(b).getTime() - this.getOrderSortDate(a).getTime());

    const addr = await this.addressService.getDefault(this.user.userId);
    this.defaultAddress = addr ? addr.addressDetails : '';

    this.resetForm();
  }

  private getOrderSortDate(order: Order): Date {
    const value = (order as any).createdAt ?? (order as any).createdAtStr ?? '';
    if (value instanceof Date) {
      return value;
    }

    const parsed = value ? new Date(value) : new Date(0);
    return Number.isNaN(parsed.getTime()) ? new Date(0) : parsed;
  }
  private loadRecommendedProducts(): void {
    const suffix = this.getAccountSuffix();
    this.displaySkinType = sessionStorage.getItem('user_skin_type' + suffix) || '';
    const savedProblems = sessionStorage.getItem('user_skin_problems' + suffix);
    if (savedProblems) {
      try { this.displayProblems = JSON.parse(savedProblems); } catch(e) {}
    } else {
      this.displayProblems = [];
    }

    const savedTargets = sessionStorage.getItem('user_skin_targets' + suffix);
    if (savedTargets) {
      try { this.displayTargets = JSON.parse(savedTargets); } catch(e) {}
    } else {
      this.displayTargets = [];
    }

    if (!this.displaySkinType) {
      this.hasSurveyData = false;
      this.recommendedProducts = [];
      return;
    }

    this.hasSurveyData = true;
    const filtered = PRODUCTS.filter((product: any) => {
      const isSkinTypeMatch = product.targetSkinTypes.includes(this.displaySkinType);
      const isProblemMatch = product.targetSkinProblems.some((prob: any) => this.displayProblems.includes(prob));
      return isSkinTypeMatch && (isProblemMatch || product.targetSkinProblems.length === 0);
    });

    this.recommendedProducts = filtered.slice(0, 3);
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
      const savedAddress = await this.addressService.upsertDefault(this.user.userId, this.form.address.trim());
      this.defaultAddress = savedAddress.addressDetails;
      this.form.address = savedAddress.addressDetails;
    }

    this.editSuccess = 'Cập nhật thông tin thành công.';
    this.isEditing = false;
    await this.loadData();
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

  private ensureHitidiSeedData(): void {
    const currentUser = this.authService.getCurrentUser();
    if (!currentUser || currentUser.email !== 'hitidi@gmail.com') {
      return;
    }

    const existingOrders = this.orderService.getByUserId(currentUser.userId);
    if (existingOrders.length > 0) {
      return;
    }

    const product = PRODUCTS.find((item: any) => item.productId === 'SP01');
    if (!product) {
      return;
    }

    const seededOrder: Order = {
      orderId: 'ORD100',
      userId: currentUser.userId,
      items: [{
        product,
        quantity: 1,
        price: product.price
      }],
      shippingInfo: {
        fullName: currentUser.fullName,
        phone: currentUser.phoneNumber,
        email: currentUser.email,
        city: 'TP.HCM',
        district: 'Quận 1',
        address: '123 Nguyễn Huệ'
      },
      shippingMethod: 'standard',
      paymentMethod: 'cod',
      subtotal: product.price,
      shippingFee: 30000,
      discount: 0,
      total: product.price + 30000,
      status: 'delivered',
      createdAt: new Date('2026-06-20T09:00:00.000Z'),
      updatedAt: new Date('2026-06-20T09:00:00.000Z'),
      totalAmount: product.price + 30000,
      orderStatus: 'Completed'
    };

    const storedOrders = JSON.parse(localStorage.getItem('orders') || '[]');
    storedOrders.push(seededOrder);
    localStorage.setItem('orders', JSON.stringify(storedOrders));
  }

  canReviewOrder(order: Order): boolean {
    if (!this.user) {
      return false;
    }

    return (order.items || []).some(item => {
      const productId = (item as any).product?.productId || (item as any).productId;
      return !!productId && !this.reviewService.getByUserAndProduct(this.user!.userId, productId);
    });
  }

  openReviewModal(order: Order): void {
    if (!this.user) {
      return;
    }

    const reviewableItems = (order.items || []).filter(item => {
      const productId = (item as any).product?.productId || (item as any).productId;
      return !!productId && !this.reviewService.getByUserAndProduct(this.user!.userId, productId);
    });

    if (reviewableItems.length === 0) {
      this.reviewError = 'Bạn đã đánh giá hết sản phẩm trong đơn hàng này.';
      return;
    }

    this.reviewOrder = order;
    this.reviewableProducts = reviewableItems.map(item => ({
      productId: (item as any).product?.productId || (item as any).productId,
      name: (item as any).product?.name || (item as any).productName || 'Sản phẩm'
    }));
    this.selectedReviewProductId = this.reviewableProducts[0].productId;
    this.reviewDraft = { title: '', comment: '', rating: 0 };
    this.reviewError = '';
    this.reviewModalOpen = true;
  }

  closeReviewModal(): void {
    this.reviewModalOpen = false;
    this.reviewOrder = null;
    this.reviewableProducts = [];
    this.selectedReviewProductId = '';
    this.reviewDraft = { title: '', comment: '', rating: 0 };
    this.reviewError = '';
    this.reviewSubmitting = false;
  }

  selectReviewStar(rating: number): void {
    this.reviewDraft.rating = rating;
  }

  async submitReview(): Promise<void> {
    if (!this.user || !this.reviewOrder || !this.selectedReviewProductId) {
      return;
    }

    if (this.reviewDraft.rating === 0) {
      this.reviewError = 'Vui lòng chọn số sao';
      return;
    }

    if (!this.reviewDraft.title.trim() || !this.reviewDraft.comment.trim()) {
      this.reviewError = 'Vui lòng nhập tiêu đề và nội dung đánh giá.';
      return;
    }

    this.reviewSubmitting = true;
    this.reviewError = '';

    try {
      this.reviewService.create({
        productId: this.selectedReviewProductId,
        userId: this.user.userId,
        userName: this.user.fullName,
        orderId: this.reviewOrder.orderId,
        title: this.reviewDraft.title.trim(),
        rating: this.reviewDraft.rating,
        comment: this.reviewDraft.comment.trim(),
        images: []
      });

      this.reviewSubmitting = false;
      this.closeReviewModal();
      this.loadData();
    } catch (error) {
      this.reviewSubmitting = false;
      this.reviewError = 'Đã có lỗi xảy ra, vui lòng thử lại.';
    }
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
    this.hasSurveyData = false;
    this.displaySkinType = '';
    this.displayProblems = [];
    this.displayTargets = [];
    this.router.navigate(['/login']);
  }
}