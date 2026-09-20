import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { Router } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { CartService } from '../../services/cart.service';
import { OrderService } from '../../services/order.service';
import { AuthService } from '../../services/auth.service';
import { AddressService } from '../../services/address.service';
import { Order, ShippingInfo } from '../../data/order.model';
import { Product } from '../../data/product.model';
import { Address } from '../../data/address.model';

@Component({
  selector: 'app-payment',
  templateUrl: './payment.component.html',
  styleUrls: ['./payment.component.css']
})
export class PaymentComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();

  // UI state
  isGuest = true;
  isSubmitting = false;
  errorMessage = '';
  successMessage = '';

  // Cart
  cartItems: Product[] = [];
  subtotal = 0;
  shippingFee = 30000;
  discount = 0;
  discountCode = '';

  // Shipping & payment
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
  selectedPaymentMethod: 'cod' | 'bank_transfer' | 'e_wallet' | 'credit_card' = 'cod';

  districtsByCity: { [key: string]: { value: string, label: string }[] } = {
  'Ho Chi Minh': [
    { value: 'District 1', label: 'Quận 1' },
    { value: 'District 3', label: 'Quận 3' },
    { value: 'District 7', label: 'Quận 7' },
  ],
  'Ha Noi': [
    { value: 'Ba Dinh', label: 'Ba Đình' },
    { value: 'Hoan Kiem', label: 'Hoàn Kiếm' },
    { value: 'Cau Giay', label: 'Cầu Giấy' },
  ],
  'Da Nang': [
    { value: 'Hai Chau', label: 'Hải Châu' },
    { value: 'Thanh Khe', label: 'Thanh Khê' },
    { value: 'Son Tra', label: 'Sơn Trà' },
  ],
};

get currentDistricts() {
  return this.districtsByCity[this.shippingInfo.city] || [];
}

