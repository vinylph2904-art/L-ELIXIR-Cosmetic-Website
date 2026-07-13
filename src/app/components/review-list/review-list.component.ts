import { Component, Input, OnInit, OnChanges, SimpleChanges } from '@angular/core';
import { Review } from '../../data/review.model';
import { ReviewService } from '../../services/review.service';

/**
 * Review List Component - Hiển thị danh sách đánh giá sản phẩm
 * Dùng cho UC11: Đánh giá & Bình luận
 */
@Component({
  selector: 'app-review-list',
  templateUrl: './review-list.component.html',
  styleUrls: ['./review-list.component.css']
})
export class ReviewListComponent implements OnInit, OnChanges {
  @Input() productId!: string;
  @Input() key?: string;
  @Input() maxItems?: number;

  reviews: Review[] = [];
  averageRating: number = 0;
  totalReviews: number = 0;

  // Math object để dùng trong template
  Math = Math;

  constructor(private reviewService: ReviewService) {}

  ngOnInit() {
    this.loadReviews();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['key']) {
      this.loadReviews();
    }
  }

  /**
   * Tải danh sách review cho sản phẩm
   */
  private loadReviews() {
    const allReviews = this.reviewService.getByProductId(this.productId);
    // Giữ 2 review mới nhất: getByProductId đã trả về reviews theo createdAt giảm dần.
    this.reviews = this.maxItems ? allReviews.slice(0, this.maxItems) : allReviews;
    const ratingInfo = this.reviewService.calcAverageRating(this.productId);
    this.averageRating = ratingInfo.average;
    this.totalReviews = ratingInfo.count;
  }

  getFullStars(rating: number): number {
    return Math.floor(rating);
  }

  hasHalfStar(rating: number): boolean {
    return rating % 1 >= 0.25;
  }

  getEmptyStars(rating: number): number {
    return 5 - Math.floor(rating) - (rating % 1 >= 0.25 ? 1 : 0);
  }

  /**
   * Đếm số review có rating bằng tham số
   */
  countByRating(rating: number): number {
    return this.reviews.filter(r => r.rating === rating).length;
  }

  /**
   * Tính phần trăm cho thanh tiến độ rating
   */
  getRatingPercentage(rating: number): string {
    const count = this.countByRating(rating);
    return this.totalReviews > 0 ? `${(count / this.totalReviews) * 100}%` : '0%';
  }

  /**
   * Format ngày tạo review
   */
  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }
}
