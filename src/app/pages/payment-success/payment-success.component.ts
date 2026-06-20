import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { OrderService } from '../../services/order.service';
import { Order } from '../../data/order.model';

@Component({
  selector: 'app-payment-success',
  templateUrl: './payment-success.component.html',
  styleUrls: ['./payment-success.component.css']
})
export class PaymentSuccessComponent implements OnInit {
  orderId = '';
  currentOrder: Order | null = null;
  isLoading = true;
  errorMessage = '';

  constructor(
    private orderService: OrderService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.loadOrderData();
  }

  /**
   * Load order data from service or query params
   * UC09 Step 8: Hiển thị trang "Hoàn tất đơn hàng"
   */
  private loadOrderData(): void {
    // Try to get order from service first
    this.currentOrder = this.orderService.getCurrentOrder();

    if (this.currentOrder) {
      this.orderId = this.currentOrder.orderId;
      this.isLoading = false;
      return;
    }

    // If no order in service, try to get from query params
    this.route.queryParams.subscribe(params => {
      const orderId = params['orderId'];
      
      if (orderId) {
        this.orderId = orderId;
        // In real scenario, would fetch order details from backend
        this.isLoading = false;
      } else {
        this.isLoading = false;
        this.errorMessage = 'Không tìm thấy thông tin đơn hàng';
      }
    });
  }

  /**
   * Navigate back to home
   */
  goHome(): void {
    this.router.navigate(['/']);
  }

  /**
   * Navigate to order tracking
   */
  trackOrder(): void {
    this.router.navigate(['/order-tracking'], {
      queryParams: { orderId: this.orderId }
    });
  }

  /**
   * Continue shopping
   */
  continueShopping(): void {
    this.router.navigate(['/products']);
  }

  /**
   * Format currency
   */
  formatCurrency(value: number): string {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(value);
  }
}
