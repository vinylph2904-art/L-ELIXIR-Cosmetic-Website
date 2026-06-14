import { Component } from '@angular/core';
import { PRODUCTS } from '../../data/mock-products';

@Component({
  selector: 'app-recommendation',
  templateUrl: './recommendation.component.html',
  styleUrls: ['./recommendation.component.css']
})
export class RecommendationComponent {
  recommended = PRODUCTS.slice(0, 3);
}
