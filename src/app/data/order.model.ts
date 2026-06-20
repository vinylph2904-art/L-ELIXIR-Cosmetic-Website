/**
 * Order Model - Mô hình đơn hàng
 * PLACEHOLDER - File này THUỘC Task 1, hiện tại được tạo để UC11 có thể compile
 * Task 1 sẽ cập nhật lại file này với đầy đủ logic
 */

export interface Order {
  /** Mã đơn hàng */
  orderId: string;

  /** ID người dùng (null nếu guest) */
  userId: string | null;

  /** Trạng thái đơn hàng */
  orderStatus: 'Pending' | 'Processing' | 'Shipping' | 'Completed' | 'Cancelled';

  /** Danh sách sản phẩm trong đơn */
  items: OrderItem[];

  /** Tổng tiền */
  totalAmount: number;

  /** Địa chỉ giao hàng */
  deliveryAddress: string;

  /** Phương thức vận chuyển */
  shippingMethod: string;

  /** Phí vận chuyển */
  shippingFee: number;

  /** Ngày tạo (ISO string) */
  createdAt: string;
}

/**
 * Order Item - Item trong đơn hàng
 */
export interface OrderItem {
  /** Mã sản phẩm */
  productId: string;

  /** Tên sản phẩm */
  productName: string;

  /** Số lượng */
  quantity: number;

  /** Giá khi mua */
  priceAtPurchase: number;
}
