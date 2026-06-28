import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Product } from '../data/product.model';
import { AuthService } from './auth.service';

/**
 * CartService - Quản lý toàn bộ logic giỏ hàng (UC04).
 * Dữ liệu được lưu trong localStorage theo key riêng cho từng user:
 * - user đã đăng nhập: 'lelixir_cart_<userId>'
 * - khách vãng lai: 'lelixir_cart_guest'
 *
 * Điều này giúp giỏ hàng của các tài khoản không bị chồng lên nhau khi đổi tài khoản.
 */
@Injectable({ providedIn: 'root' })
export class CartService {
  private readonly GUEST_STORAGE_KEY = 'lelixir_cart_guest';
  private currentUserId: string | null = null;
  private currentStorageKey = this.GUEST_STORAGE_KEY;

  private cartItems: Product[] = [];

  // BehaviorSubject để các component khác (navbar, cart icon...) subscribe
  // và tự động cập nhật số lượng hiển thị mà không cần gọi lại API/service thủ công.
  private cartCountSubject = new BehaviorSubject<number>(0);
  cartCount$ = this.cartCountSubject.asObservable();

  constructor(private authService: AuthService) {
    this.authService.currentUser$.subscribe(user => {
      this.switchContext(user?.userId ?? null);
    });

    this.switchContext(this.authService.getCurrentUser()?.userId ?? null);
  }

  /** Tổng số lượng sản phẩm (cộng dồn quantity), dùng hiển thị badge trên icon giỏ hàng */
  private getTotalCount(): number {
    return this.cartItems.reduce((sum, item) => sum + (item.quantity || 1), 0);
  }

  /**
   * Lấy key lưu giỏ hàng tương ứng với trạng thái đăng nhập hiện tại.
   * - Nếu có userId thì dùng key theo user đó.
   * - Nếu không có userId thì dùng guest key cố định.
   */
  private getStorageKeyForUser(userId: string | null): string {
    return userId ? `lelixir_cart_${userId}` : this.GUEST_STORAGE_KEY;
  }

  /**
   * Chuyển sang context giỏ hàng mới.
   * Khi đổi tài khoản hoặc logout, dữ liệu giỏ hàng hiện tại sẽ được lưu vào key cũ
   * trước khi load key mới, để không làm mất dữ liệu của user/guest trước đó.
   */
  private switchContext(nextUserId: string | null): void {
    const nextStorageKey = this.getStorageKeyForUser(nextUserId);
    const shouldSwitch = this.currentStorageKey !== nextStorageKey;

    if (shouldSwitch) {
      this.persistCart(this.currentStorageKey);
      this.currentUserId = nextUserId;
      this.currentStorageKey = nextStorageKey;
      this.loadCart();
      return;
    }

    this.currentUserId = nextUserId;
    this.currentStorageKey = nextStorageKey;
    this.loadCart();
  }

  /**
   * Lưu giỏ hàng hiện tại vào localStorage và phát tín hiệu cập nhật count.
   * Mỗi lần lưu đều dùng key đang active (user hoặc guest).
   */
  private saveCart(): void {
    this.persistCart(this.currentStorageKey);
    this.cartCountSubject.next(this.getTotalCount());
  }

  /**
   * Ghi danh sách sản phẩm hiện tại vào key được truyền vào.
   * Phương thức này dùng cho việc lưu ngay khi đổi context và khi thao tác giỏ hàng.
   */
  private persistCart(storageKey: string): void {
    try {
      localStorage.setItem(storageKey, JSON.stringify(this.cartItems));
    } catch {
      // Dữ liệu localStorage bị hỏng/không hợp lệ -> bỏ qua để tránh crash app
    }
  }

  /**
   * Đọc giỏ hàng từ key đang active (theo user hoặc guest).
   * Khi logout, service sẽ tự đổi sang guest key và load giỏ hàng guest.
   */
  private loadCart(): void {
    try {
      const raw = localStorage.getItem(this.currentStorageKey);
      this.cartItems = raw ? (JSON.parse(raw) as Product[]) : [];
    } catch {
      // Dữ liệu localStorage bị hỏng/không hợp lệ -> reset về rỗng để tránh crash app
      this.cartItems = [];
    }
    this.cartCountSubject.next(this.getTotalCount());
  }

  /** Trả về bản copy của giỏ hàng (tránh component sửa trực tiếp mảng gốc) */
  getCart(): Product[] {
    return [...this.cartItems];
  }

  /** Kiểm tra giỏ hàng có trống không - dùng cho AF1 (hiển thị "Giỏ hàng đang trống") */
  isEmpty(): boolean {
    return this.cartItems.length === 0;
  }

  /**
   * Thêm sản phẩm vào giỏ hàng (Luồng 4.1 - UC04).
   * Nếu sản phẩm đã tồn tại -> cộng dồn số lượng.
   * Nếu chưa có -> tạo mới với quantity mặc định.
   */
  addToCart(product: Product): void {
    const existing = this.cartItems.find(item => item.productId === product.productId);
    if (existing) {
      existing.quantity = (existing.quantity || 1) + (product.quantity || 1);
    } else {
      this.cartItems.push({ ...product, quantity: product.quantity || 1 });
    }
    this.saveCart();
  }

  /**
   * Cập nhật số lượng sản phẩm (Luồng 4.2 - UC04).
   * AF3: Chặn ngay tại service - nếu quantity không hợp lệ (NaN, âm) thì ép về giá trị an toàn.
   * Nếu quantity <= 0 -> tự động xóa sản phẩm khỏi giỏ (việc xác nhận xóa do Component xử lý
   * TRƯỚC khi gọi hàm này, service chỉ đảm bảo dữ liệu cuối cùng luôn hợp lệ).
   */
  updateQuantity(productId: string, quantity: number): void {
    const safeQuantity = Number.isFinite(quantity) ? Math.floor(quantity) : 1;

    if (safeQuantity <= 0) {
      this.removeFromCart(productId);
      return;
    }

    this.cartItems = this.cartItems.map(item =>
      item.productId === productId ? { ...item, quantity: safeQuantity } : item
    );
    this.saveCart();
  }

  /** Xóa một sản phẩm khỏi giỏ hàng */
  removeFromCart(productId: string): void {
    this.cartItems = this.cartItems.filter(item => item.productId !== productId);
    this.saveCart();
  }

  /**
   * Xóa toàn bộ giỏ hàng - được gọi sau khi Thành viên 4 (Checkout) xác nhận
   * thanh toán thành công, theo đúng lưu ý đồng bộ trong Yêu_cầu.pdf:
   * "Thành viên 4 gọi hàm của Thành viên 3 để XÓA TRỐNG GIỎ HÀNG".
   */
  clearCart(): void {
    this.cartItems = [];
    this.saveCart();
  }

  /** Tính tổng tiền giỏ hàng - dùng cho cả Cart page và Checkout page (Thành viên 4) */
  getTotalPrice(): number {
    return this.cartItems.reduce((sum, item) => sum + item.price * (item.quantity || 1), 0);
  }

  /** Lấy số lượng hiện tại của 1 sản phẩm trong giỏ (trả 0 nếu chưa có) */
  getItemQuantity(productId: string): number {
    const item = this.cartItems.find(i => i.productId === productId);
    return item?.quantity || 0;
  }
}