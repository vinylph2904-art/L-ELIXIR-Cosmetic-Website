export type OrderStatus = 'Pending' | 'Processing' | 'Shipping' | 'Completed' | 'Cancelled';

export interface Order {
  orderId: string;
  userId: string | null;
  guestName?: string;
  guestEmail?: string;
  totalAmount: number;
  orderStatus: OrderStatus;
  createdAt?: string;
}
