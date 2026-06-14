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

  constructor(private cartService: CartService) {}

  ngOnInit() {
    this.refreshCart();
  }

  refreshCart() {
    this.cartItems = this.cartService.getCart();
  }

  removeItem(id: string) {
    this.cartService.removeFromCart(id);
    this.refreshCart();
  }

  changeQuantity(productId: string, delta: number) {
    const item = this.cartItems.find(i => i.id === productId);
    if (!item) {
      return;
    }

    const nextQuantity = Math.max(0, (item.quantity || 1) + delta);
    this.cartService.updateQuantity(productId, nextQuantity);
    this.refreshCart();
  }

  total() {
    return this.cartItems.reduce((sum, item) => sum + item.price * (item.quantity || 1), 0);
  }
}
