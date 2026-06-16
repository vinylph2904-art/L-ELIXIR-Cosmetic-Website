import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Product } from '../data/product.model';

@Injectable({ providedIn: 'root' })
export class CartService {
  private cartItems: Product[] = [];
  private cartCountSubject = new BehaviorSubject<number>(0);
  cartCount$ = this.cartCountSubject.asObservable();

  constructor() {
    this.loadCart();
  }

  private getTotalCount() {
    return this.cartItems.reduce((sum, item) => sum + (item.quantity || 1), 0);
  }

  private saveCart() {
    localStorage.setItem('lelixir_cart', JSON.stringify(this.cartItems));
    this.cartCountSubject.next(this.getTotalCount());
  }

  private loadCart() {
    try {
      const raw = localStorage.getItem('lelixir_cart');
      if (raw) {
        this.cartItems = JSON.parse(raw) as Product[];
      }
    } catch {
      this.cartItems = [];
    }
    this.cartCountSubject.next(this.getTotalCount());
  }

  getCart() {
    return [...this.cartItems];
  }

  addToCart(product: Product) {
    const existing = this.cartItems.find(item => item.productId === product.productId);
    if (existing) {
      existing.quantity = (existing.quantity || 1) + (product.quantity || 1);
    } else {
      this.cartItems.push({ ...product });
    }
    this.saveCart();
  }

  updateQuantity(productId: string, quantity: number) {
    this.cartItems = this.cartItems
      .map(item => item.productId === productId ? { ...item, quantity } : item)
      .filter(item => (item.quantity || 1) > 0);
    this.saveCart();
  }

  removeFromCart(productId: string) {
    this.cartItems = this.cartItems.filter(item => item.productId !== productId);
    this.saveCart();
  }

  clearCart() {
    this.cartItems = [];
    this.saveCart();
  }
}
