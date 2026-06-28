import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Product } from '../../data/product.model';
import { Review } from '../../data/review.model';
import { Order } from '../../data/order.model';
import { ProductService } from '../../services/product.service';
import { ReviewService } from '../../services/review.service';

@Component({
  selector: 'app-product-reviews',
  templateUrl: './product-reviews.component.html',
  styleUrls: ['./product-reviews.component.css']
})
export class ProductReviewsComponent implements OnInit {
  product: Product | null = null;
  reviews: Review[] = [];
  currentUserId: string | null = null;
  currentUserName: string | null = null;
  orders: Order[] = [];
  reviewRefreshKey = 'normal';

  ratingSummary = {
    average: 0,
    count: 0,
    fiveStar: 0,
    fourStar: 0,
    threeStar: 0,
    twoStar: 0,
    oneStar: 0
  };

  constructor(
    private route: ActivatedRoute,
    private productService: ProductService,
    private reviewService: ReviewService
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    this.loadProduct(id);
    this.loadReviews(id);
    this.loadUserContext();
  }

  private loadProduct(productId: string | null): void {
    if (!productId) {
      return;
    }

    this.productService.getProducts().subscribe(products => {
      this.product = products.find(item => item.productId === productId) || null;
    });
  }

  private loadReviews(productId: string | null): void {
    if (!productId) {
      return;
    }

    this.reviews = this.reviewService.getByProductId(productId);
    this.ratingSummary = this.buildSummary(this.reviews);
  }

  private loadUserContext(): void {
    const ordersData = localStorage.getItem('orders');
    this.orders = ordersData ? JSON.parse(ordersData) : [];
    this.currentUserId = localStorage.getItem('currentUserId') || 'user_001';
    this.currentUserName = localStorage.getItem('currentUserName') || 'Người dùng';
  }

  private buildSummary(reviews: Review[]) {
    const total = reviews.length;
    return {
      average: total ? Number((reviews.reduce((acc, review) => acc + review.rating, 0) / total).toFixed(1)) : 0,
      count: total,
      fiveStar: reviews.filter(review => review.rating === 5).length,
      fourStar: reviews.filter(review => review.rating === 4).length,
      threeStar: reviews.filter(review => review.rating === 3).length,
      twoStar: reviews.filter(review => review.rating === 2).length,
      oneStar: reviews.filter(review => review.rating === 1).length
    };
  }

  getStarArray(): number[] {
    return [1, 2, 3, 4, 5];
  }

  getPercentage(count: number): string {
    return this.ratingSummary.count > 0 ? `${Math.round((count / this.ratingSummary.count) * 100)}%` : '0%';
  }

  getStarStyle(star: number, rating: number): string {
    return star <= rating ? '"FILL" 1' : '"FILL" 0';
  }

  isEligibleToReview(): boolean {
    if (!this.product || !this.currentUserId || !this.currentUserName) {
      return false;
    }

    const eligibleOrderId = this.reviewService.findEligibleOrderId(
      this.currentUserId,
      this.product.productId,
      this.orders
    );

    if (!eligibleOrderId) {
      return false;
    }

    return !this.reviewService.getByUserAndProduct(this.currentUserId, this.product.productId);
  }

  onReviewSubmitted(): void {
    if (this.product) {
      this.loadReviews(this.product.productId);
      this.reviewRefreshKey = this.reviewRefreshKey === 'normal' ? 'refresh' : 'normal';
    }
  }

  formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  }
}
