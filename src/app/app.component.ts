import { Component, OnInit } from '@angular/core';
import mockOrders from './data/mock/orders.mock.json';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  title = "lelixir-angular";

  ngOnInit() {
    // Load mock data vào localStorage khi app khởi động (nếu chưa có)
    this.loadMockDataIfNeeded();
  }

  /**
   * Tải mock orders vào localStorage nếu chưa tồn tại
   * Dùng để test UC11 (Đánh giá & Bình luận)
   */
  private loadMockDataIfNeeded() {
    const ordersKey = 'orders';

    // Kiểm tra localStorage đã có key 'orders' chưa
    if (!localStorage.getItem(ordersKey)) {
      // Nếu chưa có, import mock data từ orders.mock.json và lưu vào localStorage
      localStorage.setItem(ordersKey, JSON.stringify(mockOrders));
      console.log('✓ Mock orders data loaded into localStorage');
    }
  }
}

