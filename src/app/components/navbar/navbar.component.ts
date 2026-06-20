import { Component, HostListener, OnInit } from '@angular/core';
import { CartService } from '../../services/cart.service';
import { ProductService } from '../../services/product.service';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css']
})
export class NavbarComponent implements OnInit {
  mobileMenuOpen = false;
  cartCount = 0;
  categories: string[] = [];

  constructor(private cartService: CartService, private productService: ProductService) {
    this.cartService.cartCount$.subscribe(count => this.cartCount = count);
  }

  ngOnInit(): void {
    this.productService.getProducts().subscribe(products => {
      this.categories = [
        ...new Set(products.map(p => p.categoryName))
      ];
    });
  }

  toggleMobileMenu() {
    this.mobileMenuOpen = !this.mobileMenuOpen;
  }
}
