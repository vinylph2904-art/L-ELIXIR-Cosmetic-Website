import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CartService } from '../../services/cart.service';
import { ProductService } from '../../services/product.service';
import { Product } from '../../data/product.model';

@Component({
  selector: 'app-product-detail',
  templateUrl: './product-detail.component.html',
  styleUrls: ['./product-detail.component.css']
})
export class ProductDetailComponent implements OnInit {

  product!: Product;
  selectedImage = '';

  constructor(
    private route: ActivatedRoute,
    private cartService: CartService,
    private productService: ProductService
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');

    this.productService.getProducts().subscribe(products => {
      const found = products.find(item => item.productId === id);

      if (found) {
        this.product = found;
        this.selectedImage = found.images[0];
      }
    });
  }

  addToCart() {
    this.cartService.addToCart({
      ...this.product,
      quantity: 1
    });
  }
}