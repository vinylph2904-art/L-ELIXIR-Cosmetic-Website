import { Component, OnInit } from '@angular/core';
import { Product } from '../../data/product.model';
import { CartService } from '../../services/cart.service';
import { ToastService } from '../../services/toast.service';

@Component({
  selector: 'app-cart',
  templateUrl: './cart.component.html',
  styleUrls: ['./cart.component.css'],
})
export class CartComponent implements OnInit {
  cartItems: Product[] = [];
  productPendingDelete: Product | null = null;

  constructor(
    private cartService: CartService,
    private toastService: ToastService
  ) {}

  ngOnInit(): void {
    this.refreshCart();
  }

  refreshCart() {
    this.cartItems = this.cartService.getCart();
  }

  changeQuantity(productId: string, delta: number): void {
    const item = this.cartItems.find((item) => item.productId === productId);
    if (!item) return;

    const newQuantity = (item.quantity || 1) + delta;

    if (newQuantity <= 0) {
      this.askDeleteConfirm(item);
    } else {
      this.cartService.updateQuantity(productId, newQuantity);
      this.refreshCart();
    }
  }

  askDeleteConfirm(item: Product) {
    this.productPendingDelete = item;
  }

  confirmDelete() {
    if (!this.productPendingDelete) return;
    this.cartService.removeFromCart(this.productPendingDelete.productId);
    this.productPendingDelete = null;
    this.refreshCart();
    this.toastService.show('Đã xóa sản phẩm khỏi giỏ hàng', 'success');
  }

  cancelDelete() {
    this.productPendingDelete = null;
  }

  get isCartEmpty(): boolean {
    return this.cartItems.length === 0;
  }

  total() {
    return this.cartItems.reduce((sum, item) => sum + item.price * (item.quantity || 1), 0);
  }

  shippingFee() {
    return this.cartItems.length > 0 ? 30000 : 0;
  }

  discount() {
    return this.cartItems.length > 0 ? 100000 : 0;
  }

  grandTotal() {
    return this.total() + this.shippingFee() - this.discount();
  }
}
