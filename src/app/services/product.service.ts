import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { Product } from '../data/product.model';

import productsData from '../data/mock-products.json';

@Injectable({
  providedIn: 'root'
})
export class ProductService {

  private products = productsData as Product[];

  getProducts(): Observable<Product[]> {
    return of(this.products);
  }
}