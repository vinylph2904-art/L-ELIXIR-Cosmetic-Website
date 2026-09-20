import { Injectable } from '@angular/core';
import { Review } from '../data/review.model';
import { Order } from '../data/order.model';
import { ProductService } from './product.service';
import seedReviews from '../data/mock-data/review.json';

/**
 * Review Service - Quản lý đánh giá sản phẩm
 * Lưu trữ dữ liệu trong localStorage key 'lelixir_reviews'
 */
@Injectable({
  providedIn: 'root'
})
export class ReviewService {
  private readonly STORAGE_KEY = 'lelixir_reviews';

  /** Danh sách từ cấm tiếng Việt */
  private readonly BLACKLISTED_WORDS_VN = [
    'xấu', 'tệ', 'lừa', 'giả', 'khủng', 'đểu', 'dám', 'vô duyên',
    'nhục nhã', 'dâm ô', 'tục tĩu', 'chửi rủa', 'kỳ thị', 'phân biệt'
  ];

  /** Danh sách từ cấm tiếng Anh */
  private readonly BLACKLISTED_WORDS_EN = [
    'scam', 'fake', 'fraud', 'shit', 'damn', 'suck', 'crap', 'bullshit',
    'asshole', 'stupid', 'idiot', 'racist', 'sexist', 'discrimination'
  ];

  constructor(private productService: ProductService) {
    this.seedMockReviews();
  }

  private seedMockReviews(): void {
    const existingReviews = this.getAllReviews();
    const mergedReviews = this.mergeSeedReviews(existingReviews);

    const hasChanged = mergedReviews.length !== existingReviews.length ||
      mergedReviews.some((review, index) => review.reviewId !== existingReviews[index]?.reviewId);

    if (hasChanged) {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(mergedReviews));
    }

