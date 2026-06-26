import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CartService } from '../../services/cart.service';
import { ProductService } from '../../services/product.service';
import { ToastService } from '../../services/toast.service';
import { ReviewService } from '../../services/review.service';
import { Product } from '../../data/product.model';
import { Review } from '../../data/review.model';
import { Order } from '../../data/order.model';

@Component({
  selector: 'app-product-detail',
  templateUrl: './product-detail.component.html',
  styleUrls: ['./product-detail.component.css']
})
export class ProductDetailComponent implements OnInit {
  product: Product = {
    productId: '',
    name: '',
    brand: '',
    categoryName: '',
    description: '',
    ingredients: [],
    images: [''],
    volume: '',
    routineStep: '',
    price: 0,
    stockQuantity: 0,
    targetSkinTypes: [],
    targetSkinProblems: [],
    averageRating: 0,
    reviewCount: 0
  };

  selectedImage = '';

  /**
   * Số lượng sản phẩm người dùng CHỌN trước khi thêm vào giỏ hàng.
   * Không liên quan đến quantity trong giỏ - đây chỉ là con số trên bộ đếm.
   */
  selectedQuantity: number = 1;

  // UC11 - Review & Comments
  orders: Order[] = [];
  currentUserId: string | null = null;
  currentUserName: string | null = null;
  newReviewAdded = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private cartService: CartService,
    private productService: ProductService,
    private toastService: ToastService,
    private reviewService: ReviewService
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');

    this.productService.getProducts().subscribe(products => {
      const found = products.find(item => item.productId === id);

      if (found) {
        this.product = found;
        this.selectedImage = found.images[0];
      }
    });

    this.loadReviewData();
  }

  /**
   * Tải dữ liệu cần thiết cho UC11 (Review)
   */
  private loadReviewData() {
    const ordersData = localStorage.getItem('orders');
    this.orders = ordersData ? JSON.parse(ordersData) : [];

    this.currentUserId = localStorage.getItem('currentUserId') || 'user_001';
    this.currentUserName = localStorage.getItem('currentUserName') || 'Người dùng';
  }

  /**
   * Tăng số lượng sản phẩm trên bộ đếm (nút +).
   * Giới hạn tối đa = product.stockQuantity (không cho vượt quá số trong kho).
   */
  increaseQuantity(): void {
    if (this.selectedQuantity < this.product.stockQuantity) {
      this.selectedQuantity++;
    }
  }

  /**
   * Giảm số lượng sản phẩm trên bộ đếm (nút -).
   * Giới hạn tối thiểu = 1 (không cho về 0 hoặc âm).
   */
  decreaseQuantity(): void {
    if (this.selectedQuantity > 1) {
      this.selectedQuantity--;
    }
  }

  /**
   * Thêm sản phẩm vào giỏ hàng với số lượng từ bộ đếm (selectedQuantity).
   * Sau khi thêm thành công, reset selectedQuantity về 1 để chuẩn bị cho lần tiếp theo.
   * QUAN TRỌNG: Phải pass đúng selectedQuantity, không hardcode = 1
   */
  addToCart(): void {
    // Thêm vào giỏ với số lượng từ bộ đếm
    this.cartService.addToCart({ ...this.product, quantity: this.selectedQuantity });
    // Hiện toast thông báo thành công
    this.toastService.success(
      `Đã thêm ${this.selectedQuantity} x "${this.product.name}" vào giỏ hàng`,
      3000
    );
    // Reset bộ đếm về 1 cho lần tiếp theo
    this.selectedQuantity = 1;
  }

  /**
   * Mua ngay (Buy Now): Thêm sản phẩm vào giỏ hàng và điều hướng ngay sang trang giỏ hàng.
   * Luồng:
   * 1. Validate: Nếu hết hàng (stockQuantity <= 0) → hiện toast lỗi, không tiếp tục
   * 2. Thêm sản phẩm vào giỏ với selectedQuantity
   * 3. Điều hướng sang /cart để người dùng xem giỏ và tiếp tục checkout
   * 
   * Khác với "Thêm vào giỏ hàng":
   * - "Thêm vào giỏ hàng": chỉ thêm vào giỏ, ở lại trang hiện tại
   * - "Mua ngay": thêm vào giỏ rồi chuyển sang /cart
   * 
   * Lưu ý: Route '/checkout' không tồn tại trong app-routing.module.ts,
   * chỉ có '/cart' (giỏ hàng) và '/payment' (thanh toán).
   */
  onBuyNow(): void {
    // Validate: Kiểm tra stock
    if (this.product.stockQuantity <= 0) {
      this.toastService.error('Sản phẩm đã hết hàng', 3000);
      return;
    }

    // Thêm vào giỏ hàng với số lượng từ bộ đếm (selectedQuantity)
    this.cartService.addToCart({ ...this.product, quantity: this.selectedQuantity });

    // Hiển thị toast thông báo thành công
    this.toastService.success(
      `Đã thêm ${this.selectedQuantity} x "${this.product.name}" vào giỏ hàng. Chuyển tới thanh toán...`,
      2000
    );

    // Chờ toast hiển thị xong rồi điều hướng sang /cart
    // (không navigate ngay để người dùng nhìn thấy toast notification)
    setTimeout(() => {
      this.router.navigate(['/cart']);
    }, 500);
  }

  /**
   * Xử lý khi user submit review thành công
   */
  onReviewSubmitted(review: Review) {
    this.newReviewAdded = true;
    setTimeout(() => {
      this.newReviewAdded = false;
    }, 2000);
  }

  get productId(): string {
    return this.product.productId;
  }
}
