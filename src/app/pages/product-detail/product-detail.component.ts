import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { PRODUCTS } from '../../data/mock-products';
import { CartService } from '../../services/cart.service';
import { ToastService } from '../../services/toast.service';

@Component({
  selector: 'app-product-detail',
  templateUrl: './product-detail.component.html',
  styleUrls: ['./product-detail.component.css']
})
export class ProductDetailComponent {
  product = PRODUCTS[0];

  constructor(
    route: ActivatedRoute,
    private cartService: CartService,
    private toastService: ToastService
  ) {
    const id = route.snapshot.paramMap.get('id');
    const found = PRODUCTS.find(item => item.id === id);
    if (found) {
      this.product = found;
    }
  }

  addToCart() {
    this.cartService.addToCart({ ...this.product, quantity: 1 });
    this.toastService.success('Đã thêm vào giỏ hàng thành công', 3000);
  }
}
