import { Injectable } from '@angular/core';
import { Observable, map } from 'rxjs';
import { HttpClient } from '@angular/common/http';

import { Product } from '../data/product.model';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ProductService {

  // http://localhost:3000/api/products
  private readonly apiUrl = `${environment.apiUrl}/products`;

  constructor(private http: HttpClient) {}

  // =========================
  // GET PRODUCTS
  // =========================

  // Lấy danh sách sản phẩm
  getProducts(includeDeleted: boolean = false): Observable<Product[]> {

    return this.http.get<Product[]>(this.apiUrl).pipe(
      map(products => {
        if (includeDeleted) {
          return products;
        }

        return products.filter(product => !product.isDeleted);
      })
    );
  }


  // Admin lấy tất cả sản phẩm
  getAllProductsAdmin(): Observable<Product[]> {
    return this.http.get<Product[]>(this.apiUrl);
  }


  // =========================
  // GET PRODUCT BY ID
  // =========================

  getProductById(productId: string): Observable<Product> {
    return this.http.get<Product>(
      `${this.apiUrl}/${productId}`
    );
  }


  // =========================
  // ADD PRODUCT
  // =========================

  addProduct(product: Product): Observable<Product> {

    const newProduct: Product = {
      ...product,
      averageRating: product.averageRating || 5.0,
      reviewCount: product.reviewCount || 0,
      isDeleted: false
    };

    return this.http.post<Product>(
      this.apiUrl,
      newProduct
    );
  }


  // =========================
  // UPDATE PRODUCT
  // =========================

  updateProduct(updatedProduct: Product): Observable<Product> {

    return this.http.put<Product>(
      `${this.apiUrl}/${updatedProduct.productId}`,
      updatedProduct
    );
  }


  // =========================
  // SOFT DELETE
  // =========================

  softDeleteProduct(productId: string): Observable<boolean> {

    return this.http.delete<any>(
      `${this.apiUrl}/${productId}`
    ).pipe(
      map(() => true)
    );
  }


  // =========================
  // RESTORE PRODUCT
  // =========================

  restoreProduct(productId: string): Observable<boolean> {

    return this.http.put<Product>(
      `${this.apiUrl}/${productId}`,
      {
        isDeleted: false
      }
    ).pipe(
      map(() => true)
    );
  }


  // =========================
  // DELETE PRODUCT
  // =========================

  deleteProduct(productId: string): Observable<boolean> {

    return this.http.delete<any>(
      `${this.apiUrl}/${productId}`
    ).pipe(
      map(() => true)
    );
  }


  // =========================
  // SYNC PRODUCT STATS
  // =========================

  syncProductStats(
    productId: string,
    averageRating: number,
    reviewCount: number
  ): void {

    this.http.put<Product>(
      `${this.apiUrl}/${productId}`,
      {
        averageRating,
        reviewCount
      }
    ).subscribe({
      next: () => {
        console.log(`Đã cập nhật stats cho ${productId}`);
      },
      error: (error) => {
        console.error(
          `Lỗi cập nhật stats cho ${productId}:`,
          error
        );
      }
    });
  }


  // =========================
  // SYNC ALL PRODUCT STATS
  // =========================

  syncAllProductStats(
    statsByProductId: Map<
      string,
      {
        averageRating: number;
        reviewCount: number;
      }
    >
  ): void {

    statsByProductId.forEach((stats, productId) => {

      this.http.put<Product>(
        `${this.apiUrl}/${productId}`,
        {
          averageRating: stats.averageRating,
          reviewCount: stats.reviewCount
        }
      ).subscribe({
        next: () => {
          console.log(`Đã cập nhật stats cho ${productId}`);
        },
        error: (error) => {
          console.error(
            `Lỗi cập nhật stats cho ${productId}:`,
            error
          );
        }
      });

    });
  }

}