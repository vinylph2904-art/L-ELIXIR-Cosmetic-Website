import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { CartService } from '../../services/cart.service';
import { CheckoutService, User, Address } from '../../services/checkout.service';
import { OrderService } from '../../services/order.service';
import { Order, ShippingInfo } from '../../data/order.model';
import { Product } from '../../data/product.model';

@Component({
  selector: 'app-payment',
  templateUrl: './payment.component.html',
  styleUrls: ['./payment.component.css']
})
export class PaymentComponent implements OnInit, OnDestroy {
  // Form state
  isGuest = true;
  isSubmitting = false;
  errorMessage = '';
  successMessage = '';

  // Cart items
  cartItems: Product[] = [];
  subtotal = 0;
  shippingFee = 30000; // Default standard shipping

  // Member checkout state
  currentUser: User | null = null;
  shippingFullName = '';
  shippingPhone = '';
  shippingAddress = '';
  isEditingAddress = false;
  addressForm = {
    fullName: '',
    phone: '',
    address: '',
    makeDefault: false
  };
  errors: { fullName?: string; phone?: string; address?: string } = {};

  // Form data for guest checkout
  shippingInfo: ShippingInfo = {
    fullName: '',
    phone: '',
    email: '',
    city: '',
    district: '',
    address: '',
    note: ''
  };

  selectedShippingMethod: 'standard' | 'express' = 'standard';
  selectedPaymentMethod: 'cod' | 'bank_transfer' | 'e_wallet' | 'credit_card' = 'bank_transfer';
  discountCode = '';
  discount = 0;

  private destroy$ = new Subject<void>();

