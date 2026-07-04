import { HttpClient } from '@angular/common/http';
import { OrderService } from './order.service';
import { AuthService } from './auth.service';

describe('OrderService', () => {
  let authService: AuthService;
  let orderService: OrderService;

  beforeEach(() => {
    localStorage.clear();
    sessionStorage.clear();
    authService = new AuthService();
    orderService = new OrderService({} as HttpClient, authService);
  });

  it('should associate stored orders to the logged-in user by email when userId is missing', () => {
    const user = {
      userId: 'U100',
      fullName: 'Nguyễn Văn Test',
      phoneNumber: '0900000000',
      email: 'test@example.com',
      token: 'token'
    };

    sessionStorage.setItem('currentUser', JSON.stringify(user));

    const storedOrder = {
      orderId: 'ORD-0001',
      items: [],
      shippingInfo: {
        fullName: user.fullName,
        phone: user.phoneNumber,
        email: user.email,
        city: 'HCM',
        district: 'Q1',
        address: '123 Test'
      },
      shippingMethod: 'standard',
      paymentMethod: 'cod',
      subtotal: 100000,
      shippingFee: 30000,
      discount: 0,
      total: 130000,
      status: 'pending_payment',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      orderStatus: 'Pending'
    };

    localStorage.setItem('orders', JSON.stringify([storedOrder]));

    const orders = orderService.getByUserId(user.userId);

    expect(orders.length).toBe(1);
    expect(orders[0].userId).toBe(user.userId);
  });

  it('should persist a newly created order for the current logged-in user', (done) => {
    const user = {
      userId: 'U200',
      fullName: 'Nguyễn Văn Test 2',
      phoneNumber: '0900000001',
      email: 'test2@example.com',
      token: 'token'
    };

    sessionStorage.setItem('currentUser', JSON.stringify(user));

    orderService.createGuestOrder([
      { productId: 'SP01', name: 'Serum', price: 100000, quantity: 1 } as any
    ], {
      fullName: user.fullName,
      phone: user.phoneNumber,
      email: user.email,
      city: 'HCM',
      district: 'Q1',
      address: '123 Test'
    }, 'standard', 'cod').subscribe({
      next: () => {
        const orders = orderService.getByUserId(user.userId);
        expect(orders.length).toBe(1);
        expect(orders[0].userId).toBe(user.userId);
        done();
      },
      error: done.fail
    });
  });
});
