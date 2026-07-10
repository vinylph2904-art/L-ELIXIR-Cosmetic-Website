import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Product } from '../../data/product.model';
import { ProductService } from '../../services/product.service';

@Component({
  selector: 'app-article-detail-lumina',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './article-detail-lumina.component.html',
  styleUrls: ['../article-detail/article-detail.component.css']
})
export class ArticleDetailLuminaComponent implements OnInit {
  article = {
    title: 'Tinh Hoa Dưỡng Sáng Lumina',
    excerpt: 'Bộ sưu tập Lumina được thiết kế để mang lại ánh sáng tự nhiên cho làn da, với công thức độc quyền kết hợp các chiết xuất từ hoa hồng và vàng colloidal.',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuB3TGHEBLX0pS9Ay6XVoyJtbAtfj-C4ssGB2kAeTlIvD6feY1hh0bngtp7sB_S3DCHDsQJLO9ZklmTPgW6HzpndSnR1JmcjyrRYczU7_xewXdS4lljjcZhVS3YM9_J7n9SAUB0il7hHly-KiDbA0hxYJS8NFQzz2xc6WWCHxYis8Jq3gJdXyzM2nLIBKMItYtib-wWLqG2h5ZKMKYaKb_uaOH1AT6erbQ84bR2XFpSvIHJLrxhhO3NWZsq4XGsXvvijh_AcqoaYz2UJ',
    collection: 'Lumina'
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
