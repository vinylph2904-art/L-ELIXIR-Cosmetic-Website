# 🚀 L'ELIXIR - FRONTEND DEVELOPMENT GUIDELINE & CONTEXT

## 1. TỔNG QUAN DỰ ÁN VÀ CÔNG NGHỆ (PROJECT OVERVIEW & TECH STACK)
- **Tên dự án:** L'Elixir Cosmetics E-commerce.
- **Framework chính:** Angular (TypeScript, HTML, SCSS).
- **Kiến trúc (Architecture):** Component-Based Architecture, Single Page Application (SPA).
- **⚠️ RÀO CẢN KỸ THUẬT QUAN TRỌNG (STRICT RULES):** 
  - KHÔNG sử dụng Backend thật (Node.js/MongoDB) trong giai đoạn prototype này.
  - TẤT CẢ các thao tác lưu trữ dữ liệu (CRUD) phải được thực hiện thông qua `localStorage` và `sessionStorage` của trình duyệt để mô phỏng Database.
  - Dữ liệu sản phẩm gốc được đọc từ file `src/assets/data/products.json`.
  - KHÔNG sử dụng AI/Machine Learning thật. Chức năng gợi ý sản phẩm sử dụng thuật toán **Rule-based Recommendation** (Tập luật IF/ELSE).

---

## 2. CẤU TRÚC THƯ MỤC (DIRECTORY STRUCTURE)
Mọi file code được tạo ra phải nằm đúng vị trí trong cấu trúc sau:
`src/app/`
 ├── `core/` (Chứa Guards: auth.guard.ts, guest.guard.ts và Interceptors)
 ├── `shared/` (UI Components dùng chung: Header, Footer, ProductCard, StarRating, BeautyAssistantPopup)
 ├── `models/` (TypeScript Interfaces ánh xạ từ ERD/Class Diagram)
 ├── `services/` (Xử lý nghiệp vụ & thao tác LocalStorage)
 └── `features/` (Giao diện theo Sitemap: home, auth, products, skin-analysis, shopping, account)

---

## 3. MÔ HÌNH DỮ LIỆU CỐT LÕI (CORE DATA MODELS)
AI khi khởi tạo các file trong `src/app/models/` phải tuân thủ nghiêm ngặt các thuộc tính sau (dựa trên Class Diagram):
- `User`: id, email, passwordHash, fullName, phoneNumber, role.
- `Address`: id, userId, receiverName, receiverPhone, addressDetails, isDefault.
- `Product`: id, name, brand, price, description, categoryName, stockQuantity, capacity, ingredients, images[], targetSkinTypes[], targetSkinProblems[], averageRating, reviewCount.
- `Cart` & `CartItem`: Quản lý giỏ hàng (userId có thể rỗng cho Khách vãng lai).
- `Order` & `OrderItem`: Quản lý đơn (guestName, guestPhone, guestEmail, deliveryAddress, orderStatus, totalAmount, createdAt).
- `Payment`: paymentId, orderId, paymentMethod, paymentStatus, transactionId.
- `Skin_Profile`: id, userId, answers[], detectedSkinType, detectedSkinProblems, updatedAt.
- `Review`: id, orderId, userId, productId, rating, comment, createdAt.

---

## 4. HƯỚNG DẪN TRIỂN KHAI THEO USE CASE (USE CASE IMPLEMENTATION GUIDE)
Khi AI được yêu cầu code một Use Case (UC) cụ thể, hãy tuân thủ các luồng (Flows) và Bẫy lỗi (Alternative Flows - AF) sau:

### UC01: Xác thực (Auth)
- **Component:** `features/auth/login` và `features/auth/register`.
- **Logic (`auth.service.ts`):** 
  - Đăng ký: Kiểm tra email đã tồn tại trong `localStorage` chưa (AF2). Nếu chưa, lưu Object User vào mảng users trong `localStorage`.
  - Đăng nhập: Đối chiếu email/mật khẩu. Thành công thì lưu thông tin User đang đăng nhập vào `sessionStorage` hoặc lưu một token giả. Sai thì báo lỗi "Tài khoản hoặc mật khẩu không chính xác" (AF3).

