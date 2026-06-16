import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-order-tracking',
  templateUrl: './order-tracking.component.html',
  styleUrls: ['./order-tracking.component.css']
})

export class OrderTrackingComponent implements OnInit {
  orders: any[] = [];

  constructor() {}

  ngOnInit(): void {
    // placeholder sample data
    this.orders = [
      { id: 'ORD123', date: '2026-06-10', total: 450000, status: 'Đang xử lý' },
      { id: 'ORD122', date: '2026-05-30', total: 230000, status: 'Đã giao' }
    ];
  }
}