  constructor(
    private cartService: CartService,
    private checkoutService: CheckoutService,
    private orderService: OrderService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadCart();

    this.currentUser = this.checkoutService.getCurrentUser();
    if (!this.currentUser) {
      this.router.navigate(['/login']);
      return;
    }

    this.loadMemberCheckout();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  /**
   * Load member checkout state from session
   */
  private loadMemberCheckout(): void {
    this.currentUser = this.checkoutService.getCurrentUser();

    if (this.currentUser) {
      this.isGuest = false;
      this.useCurrentUserAddress();
    }
  }

  /**
   * Apply current user and default address to shipping fields
   */
  private useCurrentUserAddress(): void {
    if (!this.currentUser) {
      return;
    }

    const defaultAddress = this.checkoutService.getDefaultAddress(this.currentUser.userId);
    this.shippingFullName = this.currentUser.fullName;
    this.shippingPhone = this.currentUser.phoneNumber;
    this.shippingAddress = defaultAddress?.fullAddress ?? '';

    this.addressForm.fullName = this.shippingFullName;
    this.addressForm.phone = this.shippingPhone;
    this.addressForm.address = this.shippingAddress;
    this.addressForm.makeDefault = false;
    this.errors = {};
    this.isEditingAddress = false;
  }

  /**
   * Load cart items from CartService
   */
  private loadCart(): void {
    this.cartItems = this.cartService.getCart();
    this.calculateSubtotal();

    if (this.cartItems.length === 0) {
      this.errorMessage = 'Giỏ hàng trống. Vui lòng thêm sản phẩm trước khi tiếp tục.';
    }
  }

  /**
   * Calculate subtotal from cart items
   */
  private calculateSubtotal(): void {
    this.subtotal = this.cartItems.reduce((sum, item) => {
      return sum + (item.price * (item.quantity || 1));
    }, 0);
  }

  /**
   * Toggle between guest and account checkout
   */
  toggleAuthMode(isLogin: boolean): void {
    if (isLogin && !this.currentUser) {
      this.router.navigate(['/login']);
      return;
    }

    this.isGuest = !isLogin;

    if (!this.isGuest) {
      this.useCurrentUserAddress();
    }
  }

  /**
   * Handle shipping method change
   */
  onShippingMethodChange(method: 'standard' | 'express'): void {
    this.selectedShippingMethod = method;
    this.shippingFee = method === 'standard' ? 30000 : 50000;
  }

  /**
   * Handle payment method change
   */
  onPaymentMethodChange(method: 'cod' | 'bank_transfer' | 'e_wallet' | 'credit_card'): void {
    this.selectedPaymentMethod = method;
  }

  /**
   * Apply discount code
   */
  applyDiscount(): void {
    // TODO: Implement discount code validation with backend
    // For now, just show a message
    if (this.discountCode.trim()) {
      // Example: WELCOME10 = 10% off
      if (this.discountCode.toUpperCase() === 'WELCOME10') {
        this.discount = Math.floor(this.subtotal * 0.1);
        this.successMessage = 'Mã giảm giá đã được áp dụng!';
        setTimeout(() => this.successMessage = '', 3000);
      } else {
        this.errorMessage = 'Mã giảm giá không hợp lệ';
        setTimeout(() => this.errorMessage = '', 3000);
      }
    }
  }

  /**
   * Calculate total amount
   */
  getTotal(): number {
    return this.subtotal + this.shippingFee - this.discount;
  }

  /**
   * Open the address edit form for member checkout
   */
  openEditAddress(): void {
    this.isEditingAddress = true;
    this.addressForm.fullName = this.shippingFullName;
    this.addressForm.phone = this.shippingPhone;
    this.addressForm.address = this.shippingAddress;
    this.addressForm.makeDefault = false;
    this.errors = {};
  }

  /**
   * Apply new shipping address values from edit form
   */
  applyNewAddress(): void {
    this.errors = {};

    if (!this.validateAddressForm()) {
      return;
    }

    this.shippingFullName = this.addressForm.fullName.trim();
    this.shippingPhone = this.addressForm.phone.trim();
    this.shippingAddress = this.addressForm.address.trim();
    this.isEditingAddress = false;

    if (this.addressForm.makeDefault && this.currentUser) {
      const address: Address = {
        addressId: `ADDR-${Date.now()}`,
        userId: this.currentUser.userId,
        fullAddress: this.shippingAddress,
        isDefault: true
      };
      this.checkoutService.addOrUpdateAddress(address);
    }
  }

  /**
   * Validate member checkout shipping fields
   */
  private validateAddressForm(): boolean {
    const fullName = this.addressForm.fullName?.trim();
    const phone = this.addressForm.phone?.trim();
    const address = this.addressForm.address?.trim();

    if (!fullName) {
      this.errors.fullName = 'Họ tên không được để trống';
    }

    if (!phone) {
      this.errors.phone = 'Số điện thoại không được để trống';
    } else if (!/^0\d{9}$/.test(phone)) {
      this.errors.phone = 'Số điện thoại phải là 10 chữ số và bắt đầu bằng 0';
    }

    if (!address) {
      this.errors.address = 'Địa chỉ giao hàng không được để trống';
    } else if (address.length < 10) {
      this.errors.address = 'Địa chỉ phải có ít nhất 10 ký tự';
    }

    return Object.keys(this.errors).length === 0;
  }

  /**
   * Validate member checkout shipping fields before confirmation
   */
  private validateShippingFields(): boolean {
    this.errors = {};
    const fullName = this.shippingFullName?.trim();
    const phone = this.shippingPhone?.trim();
    const address = this.shippingAddress?.trim();

    if (!fullName) {
      this.errors.fullName = 'Họ tên không được để trống';
    }

    if (!phone) {
      this.errors.phone = 'Số điện thoại không được để trống';
    } else if (!/^0\d{9}$/.test(phone)) {
      this.errors.phone = 'Số điện thoại phải là 10 chữ số và bắt đầu bằng 0';
    }

    if (!address) {
      this.errors.address = 'Địa chỉ giao hàng không được để trống';
    } else if (address.length < 10) {
      this.errors.address = 'Địa chỉ phải có ít nhất 10 ký tự';
    }

    return Object.keys(this.errors).length === 0;
  }

  /**
   * Determine if member checkout can submit
   */
  canSubmitMemberCheckout(): boolean {
    return !!(
      this.shippingFullName?.trim() &&
      this.shippingPhone?.trim() &&
      this.shippingAddress?.trim() &&
      !this.errors.fullName &&
      !this.errors.phone &&
      !this.errors.address
    );
  }

  /**
   * Confirm order for logged in member
   */
  confirmOrder(): void {
    if (!this.currentUser) {
      this.router.navigate(['/login']);
      return;
    }

    if (!this.validateShippingFields()) {
      return;
    }

    try {
      const order = this.checkoutService.createOrder({
        userId: this.currentUser.userId,
        totalAmount: this.getTotal(),
        shippingFullName: this.shippingFullName.trim(),
        shippingPhone: this.shippingPhone.trim(),
        shippingAddress: this.shippingAddress.trim(),
        orderStatus: 'Pending'
      });

      sessionStorage.setItem('pendingOrderId', order.orderId);
      this.router.navigate(['/payment-success'], {
        queryParams: { orderId: order.orderId }
      });
    } catch (error: any) {
      this.errorMessage = error?.message || 'Không thể tạo đơn hàng';
    }
  }

  /**
   * UC09: Handle guest checkout submission
   * Bước 3-4: Khách nhập thông tin và hệ thống kiểm tra & khởi tạo đơn hàng
   */
  onSubmitOrder(): void {
    this.errorMessage = '';
    this.successMessage = '';

    // Validate shipping info
    if (!this.validateForm()) {
      return;
    }

    this.isSubmitting = true;

    try {
      // UC09 Step 4: Hệ thống kiểm tra tính hợp lệ của dữ liệu
      // và khởi tạo dữ liệu đơn hàng tạm thời ở trạng thái "Chờ thanh toán"
      this.orderService.createGuestOrder(
        this.cartItems,
        this.shippingInfo,
        this.selectedShippingMethod,
        this.selectedPaymentMethod
      ).pipe(
        takeUntil(this.destroy$)
      ).subscribe({
        next: (order: Order) => {
          console.log('Order created:', order);
          this.orderService.completeOrder(order.orderId).pipe(
            takeUntil(this.destroy$)
          ).subscribe({
            next: () => {
              this.isSubmitting = false;
              this.router.navigate(['/payment-success'], {
                queryParams: { orderId: order.orderId }
              });
            },
            error: (err: any) => {
              this.isSubmitting = false;
              this.errorMessage = err.message || 'Không thể hoàn tất đơn hàng';
              console.error('Order completion error:', err);
            }
          });
        },
        error: (err: any) => {
          this.isSubmitting = false;
          this.errorMessage = err.message || 'Có lỗi xảy ra khi tạo đơn hàng';
          console.error('Order creation error:', err);
        }
      });
    } catch (error: any) {
      this.isSubmitting = false;
      this.errorMessage = error.message || 'Có lỗi xảy ra';
    }
  }

  /**
   * Validate form data
   */
  private validateForm(): boolean {
    // Reset error
    this.errorMessage = '';

    // Validate full name
    if (!this.shippingInfo.fullName?.trim()) {
      this.errorMessage = 'Vui lòng nhập họ và tên';
      return false;
    }

    // Validate phone
    if (!this.shippingInfo.phone?.trim()) {
      this.errorMessage = 'Vui lòng nhập số điện thoại';
      return false;
    }

    if (!this.isValidPhone(this.shippingInfo.phone)) {
      this.errorMessage = 'Số điện thoại không hợp lệ (từ 10-11 chữ số)';
      return false;
    }

    // Validate email
    if (!this.shippingInfo.email?.trim()) {
      this.errorMessage = 'Vui lòng nhập email';
      return false;
    }

    if (!this.isValidEmail(this.shippingInfo.email)) {
      this.errorMessage = 'Email không hợp lệ';
      return false;
    }

    // Validate city
    if (!this.shippingInfo.city?.trim()) {
      this.errorMessage = 'Vui lòng chọn tỉnh/thành phố';
      return false;
    }

    // Validate district
    if (!this.shippingInfo.district?.trim()) {
      this.errorMessage = 'Vui lòng chọn quận/huyện';
      return false;
    }

    // Validate address
    if (!this.shippingInfo.address?.trim()) {
      this.errorMessage = 'Vui lòng nhập địa chỉ chi tiết';
      return false;
    }

    return true;
  }

  /**
   * Validate email format
   */
  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  /**
   * Validate phone number
   */
  private isValidPhone(phone: string): boolean {
    const phoneRegex = /^(0\d{9,10}|\+84\d{9,10})$/;
    return phoneRegex.test(phone.replace(/\s+/g, ''));
  }
}
