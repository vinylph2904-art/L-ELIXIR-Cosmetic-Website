import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { OrderService } from '../../../services/order.service';
import { ToastService } from '../../../services/toast.service';
import { Order } from '../../../data/order.model';

@Component({
  selector: 'app-admin-orders',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-orders.component.html',
  styleUrls: ['./admin-orders.component.css']
})
export class AdminOrdersComponent implements OnInit {
  orders: Order[] = [];
  filteredOrders: Order[] = [];

  // Filter & Search
  searchTerm = '';
  statusFilter = 'all';
  cancelFilter = 'all';

  // Detail Modal
  isDetailModalOpen = false;
  selectedOrder: Order | null = null;

  // Cancel Reject Note Modal
  isRejectModalOpen = false;
  rejectReasonInput = '';

  constructor(
    private orderService: OrderService,
    private toastService: ToastService
  ) {}

  ngOnInit(): void {
    this.loadOrders();
  }

  loadOrders(): void {
    this.orders = this.orderService.getAllOrders().sort((a, b) =>
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
    this.applyFilters();
  }

  applyFilters(): void {
    let result = [...this.orders];

    if (this.searchTerm.trim()) {
      const term = this.searchTerm.trim().toLowerCase();
      result = result.filter(o =>
        (o.orderId && o.orderId.toLowerCase().includes(term)) ||
        (o.shippingInfo?.fullName && o.shippingInfo.fullName.toLowerCase().includes(term)) ||
        (o.guestName && o.guestName.toLowerCase().includes(term)) ||
        (o.shippingInfo?.phone && o.shippingInfo.phone.includes(term))
      );
    }

    if (this.statusFilter !== 'all') {
      result = result.filter(o => o.orderStatus === this.statusFilter);
    }

    if (this.cancelFilter === 'requested') {
      result = result.filter(o => o.cancelStatus === 'pending');
    }

    this.filteredOrders = result;
  }

  openDetailModal(order: Order): void {
    this.selectedOrder = { ...order };
    this.isDetailModalOpen = true;
  }

  closeDetailModal(): void {
    this.isDetailModalOpen = false;
    this.selectedOrder = null;
  }

  changeOrderStatus(newStatus: Order['orderStatus']): void {
    if (!this.selectedOrder) return;

    this.orderService.updateOrderStatus(this.selectedOrder.orderId, newStatus);
    this.selectedOrder.orderStatus = newStatus;
    this.toastService.success(`Đã cập nhật trạng thái đơn ${this.selectedOrder.orderId} thành "${newStatus}".`);
    this.loadOrders();
  }

  // Approve Cancellation
  approveCancellation(order: Order): void {
    if (confirm(`Bạn có chắc chắn muốn PHÊ DUYỆT yêu cầu hủy đơn hàng ${order.orderId}? Đơn hàng sẽ chuyển sang trạng thái "Cancelled".`)) {
      this.orderService.approveCancellation(order.orderId);
      this.toastService.success(`Đã phê duyệt hủy đơn hàng ${order.orderId}.`);
      this.loadOrders();
      if (this.selectedOrder?.orderId === order.orderId) {
        this.selectedOrder = this.orderService.getByOrderId(order.orderId);
      }
    }
  }

  // Open Reject Modal
  openRejectModal(order: Order): void {
    this.selectedOrder = order;
    this.rejectReasonInput = '';
    this.isRejectModalOpen = true;
  }

  closeRejectModal(): void {
    this.isRejectModalOpen = false;
    this.rejectReasonInput = '';
  }

  confirmRejectCancellation(): void {
    if (!this.selectedOrder) return;

    if (!this.rejectReasonInput.trim()) {
      this.toastService.error('Vui lòng nhập lý do từ chối yêu cầu hủy đơn.');
      return;
    }

    this.orderService.rejectCancellation(this.selectedOrder.orderId, this.rejectReasonInput.trim());
    this.toastService.warning(`Đã từ chối yêu cầu hủy đơn hàng ${this.selectedOrder.orderId}.`);
    this.closeRejectModal();
    this.loadOrders();
    if (this.selectedOrder?.orderId) {
      this.selectedOrder = this.orderService.getByOrderId(this.selectedOrder.orderId);
    }
  }

  getStatusBadgeClass(status?: string): string {
    switch (status) {
      case 'Pending':
        return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'Processing':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'Shipping':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'Completed':
        return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'Cancelled':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  }

  formatCurrency(value?: number): string {
    return (value || 0).toLocaleString('vi-VN') + ' ₫';
  }

  formatDate(date: any): string {
    if (!date) return '';
    const d = new Date(date);
    return isNaN(d.getTime()) ? '' : `${d.toLocaleDateString('vi-VN')} ${d.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}`;
  }
}

