import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { Order, ShippingInfo, OrderItem } from '../data/order.model';
import { Product } from '../data/product.model';

@Injectable({ providedIn: 'root' })
export class OrderService {
  private orderSubject = new BehaviorSubject<Order | null>(null);
  public order$ = this.orderSubject.asObservable();

  // Shipping fees
  private readonly SHIPPING_FEES = {
    standard: 30000,
    express: 50000
  };

  // API endpoints (simulation)
  private readonly API_BASE = 'https://api.sandbox.lelixir.vn';

  constructor(private http: HttpClient) {
    this.loadOrder();
  }

  /**
   * Load order from session storage if exists
   */
  private loadOrder(): void {
    try {
      const raw = sessionStorage.getItem('lelixir_current_order');
      if (raw) {
        const order = JSON.parse(raw) as Order;
        this.orderSubject.next(order);
      }
    } catch {
      // Silent fail
    }
  }

  /**
   * Save order to session storage
   */
  private saveOrder(order: Order): void {
    sessionStorage.setItem('lelixir_current_order', JSON.stringify(order));
    this.orderSubject.next(order);
  }

  /**
   * Clear order from session storage
   */
  clearOrder(): void {
    sessionStorage.removeItem('lelixir_current_order');
    this.orderSubject.next(null);
  }

  /**
   * UC09: Create guest order for checkout
   * Bước 4: Hệ thống kiểm tra tính hợp lệ và khởi tạo đơn hàng ở trạng thái "Chờ thanh toán"
   */
  createGuestOrder(
    items: Product[],
    shippingInfo: ShippingInfo,
    shippingMethod: 'standard' | 'express',
    paymentMethod: 'cod' | 'bank_transfer' | 'e_wallet' | 'credit_card'
  ): Observable<Order> {
    // Validate shipping info
    if (!this.validateShippingInfo(shippingInfo)) {
      throw new Error('Thông tin giao hàng không hợp lệ');
    }

    // Validate cart items
    if (!items || items.length === 0) {
      throw new Error('Giỏ hàng không có sản phẩm');
    }

    // Calculate order totals
    const orderItems: OrderItem[] = items.map(item => ({
      product: item,
      quantity: item.quantity || 1,
      price: item.price
    }));

    const subtotal = orderItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const shippingFee = this.SHIPPING_FEES[shippingMethod];
    const total = subtotal + shippingFee;

    // Create order object with "pending_payment" status (Chờ thanh toán)
    const order: Order = {
      orderId: this.generateOrderId(),
      guestId: this.generateGuestId(),
      items: orderItems,
      shippingInfo,
      shippingMethod,
      paymentMethod,
      subtotal,
      shippingFee,
      discount: 0,
      total,
      status: 'pending_payment',
      createdAt: new Date(),
      updatedAt: new Date()
    };

    this.saveOrder(order);

    // For now, simulate API call. In real scenario, this would be a backend API
    return new Observable(observer => {
      setTimeout(() => {
        observer.next(order);
        observer.complete();
      }, 500);
    });
  }

  /**
   * UC09: Redirect to sandbox payment gateway
   * Bước 5: Hệ thống tự động chuyển hướng giao diện sang cổng Sandbox
   */
  /**
   * UC09: Xác nhận đơn hàng tác vụ thanh toán nội bộ
   * Chuyển trạng thái đơn hàng sang processing mà không dùng sandbox
   */
  completeOrder(orderId: string): Observable<Order> {
    return new Observable(observer => {
      const currentOrder = this.orderSubject.value;

      if (!currentOrder || currentOrder.orderId !== orderId) {
        observer.error(new Error('Đơn hàng không được tìm thấy'));
        return;
      }

      currentOrder.status = 'processing';
      currentOrder.paymentDetails = {
        transactionId: `TXN${Date.now()}`,
        paidAt: new Date()
      };
      currentOrder.updatedAt = new Date();

      this.saveOrder(currentOrder);
      observer.next(currentOrder);
      observer.complete();
    });
  }

  /**
   * UC09: Handle payment success
   * Bước 8: Hệ thống tiếp nhận tín hiệu phản hồi thanh toán thành công
   * Cập nhật trạng thái đơn hàng thành "Đang xử lý"
   */
  confirmPaymentSuccess(orderId: string, transactionId: string): Observable<Order> {
    return new Observable(observer => {
      const currentOrder = this.orderSubject.value;

      if (!currentOrder || currentOrder.orderId !== orderId) {
        observer.error(new Error('Đơn hàng không được tìm thấy'));
        return;
      }

      // Update order status to "processing" (Đang xử lý)
      currentOrder.status = 'processing';
      currentOrder.paymentDetails = {
        transactionId,
        paidAt: new Date()
      };
      currentOrder.updatedAt = new Date();

      this.saveOrder(currentOrder);

      // Simulate email sending
      this.sendConfirmationEmail(currentOrder).subscribe({
        next: () => {
          observer.next(currentOrder);
          observer.complete();
        },
        error: (err) => {
          // Email failure shouldn't block order confirmation
          console.error('Email send failed:', err);
          observer.next(currentOrder);
          observer.complete();
        }
      });
    });
  }

  /**
   * UC09 AF1: Handle payment failure
   * Hệ thống nhận tín hiệu thất bại
   */
  handlePaymentFailure(orderId: string): Observable<{ success: boolean; message: string }> {
    return new Observable(observer => {
      const currentOrder = this.orderSubject.value;

      if (currentOrder && currentOrder.orderId === orderId) {
        // Cancel order and clear from session
        this.clearOrder();
      }

      observer.next({
        success: true,
        message: 'Thanh toán trực tuyến không thành công. Đơn hàng chưa được ghi nhận hoàn tất.'
      });
      observer.complete();
    });
  }

  /**
   * Get current order
   */
  getCurrentOrder(): Order | null {
    return this.orderSubject.value;
  }

  /**
   * Validate shipping information
   */
  private validateShippingInfo(info: ShippingInfo): boolean {
    return !!(
      info.fullName?.trim() &&
      info.phone?.trim() &&
      info.email?.trim() &&
      info.city?.trim() &&
      info.district?.trim() &&
      info.address?.trim() &&
      this.isValidEmail(info.email) &&
      this.isValidPhone(info.phone)
    );
  }

  /**
   * Validate email format
   */
  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  /**
   * Validate phone number (Vietnamese format)
   */
  private isValidPhone(phone: string): boolean {
    // Accept Vietnamese phone numbers (10-11 digits)
    const phoneRegex = /^(0\d{9,10}|\+84\d{9,10})$/;
    return phoneRegex.test(phone.replace(/\s+/g, ''));
  }

  /**
   * Generate unique order ID
   */
  private generateOrderId(): string {
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 1000);
    return `ORD${timestamp}${random}`;
  }

  /**
   * Generate unique guest ID
   */
  private generateGuestId(): string {
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 100000);
    return `GUEST${timestamp}${random}`;
  }

  /**
   * Send confirmation email (simulation)
   * In real scenario, this would call backend API to send email
   */
  private sendConfirmationEmail(order: Order): Observable<{ success: boolean }> {
    return new Observable(observer => {
      // Simulate email sending
      setTimeout(() => {
        console.log(`Confirmation email sent to ${order.shippingInfo.email}`);
        observer.next({ success: true });
        observer.complete();
      }, 500);
    });
  }
}
