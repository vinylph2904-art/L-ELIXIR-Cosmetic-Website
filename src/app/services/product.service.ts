import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { Product } from '../data/product.model';

import productsData from '../data/mock-data/mock-products.json';

@Injectable({
  providedIn: 'root'
})
export class ProductService {
  private readonly STORAGE_KEY = 'lelixir_products';
  private products: Product[];

  constructor() {
    this.products = this.loadProducts();
  }

  getProducts(): Observable<Product[]> {
    return of(this.products);
  }

  syncProductStats(productId: string, averageRating: number, reviewCount: number): void {
    this.products = this.products.map(product => {
      if (product.productId !== productId) {
        return product;
      }

      return {
        ...product,
        averageRating,
        reviewCount
      };
    });

    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.products));
  }

  private loadProducts(): Product[] {
    try {
      const raw = localStorage.getItem(this.STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as Product[];
        // Ensure we have all 50 products, if not fall back to seed data
        if (parsed.length >= 50) {
          return parsed;
        }
      }
    } catch {
      // ignore and fall back to seed data
    }

    const initialProducts = productsData as Product[];
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(initialProducts));
    return initialProducts;
  }
}