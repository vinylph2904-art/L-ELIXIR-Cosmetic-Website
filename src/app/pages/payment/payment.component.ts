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

  // Address
  userAddresses: Address[] = [];
  selectedAddressId: string | null = null;

  // Current user
  private currentUserId: string | null = null;

  // Simulator
  public showSimulator: boolean = false;
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
    
    this.cartItems = this.cartService.getCart();
    this.recalcSubtotal();
    
    console.log('╚═══════════════════════════════════════╝');
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
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
          
          const defaultAddr = addresses.find(a => a.isDefault);
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
        fullName: addr.receiverName,
        phone: addr.receiverPhone,
        email: this.shippingInfo.email,
        city: '',
        district: '',
        address: addr.addressDetails,
        note: ''
      };
      
      this.cdr.markForCheck();
    }
  }

  private resetShippingInfo(): void {
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

    if (!fullName?.trim()) {
      this.errorMessage = 'Vui lòng nhập họ và tên.';
      return false;
    }
    if (!phone?.trim() || !/^\d{10}$/.test(phone.trim())) {
      this.errorMessage = 'Số điện thoại phải gồm 10 chữ số.';
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
              if (resp.redirectUrl) {
                window.location.href = resp.redirectUrl;
              } else {
                const ok = window.confirm('Mô phỏng: chọn OK thành công, Cancel thất bại');
                if (ok) {
                  this.simulateSuccess();
                } else {
                  this.simulateFailure();
                }
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
}