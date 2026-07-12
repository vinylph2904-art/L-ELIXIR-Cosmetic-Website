# Báo cáo tổng kết đồ án — Website thương mại điện tử

## Chương 5 – Tổng kết đồ án

### 5.1. Kết quả đạt được

- Đã hoàn thiện một website thương mại điện tử bằng Angular với các chức năng cơ bản của một hệ thống bán hàng trực tuyến, bao gồm trang chủ, danh mục sản phẩm, chi tiết sản phẩm, giỏ hàng, đăng nhập/đăng ký, đánh giá sản phẩm, theo dõi đơn hàng, thanh toán, hồ sơ người dùng và trang hỗ trợ.
- Hoàn thiện được phần giao diện responsive, đặc biệt là trên thiết bị di động. Các thành phần như product-card, collection, product-detail, navbar và profile đã được điều chỉnh để bố cục rõ ràng, dễ nhìn và phù hợp với nhiều kích thước màn hình.
- Tái cấu trúc dự án rõ ràng hơn bằng cách chuyển dữ liệu mock sang thư mục mock-data, sắp xếp lại service và component, đồng thời thiết lập routing và guard để quản lý luồng truy cập người dùng tốt hơn.
- Khắc phục được các lỗi cấu trúc ban đầu của dự án Angular như lỗi import module, khai báo component trong AppModule và việc sử dụng FormsModule, ReactiveFormsModule, HttpClientModule trong template, giúp dự án có thể build thành công.
- Bổ sung các tính năng tăng tính tương tác cho người dùng như beauty assistant, toast thông báo, review form và các trang khảo sát, đề xuất sản phẩm, nhằm làm website gần gũi và hấp dẫn hơn.

### 5.2. Hạn chế

- Dữ liệu hiện tại vẫn chủ yếu là mock data, chưa kết nối với backend thật nên các chức năng như quản lý sản phẩm, đơn hàng và người dùng chưa thể vận hành đầy đủ như một hệ thống thương mại điện tử thực tế.
- Một số tính năng như thanh toán trực tuyến, quản lý đơn hàng chuyên nghiệp và gợi ý sản phẩm thông minh vẫn còn ở mức demo hoặc prototype.
- Giao diện đã được cải thiện nhưng vẫn cần kiểm thử thêm trên nhiều thiết bị và độ phân giải khác nhau để đảm bảo tính nhất quán và độ ổn định.
- Chưa có hệ thống test tự động cho giao diện và logic nghiệp vụ, nên nguy cơ lỗi tăng lên khi mở rộng dự án hoặc sửa đổi code sau này.
- Việc quản lý font, asset và cấu hình build vẫn còn một số điểm cần tối ưu hơn để phù hợp với môi trường triển khai và CI/CD.

### 5.3. Hướng phát triển

- Kết nối frontend với backend/API thực tế để thay thế dữ liệu mock, hỗ trợ các chức năng đăng nhập, quản lý sản phẩm, giỏ hàng, đơn hàng và người dùng một cách hoàn chỉnh.
- Mở rộng các tính năng thương mại điện tử như thanh toán online, mã giảm giá, ưu đãi, quản trị viên quản lý kho hàng và đơn hàng.
- Nâng cao trải nghiệm người dùng bằng cách thêm tìm kiếm nâng cao, lọc sản phẩm theo nhiều tiêu chí, đề xuất sản phẩm thông minh và hỗ trợ khách hàng trực tuyến.
- Xây dựng bộ test tự động cho giao diện và service bằng Playwright, Cypress hoặc Jest để tăng độ tin cậy khi phát triển tiếp.
- Tối ưu hóa cấu trúc dự án, tích hợp CI/CD, chuẩn hóa quản lý asset/font và triển khai lên môi trường thực tế để website có thể dùng lâu dài và dễ bảo trì hơn.
