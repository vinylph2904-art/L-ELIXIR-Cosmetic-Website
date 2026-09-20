import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../../services/auth.service';
import { ToastService } from '../../../services/toast.service';
import { User } from '../../../data/user.model';

@Component({
  selector: 'app-admin-users',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-users.component.html',
  styleUrls: ['./admin-users.component.css']
})
export class AdminUsersComponent implements OnInit {
  users: User[] = [];
  filteredUsers: User[] = [];

  searchTerm = '';
  roleFilter = 'all';
  statusFilter = 'all';

  // Add user modal
  isAddModalOpen = false;
  newUser: Partial<User> = {
    fullName: '',
    email: '',
    phoneNumber: '',
    password: '',
    role: 'customer',
    status: 'active'
  };

  availableRoles: Array<{ value: User['role']; label: string }> = [
    { value: 'admin', label: 'Admin (Quản trị viên)' },
    { value: 'staff', label: 'Staff (Nhân viên)' },
    { value: 'audit', label: 'Audit (Kiểm toán viên)' },
    { value: 'customer', label: 'Customer (Khách hàng)' }
  ];

  constructor(
    private authService: AuthService,
    private toastService: ToastService
  ) {}

  ngOnInit(): void {
    this.loadUsers();
  }

  loadUsers(): void {
    this.users = this.authService.getAllUsers();
    this.applyFilters();
  }

  applyFilters(): void {
    let result = [...this.users];

    if (this.searchTerm.trim()) {
      const term = this.searchTerm.trim().toLowerCase();
      result = result.filter(u =>
        u.fullName.toLowerCase().includes(term) ||
        u.email.toLowerCase().includes(term) ||
        u.phoneNumber.includes(term) ||
        u.userId.toLowerCase().includes(term)
      );
    }

    if (this.roleFilter !== 'all') {
      result = result.filter(u => u.role === this.roleFilter);
    }

    if (this.statusFilter !== 'all') {
      result = result.filter(u => (u.status || 'active') === this.statusFilter);
    }

    this.filteredUsers = result;
  }

  onRoleChange(user: User, newRole: User['role']): void {
    const success = this.authService.updateUserRole(user.userId, newRole);
    if (success) {
      user.role = newRole;
      this.toastService.success(`Đã phân quyền tài khoản ${user.email} thành ${newRole.toUpperCase()}.`);
    } else {
      this.toastService.error('Không thể cập nhật vai trò người dùng.');
    }
  }

  toggleLockUser(user: User): void {
    const isLocking = (user.status || 'active') === 'active';
    const actionName = isLocking ? 'KHÓA' : 'KÍCH HOẠT LẠI';

    if (confirm(`Bạn có chắc chắn muốn ${actionName} tài khoản "${user.email}"?`)) {
      const success = this.authService.toggleUserStatus(user.userId);
      if (success) {
        user.status = isLocking ? 'locked' : 'active';
        if (isLocking) {
          this.toastService.warning(`Đã khóa tài khoản ${user.email}. Người dùng sẽ không thể đăng nhập.`);
        } else {
          this.toastService.success(`Đã mở khóa tài khoản ${user.email}.`);
        }
      }
    }
  }

  openAddUserModal(): void {
    this.newUser = {
      fullName: '',
      email: '',
      phoneNumber: '',
      password: '',
      role: 'staff',
      status: 'active'
    };
    this.isAddModalOpen = true;
  }

  closeAddUserModal(): void {
    this.isAddModalOpen = false;
  }

  saveNewUser(): void {
    if (!this.newUser.fullName?.trim() || !this.newUser.email?.trim() || !this.newUser.password?.trim()) {
      this.toastService.error('Vui lòng điền đầy đủ họ tên, email và mật khẩu.');
      return;
    }

    const result = this.authService.createUser(this.newUser);
    if (result.success) {
      this.toastService.success(result.message);
      this.closeAddUserModal();
      this.loadUsers();
    } else {
      this.toastService.error(result.message);
    }
  }

  getRoleBadgeClass(role?: string): string {
    switch (role) {
      case 'admin':
        return 'bg-amber-100 text-amber-900 border-amber-300';
      case 'staff':
        return 'bg-blue-100 text-blue-900 border-blue-300';
      case 'audit':
        return 'bg-purple-100 text-purple-900 border-purple-300';
      case 'customer':
      default:
        return 'bg-emerald-100 text-emerald-900 border-emerald-300';
    }
  }

  formatDate(dateStr?: string): string {
    if (!dateStr) return '01/01/2025';
    const d = new Date(dateStr);
    return isNaN(d.getTime()) ? '01/01/2025' : d.toLocaleDateString('vi-VN');
  }
}