onCityChange() {
  this.shippingInfo.district = '';
  this.saveShippingInfoToSession();
}




  // Address
  userAddresses: Address[] = [];
  selectedAddressId: string | null = null;

  // Current user
  private currentUserId: string | null = null;

  // Terms acceptance
  termsAccepted = false;

  // Simulator
  public showSimulator: boolean = false;
  simulatorMethod: 'cod' | 'bank_transfer' | 'e_wallet' | 'credit_card' | null = null;
  countdown = 15;
  private countdownInterval: any = null;
  cardNumber = '';
  cardExpiry = '';
  cardCvv = '';
  cardError = '';
  currentOrder: Order | null = null;

  constructor(
    private cartService: CartService,
    private orderService: OrderService,
    private authService: AuthService,
    private addressService: AddressService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    console.clear();
    console.log('╔════════ PAYMENT COMPONENT INIT ════════╗');
    
    // Subscribe vào Observable
    this.authService.currentUser$
      .pipe(takeUntil(this.destroy$))
      .subscribe(user => {
        console.log('[PaymentComponent] currentUser$ updated:', user);
        
        if (user) {
          this.isGuest = false;
          this.currentUserId = user.userId;
          
          this.shippingInfo = {
            fullName: user.fullName || '',
            phone: user.phoneNumber || '',
            email: user.email || '',
            city: '',
            district: '',
            address: '',
            note: ''
          };
          
          console.log('[PaymentComponent] shippingInfo set:', this.shippingInfo);
          this.loadUserAddresses();
        } else {
          console.log('[PaymentComponent] User logged out - guest mode');
          this.isGuest = true;
          this.resetShippingInfo();
        }
        
        this.cdr.markForCheck();
      });
    
    const selectedItems = sessionStorage.getItem('selectedCheckoutItems');
    if (selectedItems) {
      try {
        this.cartItems = JSON.parse(selectedItems) as Product[];
      } catch {
        sessionStorage.removeItem('selectedCheckoutItems');
        this.cartItems = this.cartService.getCart();
      }
    } else {
      this.cartItems = this.cartService.getCart();
    }
    this.loadShippingInfoFromSession();
    this.recalcSubtotal();
    
    console.log('╚═══════════════════════════════════════╝');
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    this.stopCountdown();
  }

  private loadUserAddresses(): void {
    if (!this.currentUserId) return;

    console.log('[PaymentComponent] Loading addresses for user:', this.currentUserId);

    this.addressService.getUserAddresses(this.currentUserId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (addresses) => {
          console.log('[PaymentComponent] Addresses loaded:', addresses);
          this.userAddresses = addresses;
          
          const defaultAddr = addresses.find(a => a.isDefault) || addresses[0];
          if (defaultAddr) {
            this.selectAddress(defaultAddr.addressId);
          }
          
          this.cdr.markForCheck();
        },
        error: (err) => {
          console.error('[PaymentComponent] Load addresses error:', err);
        }
      });
  }

  selectAddress(addressId: string | null): void {
    if (!addressId) return;
    
    const addr = this.userAddresses.find(a => a.addressId === addressId);
    console.log('[PaymentComponent] Selected address:', addr);
    
    if (addr) {
      this.selectedAddressId = addressId;
      this.shippingInfo = {
        ...this.shippingInfo,
        fullName: addr.receiverName || this.shippingInfo.fullName,
        phone: addr.receiverPhone || this.shippingInfo.phone,
        address: addr.addressDetails || this.shippingInfo.address,
        note: this.shippingInfo.note || ''
      };
      
      this.cdr.markForCheck();
    }
  }

  private getShippingInfoStorageKey(): string {
    return this.currentUserId ? `shippingInfo_user_${this.currentUserId}` : 'shippingInfo_guest';
  }

  private resetShippingInfo(): void {
    const previousStorageKey = this.getShippingInfoStorageKey();
    sessionStorage.removeItem(previousStorageKey);

    this.shippingInfo = { 
      fullName: '', 
      phone: '', 
      email: '', 
      city: '', 
      district: '', 
      address: '', 
      note: '' 
    };
    this.currentUserId = null;
    this.userAddresses = [];
  }

  private saveShippingInfoToSession(): void {
    sessionStorage.setItem(this.getShippingInfoStorageKey(), JSON.stringify(this.shippingInfo));
  }

  private loadShippingInfoFromSession(): void {
    const storageKey = this.getShippingInfoStorageKey();
    const saved = sessionStorage.getItem(storageKey);
    if (saved) {
      try {
        this.shippingInfo = {
          ...this.shippingInfo,
          ...JSON.parse(saved)
        };
      } catch {
        sessionStorage.removeItem(storageKey);
      }
    }
  }

  toggleAuthMode(useAccount: boolean) {
    console.log('[PaymentComponent] toggleAuthMode:', useAccount);
    this.isGuest = !useAccount;
    
    if (!useAccount) {
      this.resetShippingInfo();
    }
    
    this.cdr.markForCheck();
  }

  onShippingMethodChange(method: 'standard' | 'express') {
    this.selectedShippingMethod = method;
    this.shippingFee = method === 'standard' ? 30000 : 50000;
  }

  onPaymentMethodChange(method: 'cod' | 'bank_transfer' | 'e_wallet' | 'credit_card') {
    this.selectedPaymentMethod = method;
  }

  applyDiscount() {
    if (this.discountCode && this.discountCode.trim().toUpperCase() === 'LELIXIR10') {
      this.discount = Math.round(this.subtotal * 0.1);
      this.successMessage = 'Áp dụng mã giảm giá thành công.';
      this.errorMessage = '';
    } else {
      this.errorMessage = 'Mã giảm giá không hợp lệ.';
      this.successMessage = '';
    }
  }

  recalcSubtotal() {
    this.subtotal = this.cartItems.reduce((s, p) => s + ((p.quantity || 1) * (p.price || 0)), 0);
  }

  getTotal() {
    return this.subtotal + this.shippingFee - this.discount;
  }

  private validateForm(): boolean {
    const { fullName, phone, email, city, district, address } = this.shippingInfo;
    const normalizedPhone = phone.replace(/[\s-]+/g, '');

    if (!fullName?.trim()) {
      this.errorMessage = 'Vui lòng nhập họ và tên.';
      return false;
    }

    if (!phone?.trim()) {
      this.errorMessage = 'Vui lòng nhập số điện thoại.';
      return false;
    }

    const phoneError = this.authService.getPhoneValidationError(normalizedPhone);
    if (phoneError) {
      this.errorMessage = phoneError;
      return false;
    }
    if (!email?.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      this.errorMessage = 'Email không đúng định dạng.';
      return false;
    }
    if (!city?.trim()) {
      this.errorMessage = 'Vui lòng chọn tỉnh/thành phố.';
      return false;
    }
    if (!district?.trim()) {
      this.errorMessage = 'Vui lòng chọn quận/huyện.';
      return false;
    }
    if (!address?.trim()) {
      this.errorMessage = 'Vui lòng nhập địa chỉ chi tiết.';
      return false;
    }

    if (!this.termsAccepted) {
      this.errorMessage = 'Vui lòng đồng ý với điều khoản dịch vụ trước khi thanh toán.';
      return false;
    }

    return true;
  }

  onSubmitOrder() {
    this.errorMessage = '';
    this.successMessage = '';

    if (!this.validateForm()) {
      return;
    }

    this.isSubmitting = true;

    if (!this.isGuest && this.currentUserId) {
      const newAddress: Omit<Address, 'addressId'> = {
        userId: this.currentUserId,
        receiverName: this.shippingInfo.fullName,
        receiverPhone: this.shippingInfo.phone,
        addressDetails: this.shippingInfo.address,
        isDefault: false
      };

      this.addressService.createAddress(newAddress)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: () => {
            this.proceedWithOrder();
          },
          error: (err) => {
            this.isSubmitting = false;
            this.errorMessage = 'Lỗi lưu địa chỉ: ' + err.message;
          }
        });
    } else {
      this.proceedWithOrder();
    }
  }

  private proceedWithOrder() {
    this.orderService.createGuestOrder(this.cartItems, this.shippingInfo, this.selectedShippingMethod, this.selectedPaymentMethod)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (order) => {
          this.currentOrder = order;
          this.orderService.initiatePayment(order).pipe(takeUntil(this.destroy$)).subscribe({
            next: (resp) => {
              this.isSubmitting = false;
              const redirectUrl = resp.redirectUrl;

              if (redirectUrl) {
                if (redirectUrl.startsWith('/')) {
                  if (order.paymentMethod === 'cod') {
                    const transactionId = `COD-${Date.now()}`;
                    this.orderService.confirmPaymentSuccess(order.orderId, transactionId)
                      .pipe(takeUntil(this.destroy$))
                      .subscribe({
                        next: () => {
                          this.cartService.clearCart();
                          this.router.navigateByUrl(redirectUrl);
                        },
                        error: () => {
                          this.cartService.clearCart();
                          this.router.navigateByUrl(redirectUrl);
                        }
                      });
                  } else {
                    this.router.navigateByUrl(redirectUrl);
                  }
                } else {
                  window.location.href = redirectUrl;
                }
              } else {
                this.simulatorMethod = order.paymentMethod;
                this.showSimulator = true;
                this.startCountdown();
              }
            },
            error: (err) => {
              this.isSubmitting = false;
              this.errorMessage = 'Không thể kết nối với cổng thanh toán';
            }
          });
        },
        error: (err) => {
          this.isSubmitting = false;
          this.errorMessage = err.message || 'Có lỗi xảy ra khi tạo đơn hàng';
        }
      });
  }

  public simulateSuccess = () => {
    if (!this.currentOrder) return;
    sessionStorage.removeItem(this.getShippingInfoStorageKey());
    const txId = `TX${Date.now()}`;
    this.orderService.confirmPaymentSuccess(this.currentOrder.orderId, txId).pipe(takeUntil(this.destroy$)).subscribe({
      next: (order) => {
        this.cartService.clearCart();
        this.showSimulator = false;
        this.router.navigate(['/payment-success'], { queryParams: { orderId: order.orderId, transactionId: txId } });
      },
      error: (err) => {
        this.errorMessage = err?.message || 'Xác nhận thất bại';
      }
    });
  }

  public simulateFailure = () => {
    if (!this.currentOrder) return;
    this.orderService.handlePaymentFailure(this.currentOrder.orderId).pipe(takeUntil(this.destroy$)).subscribe({
      next: () => {
        this.showSimulator = false;
        this.errorMessage = 'Thanh toán thất bại. Vui lòng thử lại.';
        this.router.navigate(['/payment-failure']);
      },
      error: (err) => {
        this.errorMessage = err?.message || 'Xử lý thất bại';
      }
    });
  }

  private startCountdown() {
  this.countdown = 15;
  this.countdownInterval = setInterval(() => {
    this.countdown--;
    this.cdr.markForCheck();
    if (this.countdown <= 0) {
      this.stopCountdown();
      this.simulateFailure();
    }
  }, 1000);
}

private stopCountdown() {
  if (this.countdownInterval) {
    clearInterval(this.countdownInterval);
    this.countdownInterval = null;
  }
}

  confirmCardPayment() {
    const cleanNumber = this.cardNumber.replace(/\s+/g, '');
    const validTestCard = '4242424242424242'; // số thẻ giả lập hợp lệ

    if (cleanNumber !== validTestCard) {
      this.cardError = 'Số thẻ không hợp lệ. Dùng thẻ test: 4242 4242 4242 4242';
      return;
    }
    if (!/^\d{2}\/\d{2}$/.test(this.cardExpiry)) {
      this.cardError = 'Ngày hết hạn không đúng định dạng (MM/YY).';
      return;
    }
    if (!/^\d{3}$/.test(this.cardCvv)) {
      this.cardError = 'CVV phải gồm 3 chữ số.';
      return;
    }

    this.cardError = '';
    this.stopCountdown();
    this.simulateSuccess();
  }

  confirmSimplePayment() {
    this.stopCountdown();
    this.simulateSuccess();
  }

onShippingInfoChange(): void {
  this.saveShippingInfoToSession();
}
  
}