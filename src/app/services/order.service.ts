import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { Order, ShippingInfo, OrderItem, PaymentSandboxResponse } from '../data/order.model';
import { Product } from '../data/product.model';
import mockOrders from '../data/mock/orders.mock.json';
import PRODUCTS from '../data/mock-products.json';
import seedUsers from '../data/users.json';
import { AuthService } from './auth.service';
import { throwError } from 'rxjs';


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
  private readonly ORDER_SEQUENCE_KEY = 'lelixir_order_sequence';

  constructor(private http: HttpClient, private authService: AuthService) {
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
    this.upsertStoredOrder(order);
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
      return throwError(() => new Error('Thông tin giao hàng không hợp lệ'));
    }

    // Validate cart items
    if (!items || items.length === 0) {
      throw new Error('Giỏ hàng không có sản phẩm');
    }

    // Calculate order totals
    const orderItems: OrderItem[] = items.map(item => ({
      product: item,
      quantity: (item as any).quantity || 1,
      price: (item as any).price
    }));

    const subtotal = orderItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const shippingFee = this.SHIPPING_FEES[shippingMethod];
    const total = subtotal + shippingFee;

    // Create order object with "pending_payment" status (Chờ thanh toán)
    const order: Order = {
      orderId: this.generateOrderId(),
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
      updatedAt: new Date(),
      orderStatus: 'Pending'
    };

    const currentUser = this.authService.getCurrentUser();
    if (currentUser) {
      order.userId = currentUser.userId;
    } else {
      order.guestId = this.generateGuestId();
    }

    order.totalAmount = order.total;
    order.guestName = shippingInfo.fullName;
    order.guestEmail = shippingInfo.email;

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
  initiatePayment(order: Order): Observable<PaymentSandboxResponse> {
    const paymentRequest = {
      orderId: order.orderId,
      amount: order.total,
      currency: 'VND',
      description: `Thanh toán đơn hàng ${order.orderId}`,
      returnUrl: `${window.location.origin}/payment-result`
    };

    // Simulate payment initiation.
    // For COD we immediately return a success redirect to payment-success page.
    if (order.paymentMethod === 'cod') {
      return new Observable(observer => {
        setTimeout(() => {
          observer.next({
            success: true,
            redirectUrl: `/payment-success?orderId=${order.orderId}`,
            message: 'Thanh toán khi nhận hàng (COD)'
          });
          observer.complete();
        }, 300);
      });
    }

    // For online payment methods we no longer redirect to an external sandbox.
    // Instead, the app will simulate the payment flow in-app (success/failure).
    return new Observable(observer => {
      setTimeout(() => {
        observer.next({
          success: true,
          message: 'Simulate in-app payment (choose success or failure)'
        });
        observer.complete();
      }, 300);
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
      currentOrder.orderStatus = 'Processing';
      currentOrder.paymentDetails = {
        transactionId,
        paidAt: new Date()
      };
      currentOrder.updatedAt = new Date();
      currentOrder.totalAmount = currentOrder.total;

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
        currentOrder.status = 'cancelled';
        currentOrder.orderStatus = 'Cancelled';
        currentOrder.updatedAt = new Date();
        currentOrder.totalAmount = currentOrder.total;
        this.upsertStoredOrder(currentOrder);
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
    const orders = this.readStoredOrders();
    const storedMax = orders.reduce((max: number, item: any) => {
      const match = String(item.orderId || '').match(/^ORD-(\d+)$/i);
      if (!match) return max;
      return Math.max(max, Number(match[1]) || 0);
    }, 0);

    const nextSequence = Math.max(this.readOrderSequence(), storedMax) + 1;
    this.writeOrderSequence(nextSequence);
    return `ORD-${String(nextSequence).padStart(4, '0')}`;
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
   * Build sandbox payment URL (simulation)
   * In real scenario, this would be actual payment gateway URL
   */
  private buildSandboxPaymentUrl(order: Order): string {
    const params = new URLSearchParams({
      orderId: order.orderId,
      amount: order.total.toString(),
      currency: 'VND',
      method: order.paymentMethod,
      timestamp: Date.now().toString()
    });

    // Simulate sandbox gateway URL
    // In real implementation: use actual payment provider URL
    return `/payment-sandbox?${params.toString()}`;
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

  // --- Compatibility helpers for feature branch APIs ---
  private STORAGE_ORDERS_KEY = 'orders';

  private readStoredOrders(): any[] {
    this.ensureMockOrdersLoaded();
    return this.readStoredOrdersInternal();
  }

  private readStoredOrdersInternal(): any[] {
    try {
      const raw = localStorage.getItem(this.STORAGE_ORDERS_KEY);
      if (!raw) {
        return [];
      }

      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed.map((order: any) => this.normalizeOrder(order)) : [];
    } catch {
      return [];
    }
  }

  private ensureMockOrdersLoaded(): void {
    const existingOrders = this.readStoredOrdersInternal();
    const hasMockOrderData = existingOrders.some((item: any) => /^ORD-(\d+)$/.test(String(item?.orderId || '')));

    if (existingOrders.length === 0 || !hasMockOrderData) {
      const seededOrders = Array.isArray(mockOrders) ? mockOrders.map((order: any) => this.normalizeOrder(order)) : [];
      const mergedOrders = [...seededOrders];
      const existingIds = new Set(mergedOrders.map((item: any) => String(item?.orderId || '').toLowerCase()));

      for (const order of existingOrders) {
        if (!order || !order.orderId) {
          continue;
        }

        const id = String(order.orderId).toLowerCase();
        if (!existingIds.has(id)) {
          mergedOrders.push(order);
          existingIds.add(id);
        }
      }

      localStorage.setItem(this.STORAGE_ORDERS_KEY, JSON.stringify(mergedOrders));
    }
  }

  private normalizeOrder(order: any): any {
    if (!order) {
      return order;
    }

    const normalizedItems = Array.isArray(order.items)
      ? order.items.map((item: any) => this.normalizeOrderItem(item))
      : [];
    const subtotal = Number(order.subtotal ?? order.totalAmount ?? 0);
    const shippingFee = Number(order.shippingFee ?? 0);
    const totalAmount = Number(order.totalAmount ?? order.total ?? subtotal + shippingFee);
    const shippingInfo = this.normalizeShippingInfo(order);
    const normalizedOrderStatus = this.normalizeOrderStatus(order.orderStatus);

    return {
      ...order,
      orderId: String(order.orderId || '').trim(),
      items: normalizedItems,
      shippingInfo,
      shippingMethod: this.normalizeShippingMethod(order.shippingMethod),
      paymentMethod: this.normalizePaymentMethod(order.paymentMethod),
      subtotal: Number.isFinite(subtotal) ? subtotal : normalizedItems.reduce((sum: number, item: any) => sum + item.price * item.quantity, 0),
      shippingFee: Number.isFinite(shippingFee) ? shippingFee : 0,
      discount: Number(order.discount ?? 0),
      total: Number(order.total ?? totalAmount),
      totalAmount: Number.isFinite(totalAmount) ? totalAmount : subtotal + shippingFee,
      status: this.normalizeOrderState(normalizedOrderStatus),
      orderStatus: normalizedOrderStatus,
      createdAt: this.parseDate(order.createdAt),
      updatedAt: this.parseDate(order.updatedAt ?? order.createdAt),
      userId: order.userId ?? null,
      guestName: order.guestName ?? shippingInfo.fullName,
      guestEmail: order.guestEmail ?? shippingInfo.email,
      guestPhone: order.guestPhone ?? shippingInfo.phone
    };
  }

  private normalizeOrderItem(item: any): any {
    const productId = item?.productId || item?.product?.productId;
    const product = item?.product || (productId ? PRODUCTS.find((p: any) => p.productId === productId) : null) || null;
    const quantity = Number(item?.quantity || 1);
    const price = Number(item?.priceAtPurchase ?? item?.price ?? product?.price ?? 0);

    return {
      ...item,
      product: product ? { ...product } : {
        productId: productId || 'UNKNOWN',
        name: item?.productName || 'Sản phẩm',
        brand: '',
        categoryName: '',
        description: '',
        ingredients: [],
        images: [],
        volume: '',
        routineStep: '',
        price,
        stockQuantity: 0,
        targetSkinTypes: [],
        targetSkinProblems: [],
        averageRating: 0,
        reviewCount: 0
      },
      quantity,
      price
    };
  }

  private normalizeShippingInfo(order: any): ShippingInfo {
    const address = order?.deliveryAddress || order?.shippingInfo?.address || '';
    const userInfo = this.resolveUserInfo(order);
    return {
      fullName: order?.guestName || order?.shippingInfo?.fullName || userInfo.fullName || '',
      phone: order?.guestPhone || order?.shippingInfo?.phone || userInfo.phone || '',
      email: order?.guestEmail || order?.shippingInfo?.email || userInfo.email || '',
      city: order?.shippingInfo?.city || '',
      district: order?.shippingInfo?.district || '',
      address,
      note: order?.shippingInfo?.note
    };
  }

  private resolveUserInfo(order: any): { fullName: string; phone: string; email: string } {
    const userId = String(order?.userId || '').trim();
    if (!userId) {
      return { fullName: '', phone: '', email: '' };
    }

    const users = this.getUsersFromStorage();
    const matchedUser = users.find((user: any) => String(user?.userId || '').trim() === userId);

    return {
      fullName: matchedUser?.fullName || '',
      phone: matchedUser?.phoneNumber || '',
      email: matchedUser?.email || ''
    };
  }

  private getUsersFromStorage(): any[] {
    try {
      const raw = localStorage.getItem('users');
      const parsed = raw ? JSON.parse(raw) : null;
      return Array.isArray(parsed) ? parsed : Array.isArray(seedUsers) ? seedUsers : [];
    } catch {
      return Array.isArray(seedUsers) ? seedUsers : [];
    }
  }

  private normalizeShippingMethod(method: any): 'standard' | 'express' {
    const value = String(method || '').toLowerCase();
    return value === 'express' ? 'express' : 'standard';
  }

  private normalizePaymentMethod(method: any): Order['paymentMethod'] {
    const value = String(method || '').toLowerCase();
    if (value.includes('bank')) return 'bank_transfer';
    if (value.includes('wallet') || value.includes('e_wallet')) return 'e_wallet';
    if (value.includes('credit') || value.includes('card')) return 'credit_card';
    return 'cod';
  }

  private normalizeOrderStatus(status: any): Order['orderStatus'] {
    const value = String(status || '').toLowerCase();
    if (value.includes('cancel')) return 'Cancelled';
    if (value.includes('complete') || value.includes('deliver')) return 'Completed';
    if (value.includes('ship')) return 'Shipping';
    if (value.includes('process')) return 'Processing';
    return 'Pending';
  }

  private normalizeOrderState(status: Order['orderStatus']): Order['status'] {
    switch (status) {
      case 'Completed':
        return 'delivered';
      case 'Shipping':
        return 'shipped';
      case 'Processing':
        return 'processing';
      case 'Cancelled':
        return 'cancelled';
      default:
        return 'pending_payment';
    }
  }

  private parseDate(value: any): Date {
    if (!value) {
      return new Date();
    }
    const parsed = value instanceof Date ? value : new Date(value);
    return Number.isNaN(parsed.getTime()) ? new Date() : parsed;
  }

  private writeStoredOrders(orders: any[]): void {
    try {
      localStorage.setItem(this.STORAGE_ORDERS_KEY, JSON.stringify(orders));
    } catch {
      // ignore
    }
  }

  private readOrderSequence(): number {
    try {
      const raw = localStorage.getItem(this.ORDER_SEQUENCE_KEY);
      return raw ? Number.parseInt(raw, 10) || 0 : 0;
    } catch {
      return 0;
    }
  }

  private writeOrderSequence(sequence: number): void {
    try {
      localStorage.setItem(this.ORDER_SEQUENCE_KEY, String(sequence));
    } catch {
      // ignore
    }
  }

  private upsertStoredOrder(order: Order): void {
    const orders = this.readStoredOrders();
    const serializedOrder = {
      ...order,
      createdAt: order.createdAt instanceof Date ? order.createdAt.toISOString() : order.createdAt,
      updatedAt: order.updatedAt instanceof Date ? order.updatedAt.toISOString() : order.updatedAt,
      paymentDetails: order.paymentDetails
        ? {
            ...order.paymentDetails,
            paidAt: order.paymentDetails.paidAt instanceof Date
              ? order.paymentDetails.paidAt.toISOString()
              : order.paymentDetails.paidAt
          }
        : undefined,
      totalAmount: order.totalAmount ?? order.total,
      userId: order.userId ?? null,
      guestName: order.guestName ?? order.shippingInfo.fullName,
      guestEmail: order.guestEmail ?? order.shippingInfo.email
    };

    const idx = orders.findIndex((item: any) => String(item.orderId).toLowerCase() === String(order.orderId).toLowerCase());
    if (idx === -1) {
      orders.push(serializedOrder);
    } else {
      orders[idx] = { ...orders[idx], ...serializedOrder };
    }

    this.writeStoredOrders(orders);
  }

  // Return orders for a specific userId (legacy API)
  getByUserId(userId: string): any[] {
    const orders = this.readStoredOrders();
    return orders.filter(o => o.userId === userId || (o.guestId && o.guestId === userId));
  }

  // Return a single order by id (legacy API)
  getByOrderId(orderId: string): any | null {
    const orders = this.readStoredOrders();
    const normalizedOrderId = String(orderId || '').trim().toLowerCase();
    return orders.find(o => String(o.orderId || '').trim().toLowerCase() === normalizedOrderId) || null;
  }

  // Update order status (legacy API)
  completeOrder(orderId: string): Observable<Order> {
    return new Observable(observer => {
      const orders = this.readStoredOrders();
      const idx = orders.findIndex(o => o.orderId === orderId);
      if (idx === -1) {
        observer.error(new Error('Order not found'));
        return;
      }
      orders[idx].orderStatus = 'Processing';
      this.writeStoredOrders(orders);
      observer.next(orders[idx]);
      observer.complete();
    });
  }

  // Map legacy orderStatus to step index
  getStepIndex(status: any): number {
    const map: Record<string, number> = {
      'Pending': 0,
      'Processing': 1,
      'Shipping': 3,
      'Completed': 4,
      'Cancelled': -1
    };
    return map[status] ?? 0;
  }
}
