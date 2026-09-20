import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { OrderService } from '../../services/order.service';

/**
 * UC09 AF1: Payment Failure Handler
 * Xử lý giao dịch thất bại hoặc bị hủy
 */
@Component({
  selector: 'app-payment-failure',
  templateUrl: './payment-failure.component.html',
  styleUrls: ['./payment-failure.component.css']
})
export class PaymentFailureComponent implements OnInit {
  orderId = '';
  failureReason = 'Thanh toán trực tuyến không thành công. Đơn hàng chưa được ghi nhận hoàn tất.';

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private orderService: OrderService
  ) {}

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      this.orderId = params['orderId'] || '';
      this.failureReason = params['reason'] || this.failureReason;
    });
  }

  /**
   * UC09 AF1: Retry payment (Quay về Bước 6 của PF)
   * Người dùng nhấp bấm "Thử lại"
   */
  retryPayment(): void {
    // Return to payment page with order ID
    this.router.navigate(['/payment'], {
      queryParams: { retryOrderId: this.orderId }
    });
  }

  /**
   * UC09 AF1: Cancel order (Xóa dữ liệu đơn tạm và quay về trang giỏ hàng)
   * Người dùng chọn "Hủy đơn hàng"
   */
  cancelOrder(): void {
    this.orderService.clearOrder();
    this.router.navigate(['/cart']);
  }

  /**
   * Return to home
   */
  goHome(): void {
    this.router.navigate(['/']);
  }
}
