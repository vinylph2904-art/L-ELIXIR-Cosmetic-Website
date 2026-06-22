import { Component, Input } from '@angular/core';
import { Router } from '@angular/router';
import { Product } from '../../data/product.model';
import { CartService } from '../../services/cart.service';

@Component({
  selector: 'app-product-card',
  templateUrl: './product-card.component.html',
  styleUrls: ['./product-card.component.css']
})
export class ProductCardComponent {

  constructor(
    private router: Router,
    private cartService: CartService
  ) {}

  @Input() product!: Product;

  goToDetail() {
    this.router.navigate(['/products', this.product.productId]);
  }

  addToCart(event: Event) {
    event.stopPropagation();
    this.cartService.addToCart(this.product);
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