### UC02 & UC03: Khám phá & Chi tiết sản phẩm
- **Component:** `features/products/product-list` và `product-detail`.
- **Logic (`product.service.ts`):** Load dữ liệu từ `assets/data/products.json`.
  - Lọc (UC02): Lọc theo danh mục, loại da, vấn đề da. Nếu kết quả rỗng, hiển thị component rỗng "Không tìm thấy sản phẩm nào phù hợp" (AF1).
  - Chi tiết (UC03): Hiển thị hình ảnh album, capacity, ingredients. Kết xuất danh sách đánh giá. Có nút "Thêm vào giỏ hàng".

### UC04: Quản lý giỏ hàng
- **Component:** `features/shopping/cart`.
- **Logic (`cart.service.ts`):** 
  - Khách vãng lai và Thành viên đều dùng chung logic lưu mảng CartItems vào `localStorage`.
  - Bẫy lỗi (AF2): Khi bấm nút (-) giảm số lượng xuống 0, PHẢI hiện popup xác nhận xóa.
  - Bẫy lỗi (AF3): Nhập số âm bằng bàn phím vào ô input thì chặn lại, set value về 1.

### UC05 & UC06: Khảo sát da & Gợi ý sản phẩm (Rule-based)
- **Component:** `features/skin-analysis/survey-form` và `result`.
- **Logic (`recommendation.service.ts`):** 
  - Khi user submit form, lấy dữ liệu lưu vào `Skin_Profile`.
  - **Thuật toán cốt lõi:** Lấy `detectedSkinType` và `detectedSkinProblems` đối chiếu với mảng `targetSkinTypes` và `targetSkinProblems` của mảng Product. 
  - Render ra HTML danh sách sản phẩm và MỘT ĐOẠN TEXT giải thích lý do phù hợp (Ví dụ: "Sản phẩm này có chứa Salicylic Acid phù hợp cho da mụn của bạn...").

### UC07: Beauty Assistant (Trợ lý ảo)
- **Component:** `shared/components/beauty-assistant-popup`.
- **Logic:** Đây là một Popup hiển thị ở mọi trang. Sử dụng cây quyết định (Decision Tree) dạng tĩnh (IF/ELSE) với các buttons. Lưu lịch sử chat tạm thời vào `sessionStorage` để nếu user đóng popup mở lại không bị mất (AF1).

### UC09 & UC10: Guest Checkout & Member Checkout
- **Component:** `features/shopping/checkout-guest` và `checkout-member`.
- **Logic (`order.service.ts` & `payment.service.ts`):**
  - **UC09 (Guest):** Hiển thị form điền Họ tên, SĐT, Email, Địa chỉ. Không bắt đăng nhập.
  - **UC10 (Member):** Tự động điền (Auto-fill) data từ `localStorage` profile user. Cho phép đổi địa chỉ mặc định.
  - **Giả lập thanh toán (FR09):** Chuyển hướng sang component `payment-sandbox`, giả lập loading 3 giây, sau đó lưu Order vào `localStorage`, clear Giỏ hàng và chuyển sang trang Success.

### UC11: Đánh giá & Bình luận (Review)
- **Component:** 
  - Viết đánh giá: Popup nằm trong `features/account/order-history/`.
  - Đọc đánh giá: Component nằm trong `features/products/product-detail/`.
- **Logic (`review.service.ts`):** 
  - Điều kiện: Đơn hàng phải ở status "Completed" mới hiện nút Đánh giá.
  - Bẫy lỗi: Dùng mảng từ cấm (Blacklist words) để chặn comment văng tục (EF1).
  - Tự động tính toán lại `averageRating` của Product sau khi submit review thành công.

---
## 5. CSS/SCSS CODING STANDARDS
- Sử dụng biến màu sắc (Variables) được khai báo sẵn trong `src/assets/styles/_variables.scss`.
- Thiết kế phải hoàn toàn Responsive (Mobile-first hoặc Desktop-first) sử dụng Flexbox/Grid.
- Dùng thẻ BEM (Block Element Modifier) naming convention cho class name.