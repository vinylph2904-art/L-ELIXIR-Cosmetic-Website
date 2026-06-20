import { Component, HostListener } from '@angular/core';
import { CartService } from '../../services/cart.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css']
})
export class NavbarComponent {
  mobileMenuOpen = false;
  cartCount = 0;

  constructor(private cartService: CartService, private authService: AuthService) {
    this.cartService.cartCount$.subscribe(count => this.cartCount = count);
  }

  get accountLink(): string {
    return this.authService.isLoggedIn() ? '/profile' : '/login';
  }

  toggleMobileMenu() {
    this.mobileMenuOpen = !this.mobileMenuOpen;
  }
}
