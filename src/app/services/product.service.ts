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

  getProducts(includeDeleted: boolean = false): Observable<Product[]> {
    if (includeDeleted) {
      return of([...this.products]);
    }
    return of(this.products.filter(p => !p.isDeleted));
  }

  getAllProductsAdmin(): Observable<Product[]> {
    return of([...this.products]);
  }

  addProduct(product: Product): Observable<Product> {
    const newProduct: Product = {
      ...product,
      productId: product.productId || `SP${(this.products.length + 1).toString().padStart(2, '0')}`,
      averageRating: product.averageRating || 5.0,
      reviewCount: product.reviewCount || 0,
      isDeleted: false
    };

    this.products = [newProduct, ...this.products];
    this.saveProducts();
    return of(newProduct);
  }

  updateProduct(updatedProduct: Product): Observable<Product> {
    this.products = this.products.map(p => p.productId === updatedProduct.productId ? { ...p, ...updatedProduct } : p);
    this.saveProducts();
    return of(updatedProduct);
  }

  softDeleteProduct(productId: string): Observable<boolean> {
    this.products = this.products.map(p => p.productId === productId ? { ...p, isDeleted: true } : p);
    this.saveProducts();
    return of(true);
  }

  restoreProduct(productId: string): Observable<boolean> {
    this.products = this.products.map(p => p.productId === productId ? { ...p, isDeleted: false } : p);
    this.saveProducts();
    return of(true);
  }

  deleteProduct(productId: string): Observable<boolean> {
    this.products = this.products.filter(p => p.productId !== productId);
    this.saveProducts();
    return of(true);
  }

  private saveProducts(): void {
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.products));
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

  syncAllProductStats(statsByProductId: Map<string, { averageRating: number; reviewCount: number }>): void {
    this.products = this.products.map(product => {
      const stats = statsByProductId.get(product.productId);

      if (!stats) {
        return {
          ...product,
          averageRating: 0,
          reviewCount: 0
        };
      }

      return {
        ...product,
        averageRating: stats.averageRating,
        reviewCount: stats.reviewCount
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