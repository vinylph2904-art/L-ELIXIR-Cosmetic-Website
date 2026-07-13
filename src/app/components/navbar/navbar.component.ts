import { Component, HostListener, OnInit } from '@angular/core';
import { CartService } from '../../services/cart.service';
import { AuthService } from '../../services/auth.service';
import { ProductService } from '../../services/product.service';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css']
})
export class NavbarComponent implements OnInit {
  mobileMenuOpen = false;
  mobileHomeDropdownOpen = false;
  mobileProductsDropdownOpen = false;
  cartCount = 0;
  categories: string[] = [];

  constructor(private cartService: CartService, private authService: AuthService, private productService: ProductService) {
    this.cartService.cartCount$.subscribe(count => this.cartCount = count);
  }

  get accountLink(): string {
    return this.authService.isLoggedIn() ? '/profile' : '/login';
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
    if (!this.mobileMenuOpen) {
      this.mobileHomeDropdownOpen = false;
      this.mobileProductsDropdownOpen = false;
    }
  }

  toggleMobileDropdown(type: 'home' | 'products') {
    if (type === 'home') {
      this.mobileHomeDropdownOpen = !this.mobileHomeDropdownOpen;
      this.mobileProductsDropdownOpen = false;
    } else {
      this.mobileProductsDropdownOpen = !this.mobileProductsDropdownOpen;
      this.mobileHomeDropdownOpen = false;
    }
  }

  closeMobileMenu() {
    this.mobileMenuOpen = false;
    this.mobileHomeDropdownOpen = false;
    this.mobileProductsDropdownOpen = false;
  }
}
