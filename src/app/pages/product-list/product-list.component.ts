import { Component } from '@angular/core';
import { PRODUCTS } from '../../data/mock-products';
import { CartService } from '../../services/cart.service';

@Component({
  selector: 'app-product-list',
  templateUrl: './product-list.component.html',
  styleUrls: ['./product-list.component.css']
})
export class ProductListComponent {
  products = PRODUCTS;

  constructor(private cartService: CartService) {}

  addToCart(product: any) {
    this.cartService.addToCart({ ...product, quantity: 1 });
  }
}
