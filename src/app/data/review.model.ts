/**
 * Review Model - Mô hình đánh giá sản phẩm
 * Dùng cho UC11: Đánh giá & Bình luận
 * Dữ liệu lưu trong localStorage key 'lelixir_reviews'
 */

export interface Review {
  /** Mã review, format: REV + timestamp */
  reviewId: string;

  /** Mã sản phẩm được đánh giá */
  productId: string;

  /** ID người dùng đánh giá */
  userId: string;

  /** Tên người dùng (lưu offline để tránh join User khi render) */
  userName: string;

  /** Mã đơn hàng - dùng để validate "đã mua và đã nhận hàng" */
  orderId: string;

  /** Tiêu đề đánh giá */
  title: string;

  /** Điểm đánh giá từ 1 đến 5 */
  rating: number;

  /** Bình luận chi tiết */
  comment: string;

  /** Ngày tạo review (ISO string) */
  createdAt: string;
}
