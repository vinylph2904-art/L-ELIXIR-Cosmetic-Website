import { Component, OnInit } from '@angular/core';
import { Product } from '../../data/product.model';
import { ProductService } from '../../services/product.service';
import { CartService } from '../../services/cart.service';
import { ToastService } from '../../services/toast.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {
  featuredProducts: Product[] = [];
  categories: { name: string; image: string }[] = [
    { name: 'Sữa rửa mặt', image: 'assets/images/SRM/SP01.1.png' },
    { name: 'Toner', image: 'assets/images/Toner/1.1.png' },
    { name: 'Serum', image: 'assets/images/Serum/Serum 1.png' },
    { name: 'Kem dưỡng', image: 'assets/images/Kem dưỡng/1.1.png' },
    { name: 'Chống nắng', image: 'assets/images/KCN/kcn 1.1.jpg' }
  ];
  products: Product[] = [];
  collections = [
    {
      name: 'Lumina',
      title: 'Bộ sưu tập Lumina',
      subtitle: 'Tinh hoa dưỡng sáng',
      image: 'assets/images/Banner/LuminaBanner.jpg',
      route: '/articles/lumina'
    },
    {
      name: 'Aurora',
      title: 'Bộ sưu tập Aurora',
      subtitle: 'Vẻ đẹp rạng đông',
      image: 'assets/images/Banner/AuroraBanner.jpg',
      route: '/articles/aurora'
    }
  ];

  constructor(
    private productService: ProductService,
    private cartService: CartService,
    private toastService: ToastService
  ) {}

  ngOnInit(): void {
    this.productService.getProducts().subscribe(data => {
      this.products = data.slice(0, 4);
      this.featuredProducts = [...data]
        .sort((a, b) => b.averageRating - a.averageRating)
        .slice(0, 4);

      const availableCategoryNames = new Set(data.map(product => product.categoryName));
      this.categories = this.categories.filter(category => availableCategoryNames.has(category.name));
    });
  }

  addToCart(product: Product) {
    this.cartService.addToCart({ ...product, quantity: 1 });
    this.toastService.success(`Đã thêm "${product.name}" vào giỏ hàng`, 3000);
  }

  getFullStars(rating: number): number {
    return Math.floor(rating);
  }

  hasHalfStar(rating: number): boolean {
    return rating % 1 >= 0.5;
  }

  getEmptyStars(rating: number): number {
    const full = Math.floor(rating);
    const half = rating % 1 >= 0.5 ? 1 : 0;
    return 5 - full - half;
  }
}
