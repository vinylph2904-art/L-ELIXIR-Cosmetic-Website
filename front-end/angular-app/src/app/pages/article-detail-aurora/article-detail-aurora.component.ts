import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Product } from '../../data/product.model';
import { ProductService } from '../../services/product.service';

@Component({
  selector: 'app-article-detail-aurora',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './article-detail-aurora.component.html',
  styleUrls: ['../article-detail/article-detail.component.css']
})
export class ArticleDetailAuroraComponent implements OnInit {
  article = {
    title: 'Vẻ Đẹp Rạng Đông Aurora',
    excerpt: 'Aurora là bộ sưu tập đặc biệt được lấy cảm hứng từ hiện tượng Aurora Borealis, giúp làn da có ánh nhìn tự nhiên và khỏe mạnh từ bên trong.',
    image: 'assets/images/Banner/AuroraBanner.jpg',
    collection: 'Aurora'
  };
  relatedProducts: Product[] = [];

  constructor(private productService: ProductService) {}

  ngOnInit() {
    this.loadRelatedProducts();
  }

  private loadRelatedProducts(): void {
    const normalizedCollection = this.article.collection.toLowerCase();
    this.productService.getProducts().subscribe(products => {
      this.relatedProducts = products.filter(product => {
        const productCollection = product.collection?.toLowerCase() || '';
        const productName = product.name.toLowerCase();
        return productCollection === normalizedCollection || productName.includes(normalizedCollection);
      });
    });
  }
}
