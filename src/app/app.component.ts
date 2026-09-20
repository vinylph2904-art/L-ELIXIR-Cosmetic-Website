import { Component, OnInit } from '@angular/core';
import mockOrders from './data/mock-data/orders.mock.json';
import PRODUCTS from './data/mock-data/mock-products.json';
import seedUsers from './data/mock-data/users.json';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  title = "lelixir";

  ngOnInit() {
    this.loadMockDataIfNeeded();
  }

  /**
   * Tải mock orders vào localStorage nếu chưa tồn tại hoặc chưa có dữ liệu mock.
   */
  private loadMockDataIfNeeded() {
    const ordersKey = 'orders';

    try {
      const raw = localStorage.getItem(ordersKey);
      const existingOrders = raw ? JSON.parse(raw) : [];
      const isValidOrdersList = Array.isArray(existingOrders);
      const hasMockOrderData = isValidOrdersList && existingOrders.some((order: any) => /^ORD-(\d+)$/.test(String(order?.orderId || '')));

      if (!isValidOrdersList || existingOrders.length === 0 || !hasMockOrderData) {
        const seededOrders = Array.isArray(mockOrders) ? mockOrders.map((order: any) => this.normalizeMockOrder(order)) : [];
        const mergedOrders = [...seededOrders];
        const existingIds = new Set(mergedOrders.map((order: any) => String(order?.orderId || '').toLowerCase()));

        for (const order of existingOrders) {
          if (!order || !order.orderId) {
            continue;
          }
          const id = String(order.orderId).toLowerCase();
          if (!existingIds.has(id)) {
            mergedOrders.push(order);
            existingIds.add(id);
          }
        }

        localStorage.setItem(ordersKey, JSON.stringify(mergedOrders));
        console.log('✓ Mock orders data loaded into localStorage');
      }
    } catch {
      localStorage.setItem(ordersKey, JSON.stringify(mockOrders));
    }
  }

  private normalizeMockOrder(order: any): any {
    if (!order) {
      return order;
    }

    const normalizedItems = Array.isArray(order.items)
      ? order.items.map((item: any) => {
          const productId = item?.productId || item?.product?.productId;
          const product = item?.product || PRODUCTS.find((p: any) => p.productId === productId) || null;
          const price = Number(item?.priceAtPurchase ?? item?.price ?? product?.price ?? 0);
          return {
            ...item,
            product: product ? { ...product } : {
              productId: productId || 'UNKNOWN',
              name: item?.productName || 'Sản phẩm',
              brand: '',
              categoryName: '',
              description: '',
              ingredients: [],
              images: [],
              volume: '',
              routineStep: '',
              price,
              stockQuantity: 0,
              targetSkinTypes: [],
              targetSkinProblems: [],
              averageRating: 0,
              reviewCount: 0
            },
            quantity: Number(item?.quantity || 1),
            price
          };
        })
      : [];

    const subtotal = Number(order.subtotal ?? order.totalAmount ?? 0);
    const shippingFee = Number(order.shippingFee ?? 0);
    const totalAmount = Number(order.totalAmount ?? order.total ?? subtotal + shippingFee);

    const userInfo = this.resolveUserInfo(order);

    return {
      ...order,
      orderId: String(order.orderId || '').trim(),
      items: normalizedItems,
      shippingInfo: {
        fullName: order?.guestName || order?.shippingInfo?.fullName || userInfo.fullName || '',
        phone: order?.guestPhone || order?.shippingInfo?.phone || userInfo.phone || '',
        email: order?.guestEmail || order?.shippingInfo?.email || userInfo.email || '',
        city: order?.shippingInfo?.city || '',
        district: order?.shippingInfo?.district || '',
        address: order?.deliveryAddress || order?.shippingInfo?.address || '',
        note: order?.shippingInfo?.note
      },
      shippingMethod: String(order.shippingMethod || '').toLowerCase() === 'express' ? 'express' : 'standard',
      paymentMethod: String(order.paymentMethod || '').toLowerCase().includes('bank') ? 'bank_transfer' : String(order.paymentMethod || '').toLowerCase().includes('wallet') ? 'e_wallet' : String(order.paymentMethod || '').toLowerCase().includes('credit') ? 'credit_card' : 'cod',
      subtotal: Number.isFinite(subtotal) ? subtotal : normalizedItems.reduce((sum: number, item: any) => sum + item.price * item.quantity, 0),
      shippingFee: Number.isFinite(shippingFee) ? shippingFee : 0,
      discount: Number(order.discount ?? 0),
      total: Number(order.total ?? totalAmount),
      totalAmount: Number.isFinite(totalAmount) ? totalAmount : subtotal + shippingFee,
      status: String(order.orderStatus || '').toLowerCase().includes('cancel') ? 'cancelled' : String(order.orderStatus || '').toLowerCase().includes('deliver') || String(order.orderStatus || '').toLowerCase().includes('complete') ? 'delivered' : String(order.orderStatus || '').toLowerCase().includes('ship') ? 'shipped' : String(order.orderStatus || '').toLowerCase().includes('process') ? 'processing' : 'pending_payment',
      orderStatus: String(order.orderStatus || '').toLowerCase().includes('cancel') ? 'Cancelled' : String(order.orderStatus || '').toLowerCase().includes('deliver') || String(order.orderStatus || '').toLowerCase().includes('complete') ? 'Completed' : String(order.orderStatus || '').toLowerCase().includes('ship') ? 'Shipping' : String(order.orderStatus || '').toLowerCase().includes('process') ? 'Processing' : 'Pending',
      createdAt: order.createdAt ? new Date(order.createdAt) : new Date(),
      updatedAt: order.updatedAt ? new Date(order.updatedAt) : new Date()
    };
  }

  private resolveUserInfo(order: any): { fullName: string; phone: string; email: string } {
    const userId = String(order?.userId || '').trim();
    if (!userId) {
      return { fullName: '', phone: '', email: '' };
    }

    try {
      const raw = localStorage.getItem('users');
      const users = raw ? JSON.parse(raw) : seedUsers;
      const matchedUser = Array.isArray(users)
        ? users.find((user: any) => String(user?.userId || '').trim() === userId)
        : null;

      return {
        fullName: matchedUser?.fullName || '',
        phone: matchedUser?.phoneNumber || '',
        email: matchedUser?.email || ''
      };
    } catch {
      return { fullName: '', phone: '', email: '' };
    }
  }
}

