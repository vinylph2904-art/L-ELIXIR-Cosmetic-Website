import { Component } from '@angular/core';
import { PRODUCTS } from '../../data/mock-products';
import { CartService } from '../../services/cart.service';
import { ToastService } from '../../services/toast.service';

@Component({
  selector: 'app-product-list',
  templateUrl: './product-list.component.html',
  styleUrls: ['./product-list.component.css']
})
export class ProductListComponent {
  products = PRODUCTS;

  constructor(
    private cartService: CartService,
    private toastService: ToastService
  ) {}

  addToCart(product: any) {
    this.cartService.addToCart({ ...product, quantity: 1 });
    this.toastService.success(`Đã thêm "${product.name}" vào giỏ hàng`, 3000);
  }
}