    this.syncProductStatsFromReviews(mergedReviews);
  }

  private getSeedReviews(): Review[] {
    return seedReviews as Review[];
  }

  private mergeSeedReviews(existingReviews: Review[]): Review[] {
    const reviews = [...existingReviews];
    const reviewCountByProduct = new Map<string, number>();

    reviews.forEach(review => {
      const currentCount = reviewCountByProduct.get(review.productId) ?? 0;
      reviewCountByProduct.set(review.productId, currentCount + 1);
    });

    this.getSeedReviews().forEach(seedReview => {
      const currentCount = reviewCountByProduct.get(seedReview.productId) ?? 0;
      if (currentCount < 2) {
        reviews.push(seedReview);
        reviewCountByProduct.set(seedReview.productId, currentCount + 1);
      }
    });

    return reviews;
  }

  private syncProductStatsFromReviews(reviews: Review[]): void {
    const groupedReviews = new Map<string, Review[]>();

    reviews.forEach(review => {
      const existingReviews = groupedReviews.get(review.productId) ?? [];
      existingReviews.push(review);
      groupedReviews.set(review.productId, existingReviews);
    });

    const statsByProductId = new Map<string, { averageRating: number; reviewCount: number }>();

    groupedReviews.forEach((productReviews, productId) => {
      const sum = productReviews.reduce((acc, review) => acc + review.rating, 0);
      const average = productReviews.length > 0 ? Math.round((sum / productReviews.length) * 10) / 10 : 0;

      statsByProductId.set(productId, {
        averageRating: average,
        reviewCount: productReviews.length
      });
    });

    this.productService.syncAllProductStats(statsByProductId);
  }

  /**
   * Lấy tất cả review của một sản phẩm, sắp xếp theo mới nhất
   * @param productId - Mã sản phẩm
   * @returns Mảng review theo thứ tự mới nhất lên đầu
   */
  getByProductId(productId: string): Review[] {
    const reviews = this.getAllReviews();
    return reviews
      .filter(r => r.productId === productId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  /**
   * Kiểm tra user đã review sản phẩm này chưa
   * @param userId - ID người dùng
   * @param productId - Mã sản phẩm
   * @returns Review nếu đã review, null nếu chưa
   */
  getByUserAndProduct(userId: string, productId: string): Review | null {
    const reviews = this.getAllReviews();
    return reviews.find(r => r.userId === userId && r.productId === productId) || null;
  }

  getByUserId(userId: string): Review[] {
    const reviews = this.getAllReviews();
    return reviews.filter(r => r.userId === userId);
  }

  /**
   * Tìm đơn hàng có đủ điều kiện review: status = 'Completed' và chứa sản phẩm
   * QUAN TRỌNG: Hàm này NHẬN orders từ bên ngoài, không tự gọi OrderService
   * @param userId - ID người dùng
   * @param productId - Mã sản phẩm
   * @param orders - Mảng đơn hàng (truyền từ OrderService)
   * @returns orderId nếu tìm thấy, null nếu không
   */
  findEligibleOrderId(userId: string, productId: string, orders: Order[]): string | null {
    const eligibleOrder = orders.find(order => {
      // Kiểm tra user match
      const userMatch = order.userId === userId;
      // Kiểm tra đơn hàng đã hoàn thành
      const isCompleted = order.orderStatus === 'Completed';
      // Kiểm tra có chứa sản phẩm này
      const hasProduct = order.items.some((item: any) => item.productId === productId);

      return userMatch && isCompleted && hasProduct;
    });

    return eligibleOrder ? eligibleOrder.orderId : null;
  }

  /**
   * Kiểm tra xem text có chứa từ cấm không (EF1)
   * Hỗ trợ cả tiếng Việt và tiếng Anh
   * @param text - Text cần kiểm tra
   * @returns true nếu có từ cấm, false nếu không
   */
  containsBlacklistedWord(text: string): boolean {
    const lowerText = text.toLowerCase();

    // Kiểm tra từ cấm tiếng Việt
    for (const word of this.BLACKLISTED_WORDS_VN) {
      if (lowerText.includes(word.toLowerCase())) {
        return true;
      }
    }

    // Kiểm tra từ cấm tiếng Anh
    for (const word of this.BLACKLISTED_WORDS_EN) {
      if (lowerText.includes(word.toLowerCase())) {
        return true;
      }
    }

    return false;
  }

  /**
   * Tạo review mới
   * @param data - Dữ liệu review (không cần reviewId và createdAt)
   * @returns Review đã được lưu
   */
  create(data: Omit<Review, 'reviewId' | 'createdAt'>): Review {
    // Tạo ID duy nhất: REV + timestamp
    const reviewId = 'REV' + Date.now();
    
    // Tạo đối tượng review đầy đủ
    const review: Review = {
      ...data,
      reviewId,
      createdAt: new Date().toISOString()
    };

    // Lấy danh sách review hiện tại
    const reviews = this.getAllReviews();

    // Thêm review mới
    reviews.push(review);

    // Lưu vào localStorage
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(reviews));

    const ratingInfo = this.calcAverageRating(review.productId);
    this.productService.syncProductStats(review.productId, ratingInfo.average, ratingInfo.count);

    return review;
  }

  /**
   * Tính điểm đánh giá trung bình của sản phẩm
   * @param productId - Mã sản phẩm
   * @returns Object chứa average (làm tròn 1 chữ số) và count (số review)
   */
  calcAverageRating(productId: string): { average: number; count: number } {
    const reviews = this.getByProductId(productId);

    if (reviews.length === 0) {
      return { average: 0, count: 0 };
    }

    const sum = reviews.reduce((acc, r) => acc + r.rating, 0);
    const average = sum / reviews.length;

    // Làm tròn 1 chữ số thập phân
    const roundedAverage = Math.round(average * 10) / 10;

    return {
      average: roundedAverage,
      count: reviews.length
    };
  }

  /**
   * Lấy tất cả review từ localStorage
   * @private
   * @returns Mảng Review hoặc mảng rỗng nếu chưa có dữ liệu
   */
  private getAllReviews(): Review[] {
    const data = localStorage.getItem(this.STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  }
}
