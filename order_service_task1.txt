import { Injectable } from '@angular/core';
import { Order } from '../data/order.model';

const ORDERS_KEY = 'orders';

@Injectable({ providedIn: 'root' })
export class OrderService {

  private getOrders(): Order[] {
    const raw = localStorage.getItem(ORDERS_KEY);
    return raw ? JSON.parse(raw) : [];
  }

  private saveOrders(orders: Order[]): void {
    localStorage.setItem(ORDERS_KEY, JSON.stringify(orders));
  }

  getAll(): Order[] {
    return this.getOrders();
  }

  getByUserId(userId: string): Order[] {
    return this.getOrders().filter(o => o.userId === userId);
  }

  getByOrderId(orderId: string): Order | null {
    return this.getOrders().find(o => o.orderId.toLowerCase() === orderId.toLowerCase()) || null;
  }

  create(order: Omit<Order, 'orderId' | 'createdAt'>): Order {
    const orders = this.getOrders();
    const newOrder: Order = {
      ...order,
      orderId: 'ORD' + Date.now().toString(),
      createdAt: new Date().toISOString()
    };
    orders.push(newOrder);
    this.saveOrders(orders);
    return newOrder;
  }

  updateStatus(orderId: string, status: Order['orderStatus']): boolean {
    const orders = this.getOrders();
    const idx = orders.findIndex(o => o.orderId === orderId);
    if (idx === -1) return false;
    orders[idx].orderStatus = status;
    this.saveOrders(orders);
    return true;
  }

  delete(orderId: string): boolean {
    const orders = this.getOrders();
    const filtered = orders.filter(o => o.orderId !== orderId);
    if (filtered.length === orders.length) return false;
    this.saveOrders(filtered);
    return true;
  }

  /** Trả về thứ tự bước (0-4) tương ứng trạng thái, dùng để vẽ tracking steps */
  getStepIndex(status: Order['orderStatus']): number {
    const map: Record<Order['orderStatus'], number> = {
      'Pending': 0,
      'Processing': 1,
      'Shipping': 3,
      'Completed': 4,
      'Cancelled': -1
    };
    return map[status];
  }
}
