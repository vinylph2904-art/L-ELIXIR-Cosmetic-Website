import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { PRODUCTS } from '../../data/mock-products';
import { CartService } from '../../services/cart.service';
import { ToastService } from '../../services/toast.service';
import { ReviewService } from '../../services/review.service';
import { Review } from '../../data/review.model';

// Order type được load từ localStorage (Task 1 sẽ cung cấp order.service)
type Order = any;

@Component({
  selector: 'app-product-detail',
  templateUrl: './product-detail.component.html',
  styleUrls: ['./product-detail.component.css']
})
export class ProductDetailComponent implements OnInit {
  product = PRODUCTS[0];

  // UC11 - Review & Comments
  orders: Order[] = [];
  currentUserId: string | null = null;
  currentUserName: string | null = null;
  newReviewAdded = false;

  constructor(
    route: ActivatedRoute,
    private cartService: CartService,
    private toastService: ToastService,
    private reviewService: ReviewService
  ) {
    const id = route.snapshot.paramMap.get('id');
    const found = PRODUCTS.find(item => item.id === id);
    if (found) {
      this.product = found;
    }
  }

  ngOnInit() {
    this.loadReviewData();
  }

  /**
   * Tải dữ liệu cần thiết cho UC11 (Review)
   */
  private loadReviewData() {
    // Lấy orders từ localStorage (được load ở app.component.ts)
    const ordersData = localStorage.getItem('orders');
    this.orders = ordersData ? JSON.parse(ordersData) : [];

    // Lấy current user từ localStorage (nếu có)
    // Note: Auth service là Task khác, tạm assume user_001 để test
    this.currentUserId = localStorage.getItem('currentUserId') || 'user_001';
    this.currentUserName = localStorage.getItem('currentUserName') || 'Người dùng';
  }

  addToCart() {
    this.cartService.addToCart({ ...this.product, quantity: 1 });
    this.toastService.success('Đã thêm vào giỏ hàng thành công', 3000);
  }

  /**
   * Xử lý khi user submit review thành công
   */
  onReviewSubmitted(review: Review) {
    this.newReviewAdded = true;
    // Tự động reload để hiển thị review mới
    setTimeout(() => {
      this.newReviewAdded = false;
    }, 2000);
  }
}

