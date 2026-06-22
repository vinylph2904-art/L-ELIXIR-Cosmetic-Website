import { Injectable } from '@angular/core';

export interface User {
  userId: string;
  email: string;
  password: string;
  fullName: string;
  phoneNumber: string;
  role: 'customer';
  dateOfBirth?: string;
  gender?: 'Nam' | 'Nữ' | 'Khác';
  avatarUrl?: string;
  createdAt?: string;
}

export interface Address {
  addressId: string;
  userId: string;
  fullAddress: string;
  isDefault: boolean;
}

export interface Order {
  orderId: string;
  userId: string | null;
  guestName?: string;
  guestEmail?: string;
  totalAmount: number;
  orderStatus: 'Pending' | 'Processing' | 'Shipping' | 'Completed' | 'Cancelled';
  createdAt?: string;
  shippingFullName: string;
  shippingPhone: string;
  shippingAddress: string;
}

@Injectable({ providedIn: 'root' })
export class CheckoutService {
  private readonly ADDRESSES_KEY = 'lelixir_addresses';
  private readonly ORDERS_KEY = 'lelixir_orders';
  private readonly CURRENT_USER_KEY = 'currentUser';

  /**
   * Lấy thông tin user đang đăng nhập từ sessionStorage.
   */
  getCurrentUser(): User | null {
    const raw = sessionStorage.getItem(this.CURRENT_USER_KEY);
    if (!raw) {
      return null;
    }

    try {
      return JSON.parse(raw) as User;
    } catch {
      return null;
    }
  }

  /**
   * Lấy địa chỉ mặc định của user dựa trên userId.
   */
  getDefaultAddress(userId: string): Address | null {
    const addresses = this.getAllAddressesByUser(userId);
    return addresses.find(address => address.isDefault) ?? null;
  }

  /**
   * Lấy tất cả địa chỉ đã lưu cho một user cụ thể.
   */
  getAllAddressesByUser(userId: string): Address[] {
    const raw = localStorage.getItem(this.ADDRESSES_KEY);
    if (!raw) {
      return [];
    }

    try {
      const addresses = JSON.parse(raw) as Address[];
      return addresses.filter(address => address.userId === userId);
    } catch {
      return [];
    }
  }

  /**
   * Thêm mới hoặc cập nhật địa chỉ người dùng trong localStorage.
   * Nếu là địa chỉ mặc định, hủy mặc định của các địa chỉ khác cùng user.
   */
  addOrUpdateAddress(address: Address): void {
    const existingAddresses = this.readAddresses();
    const index = existingAddresses.findIndex(item => item.addressId === address.addressId);

    if (address.isDefault) {
      existingAddresses.forEach(item => {
        if (item.userId === address.userId) {
          item.isDefault = false;
        }
      });
    }

    if (index >= 0) {
      existingAddresses[index] = address;
    } else {
      existingAddresses.push(address);
    }

    localStorage.setItem(this.ADDRESSES_KEY, JSON.stringify(existingAddresses));
  }

  /**
   * Tạo đơn hàng mới và lưu vào localStorage.
   * Thực hiện khởi tạo orderId nếu chưa có và ghi trạng thái mặc định.
   */
  createOrder(orderData: Partial<Order>): Order {
    const orders = this.readOrders();
    const orderId = orderData.orderId ?? this.generateId('ORD');

    const order: Order = {
      orderId,
      userId: orderData.userId ?? null,
      guestName: orderData.guestName,
      guestEmail: orderData.guestEmail,
      totalAmount: orderData.totalAmount ?? 0,
      orderStatus: orderData.orderStatus ?? 'Pending',
      createdAt: orderData.createdAt ?? new Date().toISOString(),
      shippingFullName: orderData.shippingFullName ?? '',
      shippingPhone: orderData.shippingPhone ?? '',
      shippingAddress: orderData.shippingAddress ?? ''
    };

    orders.push(order);
    localStorage.setItem(this.ORDERS_KEY, JSON.stringify(orders));
    return order;
  }

  /**
   * Đọc toàn bộ danh sách địa chỉ từ localStorage.
   */
  private readAddresses(): Address[] {
    const raw = localStorage.getItem(this.ADDRESSES_KEY);
    if (!raw) {
      return [];
    }

    try {
      return JSON.parse(raw) as Address[];
    } catch {
      return [];
    }
  }

  /**
   * Đọc danh sách đơn hàng đã lưu từ localStorage.
   */
  private readOrders(): Order[] {
    const raw = localStorage.getItem(this.ORDERS_KEY);
    if (!raw) {
      return [];
    }

    try {
      return JSON.parse(raw) as Order[];
    } catch {
      return [];
    }
  }

  private generateId(prefix: string): string {
    if (window?.crypto?.randomUUID) {
      return `${prefix}-${window.crypto.randomUUID()}`;
    }

    return `${prefix}-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
  }
}
