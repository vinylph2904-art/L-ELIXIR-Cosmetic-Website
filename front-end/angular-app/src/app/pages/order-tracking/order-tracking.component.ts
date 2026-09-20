import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { OrderService } from '../../services/order.service';
import { ReviewService } from '../../services/review.service';
import { ToastService } from '../../services/toast.service';
import { Order } from '../../data/order.model';
import PRODUCTS from '../../data/mock-data/mock-products.json';

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

  currentUser: any = null;
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

  // FR13: Guest OTP Verification Modal
  isGuestOtpModalOpen = false;
  pendingGuestOrder: Order | null = null;
  guestOtpInput = '';
  guestMaskedPhone = '';
  demoGuestOtp = '123456';
  guestOtpError = '';

  // FR13: Order Cancellation Request Modal
  isCancelModalOpen = false;
  cancelReasonPreset = 'Đổi ý không còn nhu cầu mua';
  cancelReasonDetail = '';
  cancelPresets = [
    'Đổi ý không còn nhu cầu mua',
    'Muốn thay đổi sản phẩm / biến thể khác',
    'Thời gian giao hàng dự kiến quá lâu',
    'Tìm thấy sản phẩm giá tốt hơn ở nơi khác',
    'Sai thông tin địa chỉ hoặc số điện thoại',
    'Lý do khác'
  ];

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
    private reviewService: ReviewService,
    private toastService: ToastService,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.isLoggedIn = this.authService.isLoggedIn();
    const routeOrderId = this.route.snapshot.queryParamMap.get('orderId')?.trim() || '';

    if (this.isLoggedIn) {
      const user = this.authService.getCurrentUser();
      this.currentUser = user;
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

  // FR13: Guest order search with OTP protection
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

    // Require OTP authentication for Guest to protect privacy (FR13)
    this.pendingGuestOrder = found;
    const phone = found.shippingInfo?.phone || found.guestPhone || '0901234567';
    this.guestMaskedPhone = phone.replace(/(\d{3})\d{4}(\d{3})/, '$1****$2');
    this.guestOtpInput = '';
    this.guestOtpError = '';
    this.isGuestOtpModalOpen = true;
  }

  confirmGuestOtp(): void {
    this.guestOtpError = '';
    if (!this.guestOtpInput.trim()) {
      this.guestOtpError = 'Vui lòng nhập mã OTP 6 chữ số.';
      return;
    }

    if (this.guestOtpInput.trim() !== this.demoGuestOtp) {
      this.guestOtpError = 'Mã OTP không chính xác. Vui lòng nhập mã thử nghiệm 123456.';
      return;
    }

    // OTP Verified!
    this.isGuestOtpModalOpen = false;
    this.searchedOrder = this.pendingGuestOrder;
    if (this.pendingGuestOrder) {
      this.selectOrder(this.pendingGuestOrder);
    }
    this.toastService.success('Xác thực OTP thành công! Thông tin đơn hàng đã được hiển thị.');
  }

  closeGuestOtpModal(): void {
    this.isGuestOtpModalOpen = false;
    this.pendingGuestOrder = null;
  }

  // FR13: Cancellation Request Modal
  canRequestCancel(order?: Order | null): boolean {
    if (!order) return false;
    // Allow cancellation request if order is Pending or Processing and no pending/approved cancel
    return (order.orderStatus === 'Pending' || order.orderStatus === 'Processing') &&
           order.cancelStatus !== 'pending' &&
           order.cancelStatus !== 'approved';
  }

  openCancelModal(): void {
    if (!this.selectedOrder) return;
    this.cancelReasonPreset = 'Đổi ý không còn nhu cầu mua';
    this.cancelReasonDetail = '';
    this.isCancelModalOpen = true;
  }

  closeCancelModal(): void {
    this.isCancelModalOpen = false;
    this.cancelReasonDetail = '';
  }

  submitCancelRequest(): void {
    if (!this.selectedOrder) return;

    const fullReason = this.cancelReasonDetail.trim()
      ? `${this.cancelReasonPreset} (${this.cancelReasonDetail.trim()})`
      : this.cancelReasonPreset;

    const success = this.orderService.requestOrderCancellation(this.selectedOrder.orderId, fullReason);
    if (success) {
      this.selectedOrder.cancelStatus = 'pending';
      this.selectedOrder.cancelReason = fullReason;
      this.toastService.success('Yêu cầu hủy đơn đã được gửi thành công! Bộ phận quản trị sẽ sớm phê duyệt.');
      this.closeCancelModal();
    } else {
      this.toastService.error('Không thể gửi yêu cầu hủy đơn lúc này.');
    }
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

  getProgressPercent(status: Order['orderStatus']): string {
    if (status === 'Cancelled') {
      return '0%';
    }

    const stepIndex = this.orderService.getStepIndex(status);
    return `${(stepIndex / 4) * 100}%`;
  }

  getShipmentHistory(order: Order): Array<{ title: string; description: string; time: string; state: 'done' | 'current' }> {
    const createdTime = this.formatTimelineDate(order.createdAt);
    const events: Array<{ title: string; description: string; time: string; state: 'done' | 'current' }> = [
      {
        title: 'Đơn hàng đã được tạo',
        description: 'Hệ thống đã ghi nhận đơn đặt hàng của bạn.',
        time: createdTime,
        state: 'done'
      },
      {
        title: 'Đã xác nhận',
        description: 'Đơn hàng đã được xác nhận và chuẩn bị xử lý.',
        time: 'Đang xử lý',
        state: 'done'
      },
      {
        title: 'Đang chuẩn bị',
        description: 'Kho hàng đang đóng gói và sắp xếp đơn của bạn.',
        time: 'Sắp tới',
        state: 'done'
      },
      {
        title: 'Đang giao hàng',
        description: 'Shipper đang trên đường giao đến bạn.',
        time: 'Đang vận chuyển',
        state: 'done'
      },
      {
        title: 'Đã giao hàng',
        description: 'Đơn hàng đã được giao thành công.',
        time: 'Hoàn tất',
        state: 'done'
      }
    ];

    if (order.orderStatus === 'Cancelled') {
      return [events[0]];
    }

    const visibleCount = Math.min(this.orderService.getStepIndex(order.orderStatus) + 1, events.length);
    const visibleEvents = events.slice(0, visibleCount);

    if (visibleEvents.length > 0) {
      visibleEvents[visibleEvents.length - 1] = {
        ...visibleEvents[visibleEvents.length - 1],
        state: 'current'
      };
    }

    return visibleEvents;
  }

  private formatTimelineDate(value: Date | string | undefined): string {
    if (!value) {
      return 'Đã tạo';
    }

    const date = value instanceof Date ? value : new Date(value);
    return `${date.getDate().toString().padStart(2, '0')}/${(date.getMonth() + 1).toString().padStart(2, '0')}/${date.getFullYear()}, ${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
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

  canReviewOrder(order: Order): boolean {
    if (!this.isLoggedIn || !this.currentUser) {
      return false;
    }
    if (order.orderStatus !== 'Completed') {
      return false;
    }

    return (order.items || []).some(item => {
      const productId = (item as any).product?.productId || (item as any).productId;
      return !!productId && !this.reviewService.getByUserAndProduct(this.currentUser.userId, productId);
    });
  }

  openReviewModal(order: Order): void {
    if (!this.currentUser) {
      return;
    }

    const reviewableItems = (order.items || []).filter(item => {
      const productId = (item as any).product?.productId || (item as any).productId;
      return !!productId && !this.reviewService.getByUserAndProduct(this.currentUser.userId, productId);
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
    if (!this.currentUser || !this.reviewOrder || !this.selectedReviewProductId) {
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
        userId: this.currentUser.userId,
        userName: this.currentUser.fullName,
        orderId: this.reviewOrder.orderId,
        title: this.reviewDraft.title.trim(),
        rating: this.reviewDraft.rating,
        comment: this.reviewDraft.comment.trim()
      });

      this.reviewSubmitting = false;
      this.closeReviewModal();

      if (this.isLoggedIn && this.currentUser) {
        this.myOrders = this.orderService.getByUserId(this.currentUser.userId);
        if (this.selectedOrder) {
          const updated = this.myOrders.find(o => o.orderId === this.selectedOrder!.orderId);
          if (updated) {
            this.selectedOrder = updated;
          }
        }
      }
    } catch (error) {
      this.reviewSubmitting = false;
      this.reviewError = 'Đã có lỗi xảy ra, vui lòng thử lại.';
    }
  }

  clickReviewButton(order: Order): void {
    if (!this.isLoggedIn || !this.currentUser) {
      this.toastService.warning('Vui lòng đăng nhập để đánh giá sản phẩm.');
      return;
    }
    if (order.orderStatus !== 'Completed') {
      this.toastService.warning('Chỉ có thể đánh giá đơn hàng đã hoàn tất.');
      return;
    }

    const reviewableItems = (order.items || []).filter(item => {
      const productId = (item as any).product?.productId || (item as any).productId;
      return !!productId && !this.reviewService.getByUserAndProduct(this.currentUser.userId, productId);
    });

    if (reviewableItems.length === 0) {
      this.toastService.info('Bạn đã đánh giá hết sản phẩm trong đơn hàng này.');
      return;
    }

    this.openReviewModal(order);
  }

  getProductImage(item: any): string {
    const fallbackImage = 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&w=400&q=80';
    if (!item) return fallbackImage;

    const productName = (item.product?.name || item.productName || '').toLowerCase().trim();
    const productId = (item.product?.productId || item.productId || '').toLowerCase().trim();

    // 1. Tìm sản phẩm trong danh sách PRODUCTS mẫu bằng ID
    let matchedProduct = PRODUCTS.find((p: any) => p.productId.toLowerCase() === productId);
    
    // 2. Nếu không khớp hoặc tên sản phẩm khác nhau, tìm kiếm theo Tên để tránh lệch dữ liệu trong đơn hàng mẫu
    if (!matchedProduct || (productName && matchedProduct.name.toLowerCase() !== productName)) {
      const byName = PRODUCTS.find((p: any) => {
        const pName = p.name.toLowerCase();
        return pName === productName || pName.includes(productName) || productName.includes(pName);
      });
      if (byName) {
        matchedProduct = byName;
      }
    }

    // 3. Nếu tìm thấy sản phẩm mẫu, ưu tiên tìm ảnh chứa ".1" (ví dụ: SP01.1.png, 2.1.png, kcn 1.1.jpg)
    if (matchedProduct && matchedProduct.images && matchedProduct.images.length > 0) {
      const repImage = matchedProduct.images.find((img: string) => {
        const lower = img.toLowerCase();
        return lower.includes('.1.') || lower.endsWith('.1.png') || lower.endsWith('.1.jpg') || lower.endsWith('.1.jpeg') || lower.endsWith('.1');
      });
      if (repImage) {
        return repImage;
      }
      return matchedProduct.images[0];
    }

    // 4. Nếu không tìm thấy sản phẩm mẫu, dùng ảnh trong item hiện tại và tìm ảnh ".1"
    if (item.product?.images && item.product.images.length > 0) {
      const repImage = item.product.images.find((img: string) => {
        const lower = img.toLowerCase();
        return lower.includes('.1.') || lower.endsWith('.1.png') || lower.endsWith('.1.jpg') || lower.endsWith('.1.jpeg') || lower.endsWith('.1');
      });
      if (repImage) {
        return repImage;
      }
      return item.product.images[0];
    }

    return fallbackImage;
  }
}
