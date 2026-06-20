import { Component, OnInit } from '@angular/core';
import { Product } from '../../data/product.model';
import { ProductService } from '../../services/product.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {

  featuredProducts: Product[] = [];
  categories: string[] = [];
  collections = [
    {
      name: 'Lumina',
      title: 'Bộ sưu tập Lumina',
      subtitle: 'Tinh hoa dưỡng sáng',
      image: 'assets/images/lumina-banner.jpg'
    },
    {
      name: 'Aurora',
      title: 'Bộ sưu tập Aurora',
      subtitle: 'Vẻ đẹp rạng đông',
      image: 'assets/images/aurora-banner.jpg'
    }
  ];

  constructor(private productService: ProductService) {}

  ngOnInit(): void {
    this.productService.getProducts().subscribe(data => {
    this.featuredProducts = [...data]
      .sort((a, b) => b.averageRating - a.averageRating)
      .slice(0, 4);

    this.categories = [...new Set(
      data.map(product => product.categoryName)
    )];
  });
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