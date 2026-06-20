// Model cho UC11 - Đánh giá & Bình luận sản phẩm
// Dữ liệu review lưu trong localStorage và sử dụng để hiển thị đánh giá/bình luận sản phẩm.
export interface Review {
  // Định danh duy nhất của review
  id: string;

  // Id sản phẩm được đánh giá
  productId: string;

  // Id người dùng viết đánh giá
  userId: string;

  // Tên hiển thị người đánh giá, để không cần join với User mỗi lần hiển thị
  userName: string;

  // Số sao đánh giá, từ 1 đến 5
  rating: number;

  // Nội dung nhận xét của người dùng
  comment: string;

  // Thời gian tạo review, dạng ISO string
  createdAt: string;
}
