import { ReviewService } from './review.service';

describe('ReviewService', () => {
  let service: ReviewService;

  beforeEach(() => {
    localStorage.clear();
    service = new ReviewService();
  });

  it('should save a review and update average rating for a product', () => {
    const review = service.create({
      productId: 'SP01',
      userId: 'user_test',
      userName: 'Test User',
      orderId: 'ORD999',
      title: 'Sản phẩm rất tốt',
      rating: 5,
      comment: 'Da mình thấy khỏe hơn sau khi dùng.',
      images: []
    });

    expect(review.reviewId).toContain('REV');

    const stats = service.calcAverageRating('SP01');
    expect(stats.average).toBe(5);
    expect(stats.count).toBe(1);
  });
});
