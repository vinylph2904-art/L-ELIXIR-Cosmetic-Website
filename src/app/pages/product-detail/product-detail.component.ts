import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { PRODUCTS } from '../../data/mock-products';
import { CartService } from '../../services/cart.service';

@Component({
  selector: 'app-product-detail',
  templateUrl: './product-detail.component.html',
  styleUrls: ['./product-detail.component.css']
})
export class ProductDetailComponent {
  product = PRODUCTS[0];

  constructor(route: ActivatedRoute, private cartService: CartService) {
    const id = route.snapshot.paramMap.get('id');
    const found = PRODUCTS.find(item => item.productId === id);
    if (found) {
      this.product = found;
    }
  }

  addToCart() {
    this.cartService.addToCart({ ...this.product, quantity: 1 });
  }
}
