import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ReviewService } from '../../services/review.service';
import { Review } from '../../data/review.model';
import { Order } from '../../data/order.model';
import { ToastService } from '../../services/toast.service';

/**
 * Review Form Component - Form đánh giá sản phẩm
 * Dùng cho UC11: Đánh giá & Bình luận
 * Kiểm tra: user đã mua + đã nhận hàng, không review trùng, từ cấm
 */
@Component({
  selector: 'app-review-form',
  templateUrl: './review-form.component.html',
  styleUrls: ['./review-form.component.css']
})
export class ReviewFormComponent implements OnInit {
  @Input() productId!: string;
  @Input() productName!: string;
  @Input() orders: Order[] = []; // Danh sách order từ parent (OrderService)
  @Input() currentUserId: string | null = null; // ID người dùng hiện tại
  @Input() currentUserName: string | null = null; // Tên người dùng hiện tại

  @Output() reviewSubmitted = new EventEmitter<Review>();

  reviewForm!: FormGroup;
  isSubmitting = false;
  errorMessage = '';
  successMessage = '';

  // Rating UI
  hoverRating = 0;
  selectedRating = 0;

  // Eligibility check
  isEligibleToReview = false;
  eligibilityError = '';

  constructor(
    private fb: FormBuilder,
    private reviewService: ReviewService,
    private toastService: ToastService
  ) {}

  ngOnInit() {
    this.initForm();
    this.checkEligibility();
  }

  /**
   * Khởi tạo form đánh giá
   */
  private initForm() {
    this.reviewForm = this.fb.group({
      title: ['', [Validators.required, Validators.minLength(5)]],
      rating: [0, [Validators.required, Validators.min(1), Validators.max(5)]],
      comment: ['', [Validators.required, Validators.minLength(20)]],
      images: [[]]
    });
  }

  /**
   * Kiểm tra user có đủ điều kiện review không:
   * 1. Đã đăng nhập
   * 2. Đã mua sản phẩm (trong đơn hàng Completed)
   * 3. Chưa review sản phẩm này
   */
  private checkEligibility() {
    this.isEligibleToReview = false;
    this.eligibilityError = '';

    // Kiểm tra đăng nhập
    if (!this.currentUserId || !this.currentUserName) {
      this.eligibilityError = 'Vui lòng đăng nhập để đánh giá sản phẩm';
      return;
    }

    // Kiểm tra đã mua sản phẩm
    const eligibleOrderId = this.reviewService.findEligibleOrderId(
      this.currentUserId,
      this.productId,
      this.orders
    );

    if (!eligibleOrderId) {
      this.eligibilityError = 'Bạn cần phải mua và nhận được sản phẩm này để có thể đánh giá';
      return;
    }

    // Kiểm tra đã review chưa
    const existingReview = this.reviewService.getByUserAndProduct(this.currentUserId, this.productId);
    if (existingReview) {
      this.eligibilityError = 'Bạn đã đánh giá sản phẩm này rồi';
      return;
    }

    // Tất cả điều kiện thỏa
    this.isEligibleToReview = true;
  }

  /**
   * Set rating khi click vào sao
   */
  selectRating(rating: number) {
    this.selectedRating = rating;
    this.reviewForm.patchValue({ rating });
  }

  /**
   * Hover effect trên sao
   */
  hoverRatingEffect(rating: number) {
    this.hoverRating = rating;
  }

  /**
   * Reset hover effect
   */
  resetHover() {
    this.hoverRating = 0;
  }

  /**
   * Get sao hiện tại (hover hoặc selected)
   */
  getCurrentRating(): number {
    return this.hoverRating || this.selectedRating;
  }

  /**
   * Submit form đánh giá
   */
  submit() {
    if (!this.reviewForm.valid) {
      this.toastService.error('Vui lòng điền đầy đủ thông tin');
      return;
    }

    // Kiểm tra từ cấm
    const title = this.reviewForm.get('title')?.value || '';
    const comment = this.reviewForm.get('comment')?.value || '';

    if (this.reviewService.containsBlacklistedWord(title) || 
        this.reviewService.containsBlacklistedWord(comment)) {
      this.toastService.error('Đánh giá chứa từ cấm hoặc nội dung không phù hợp');
      return;
    }

    this.isSubmitting = true;

    // Tìm orderId để lưu
    const orderId = this.reviewService.findEligibleOrderId(
      this.currentUserId!,
      this.productId,
      this.orders
    );

    if (!orderId) {
      this.toastService.error('Không tìm thấy đơn hàng hợp lệ');
      this.isSubmitting = false;
      return;
    }

    try {
      // Tạo review mới
      const newReview = this.reviewService.create({
        productId: this.productId,
        userId: this.currentUserId!,
        userName: this.currentUserName!,
        orderId,
        title: this.reviewForm.get('title')?.value,
        rating: this.reviewForm.get('rating')?.value,
        comment: this.reviewForm.get('comment')?.value
      });

      this.reviewSubmitted.emit(newReview);
      this.toastService.success('Cảm ơn đánh giá của bạn!');
      
      // Reset form
      this.reviewForm.reset();
      this.selectedRating = 0;
      this.checkEligibility(); // Re-check eligibility sau khi submit

    } catch (error) {
      this.toastService.error('Có lỗi xảy ra, vui lòng thử lại');
    } finally {
      this.isSubmitting = false;
    }
  }

  /**
   * Get display rating (hover hoặc selected)
   */
  getDisplayRating(): number {
    return this.hoverRating || this.selectedRating;
  }

  /**
   * Check if star is filled
   */
  isStarFilled(star: number): boolean {
    return star <= this.getDisplayRating();
  }
}
