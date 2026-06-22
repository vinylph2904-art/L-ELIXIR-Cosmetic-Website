import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { OrderService } from '../../services/order.service';
import { Order } from '../../data/order.model';

interface TrackingStep {
  label: string;
  icon: string;
  state: 'done' | 'current' | 'pending';
}

@Component({
  selector: 'app-order-tracking',
  templateUrl: './order-tracking.component.html',
  styleUrls: ['./order-tracking.component.css']
})
export class OrderTrackingComponent implements OnInit {
  isLoggedIn = false;

  // Khách đã đăng nhập: danh sách order của họ
  myOrders: Order[] = [];

  // Khách vãng lai: tra cứu theo orderId
  searchOrderId = '';
  searchedOrder: Order | null = null;
  searchError = '';

  // Order đang được xem chi tiết (chọn từ list hoặc từ kết quả tra cứu)
  selectedOrder: Order | null = null;
  trackingSteps: TrackingStep[] = [];

  private readonly STEP_LABELS = [
    { label: 'Đã đặt hàng', icon: 'check' },
    { label: 'Đã xác nhận', icon: 'check' },
    { label: 'Đang chuẩn bị', icon: 'inventory_2' },
    { label: 'Đang giao hàng', icon: 'local_shipping' },
    { label: 'Hoàn tất', icon: 'check' }
  ];

  constructor(
    private authService: AuthService,
    private orderService: OrderService,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.isLoggedIn = this.authService.isLoggedIn();
    const routeOrderId = this.route.snapshot.queryParamMap.get('orderId')?.trim() || '';

    if (this.isLoggedIn) {
      const user = this.authService.getCurrentUser();
      if (user) {
        this.myOrders = this.orderService.getByUserId(user.userId);
        if (routeOrderId) {
          const fromList = this.myOrders.find(order => String(order.orderId).toLowerCase() === routeOrderId.toLowerCase());
          const fallback = fromList || this.orderService.getByOrderId(routeOrderId);

          if (fallback) {
            this.selectOrder(fallback as Order);
            return;
          }

          this.searchError = 'Không tìm thấy đơn hàng với mã này.';
        } else if (this.myOrders.length > 0) {
          this.selectOrder(this.myOrders[0]);
        }
      }
      return;
    }

    if (routeOrderId) {
      this.searchOrderId = routeOrderId;
      this.searchGuestOrder();
    }
  }

  selectOrder(order: Order): void {
    this.selectedOrder = order;
    this.buildTrackingSteps(order);
  }

  searchGuestOrder(): void {
    this.searchError = '';
    this.searchedOrder = null;

    if (!this.searchOrderId.trim()) {
      this.searchError = 'Vui lòng nhập mã đơn hàng.';
      return;
    }

    const found = this.orderService.getByOrderId(this.searchOrderId.trim());
    if (!found) {
      this.searchError = 'Không tìm thấy đơn hàng với mã này.';
      return;
    }

    this.searchedOrder = found;
    this.selectOrder(found);
  }

  private buildTrackingSteps(order: Order): void {
    const currentIndex = this.orderService.getStepIndex(order.orderStatus);

    if (order.orderStatus === 'Cancelled') {
      this.trackingSteps = this.STEP_LABELS.map(s => ({ ...s, state: 'pending' as const }));
      return;
    }

    this.trackingSteps = this.STEP_LABELS.map((s, i) => ({
      ...s,
      state: i < currentIndex ? 'done' : i === currentIndex ? 'current' : 'pending'
    }));
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

  getItemTotal(quantity: number, price: number): string {
    return this.formatCurrency(quantity * price);
  }

  formatCurrency(value: number | undefined): string {
    const amount = value ?? 0;
    return amount.toLocaleString('vi-VN') + ' VNĐ';
  }
}
