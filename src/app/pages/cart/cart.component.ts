import { Component, OnInit } from '@angular/core';
import { CartService } from '../../services/cart.service';
import { Product } from '../../data/product.model';

@Component({
  selector: 'app-cart',
  templateUrl: './cart.component.html',
  styleUrls: ['./cart.component.css']
})
export class CartComponent implements OnInit {
  cartItems: Product[] = [];
  productPendingDelete: Product | null = null; // Sản phẩm đang chờ xác nhận xóa

  constructor(private cartService: CartService) {}

  ngOnInit() {
    this.refreshCart();
  }

  /** Tải lại dữ liệu giỏ hàng từ CartService */
  refreshCart() {
    this.cartItems = this.cartService.getCart();
  }

  /**
   * Yêu cầu xác nhận xóa sản phẩm khi người dùng nhấn nút Xóa.
   * Chỉ gán sản phẩm vào biến chờ xóa, không xóa ngay.
   */
  askDeleteConfirm(item: Product) {
    this.productPendingDelete = item;
  }

  /**
   * Thay đổi số lượng sản phẩm.
   * Nếu giảm xuống 0 khi số lượng hiện tại là 1 -> hiển thị popup xác nhận.
   */
  changeQuantity(productId: string, delta: number) {
    const item = this.cartItems.find(i => i.id === productId);
    if (!item) {
      return;
    }

    const currentQuantity = item.quantity || 1;
    const nextQuantity = currentQuantity + delta;

    if (delta === -1 && currentQuantity === 1) {
      // AF2: Sắp xóa sản phẩm, mở popup xác nhận
      this.productPendingDelete = item;
      return;
    }

    if (nextQuantity > 0) {
      this.cartService.updateQuantity(productId, nextQuantity);
      this.refreshCart();
    }
  }

  /** Xác nhận xóa sản phẩm khi popup được mở */
  confirmDelete() {
    if (!this.productPendingDelete) {
      return;
    }

    this.cartService.removeFromCart(this.productPendingDelete.id);
    this.productPendingDelete = null;
    this.refreshCart();
  }

  /** Hủy xác nhận xóa và giữ nguyên giỏ hàng */
  cancelDelete() {
    this.productPendingDelete = null;
  }

  /** Trạng thái giỏ hàng trống */
  get isCartEmpty(): boolean {
    return this.cartItems.length === 0;
  }

  /** Tính toán tổng tiền hiện tại */
  total() {
    return this.cartItems.reduce((sum, item) => sum + item.price * (item.quantity || 1), 0);
  }
}
