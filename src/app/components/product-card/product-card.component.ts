import { Component, Input } from '@angular/core';
import { Router } from '@angular/router';
import { Product } from '../../data/product.model';
import { CartService } from '../../services/cart.service';
import { ToastService } from '../../services/toast.service';

@Component({
  selector: 'app-product-card',
  templateUrl: './product-card.component.html',
  styleUrls: ['./product-card.component.css']
})
export class ProductCardComponent {

  constructor(
    private router: Router,
    private cartService: CartService,
    private toastService: ToastService
  ) {}

  @Input() product!: Product;

  goToDetail() {
    this.router.navigate(['/products', this.product.productId]);
  }

  /**
   * Thêm sản phẩm vào giỏ hàng từ product card.
   * Gọi toastService để hiện thông báo sau khi thêm thành công.
   * NGUYÊN NHÂN LỖI: Trước đây component này chỉ gọi cartService mà không gọi toastService,
   * dẫn đến toast không hiện dù sản phẩm được thêm vào localStorage.
   */
  addToCart(event: Event) {
    event.stopPropagation();
    this.cartService.addToCart({ ...this.product, quantity: 1 });
    // Sau khi thêm thành công, hiện toast (lần này từ product-card, không phải từ component cha)
    this.toastService.success(`Đã thêm "${this.product.name}" vào giỏ hàng`, 3000);
  }

  getFullStars(rating: number): number {
    return Math.floor(rating);
  }

  hasHalfStar(rating: number): boolean {
    return rating % 1 >= 0.5;
  }

  getEmptyStars(rating: number): number {
    return 5 - Math.floor(rating) - (rating % 1 >= 0.5 ? 1 : 0);
  }
}