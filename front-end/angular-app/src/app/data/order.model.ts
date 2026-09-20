import { Product } from './product.model';

export interface ShippingInfo {
  fullName: string;
  phone: string;
  email: string;
  city: string;
  district: string;
  address: string;
  note?: string;
}

export interface OrderItem {
  product: Product;
  quantity: number;
  price: number;
}

export type OrderStatus = 'pending_payment' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
export type PaymentMethod = 'cod' | 'bank_transfer' | 'e_wallet' | 'credit_card';
export type ShippingMethod = 'standard' | 'express';

export interface Order {
  orderId: string;
  guestId?: string;
  items: OrderItem[];
  shippingInfo: ShippingInfo;
  shippingMethod: ShippingMethod;
  paymentMethod: PaymentMethod;
  subtotal: number;
  shippingFee: number;
  discount: number;
  total: number;
  status: OrderStatus;
  createdAt: Date;
  updatedAt: Date;
  paymentDetails?: {
    transactionId?: string;
    paidAt?: Date;
  };
  userId?: string | null;
  guestName?: string;
  guestPhone?: string; // 👈 Đã bổ sung field này để sửa triệt để Lỗi TS2339
  guestEmail?: string;
  totalAmount?: number;
  orderStatus: 'Pending' | 'Processing' | 'Shipping' | 'Completed' | 'Cancelled';
  createdAtStr?: string;
  cancelReason?: string;
  cancelStatus?: 'none' | 'pending' | 'approved' | 'rejected';
  cancelRejectReason?: string;
  cancelRequestedAt?: string;
}

export interface PaymentResponse {
  success: boolean;
  transactionId?: string;
  message: string;
  redirectUrl?: string;
}