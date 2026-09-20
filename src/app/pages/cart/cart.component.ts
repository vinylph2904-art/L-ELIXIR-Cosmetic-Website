import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
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
  quantityErrors: Record<string, string> = {};
  selectedProductIds: Set<string> = new Set<string>();
  private _enterPressed = false;

  constructor(
    private cartService: CartService,
    private toastService: ToastService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.refreshCart();
  }

  refreshCart() {
    this.cartItems = this.cartService.getCart();
    this.selectedProductIds = new Set(
      this.cartItems.filter(item => this.selectedProductIds.has(item.productId)).map(item => item.productId)
    );
    if (this.cartItems.length > 0 && this.selectedProductIds.size === 0) {
      this.cartItems.forEach(item => this.selectedProductIds.add(item.productId));
    }
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

  setQuantity(productId: string, newValue: number): void {
    const item = this.cartItems.find((item) => item.productId === productId);
    if (!item) return;

    const safeValue = Number.isFinite(newValue) ? Math.floor(newValue) : 1;

    if (safeValue <= 0) {
      this.askDeleteConfirm(item);
      return;
    }

    const maxQuantity = item.stockQuantity > 0 ? item.stockQuantity : Number.POSITIVE_INFINITY;
    const finalValue = maxQuantity !== Number.POSITIVE_INFINITY && safeValue > maxQuantity ? maxQuantity : safeValue;

    this.cartService.updateQuantity(productId, finalValue);
    this.refreshCart();
    this.quantityErrors[productId] = '';
  }

  onQuantityInputChange(productId: string, value: number | string | null): void {
    if (value === null || value === '') {
      this.quantityErrors[productId] = '';
      return;
    }

    const parsedValue = typeof value === 'string' ? Number(value.trim()) : value;
    const item = this.cartItems.find((item) => item.productId === productId);

    if (!item) return;

    if (!Number.isFinite(parsedValue) || !Number.isInteger(parsedValue) || parsedValue < 1) {
      this.quantityErrors[productId] = '';
      return;
    }

    const maxQuantity = item.stockQuantity > 0 ? item.stockQuantity : Number.POSITIVE_INFINITY;
    if (maxQuantity !== Number.POSITIVE_INFINITY && parsedValue > maxQuantity) {
      this.quantityErrors[productId] = `Số lượng tối đa là ${maxQuantity}`;
      return;
    }

    this.quantityErrors[productId] = '';
  }

  validateQuantity(productId: string): void {
    const item = this.cartItems.find((item) => item.productId === productId);
    if (!item) return;

    const currentValue = item.quantity || 1;
    const parsedValue = Number(currentValue);

    if (!Number.isFinite(parsedValue) || !Number.isInteger(parsedValue) || parsedValue < 1) {
      this.setQuantity(productId, 1);
      return;
    }

    const maxQuantity = item.stockQuantity > 0 ? item.stockQuantity : Number.POSITIVE_INFINITY;
    if (maxQuantity !== Number.POSITIVE_INFINITY && parsedValue > maxQuantity) {
      this.setQuantity(productId, maxQuantity);
      return;
    }

    this.setQuantity(productId, parsedValue);
  }

  getQuantityError(productId: string): string {
    return this.quantityErrors[productId] || '';
  }

  onBlurQuantity(productId: string, event: FocusEvent): void {
    if (this._enterPressed) return; // Enter đã xử lý rồi, bỏ qua blur
    const input = event.target as HTMLInputElement;
    const value = Number(input.value);
    this.setQuantity(productId, isNaN(value) || value < 1 ? 1 : value);
  }

  onEnterQuantity(productId: string, event: Event): void {
    const input = event.target as HTMLInputElement;
    const value = Number(input.value);
    this._enterPressed = true;
    this.setQuantity(productId, isNaN(value) || value < 1 ? 1 : value);
    setTimeout(() => {
      input.blur();
      this._enterPressed = false;
    }, 0);
  }

  toggleSelectAll(checked: boolean): void {
    this.selectedProductIds = new Set<string>();
    if (checked) {
      this.cartItems.forEach(item => this.selectedProductIds.add(item.productId));
    }
  }

  toggleSelectItem(productId: string, checked: boolean): void {
    if (checked) {
      this.selectedProductIds.add(productId);
    } else {
      this.selectedProductIds.delete(productId);
    }
  }

  isSelected(productId: string): boolean {
    return this.selectedProductIds.has(productId);
  }

  get isAllSelected(): boolean {
    return this.cartItems.length > 0 && this.cartItems.every(item => this.selectedProductIds.has(item.productId));
  }

  get hasSelectedItems(): boolean {
    return this.selectedProductIds.size > 0;
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
    return this.cartItems
      .filter(item => this.selectedProductIds.has(item.productId))
      .reduce((sum, item) => sum + item.price * (item.quantity || 1), 0);
  }

  shippingFee() {
    return this.getSelectedItems().length > 0 ? 30000 : 0;
  }

  discount() {
    return this.getSelectedItems().length > 0 ? 100000 : 0;
  }

  grandTotal() {
    return this.total() + this.shippingFee() - this.discount();
  }

  getSelectedItems(): Product[] {
    return this.cartItems.filter(item => this.selectedProductIds.has(item.productId));
  }

  goToPayment(): void {
    if (!this.hasSelectedItems) {
      return;
    }

    sessionStorage.setItem('selectedCheckoutItems', JSON.stringify(this.getSelectedItems()));
    this.router.navigate(['/payment']);
  }
}
