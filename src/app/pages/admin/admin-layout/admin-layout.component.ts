import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../../services/auth.service';
import { User } from '../../../data/user.model';

@Component({
  selector: 'app-admin-layout',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './admin-layout.component.html',
  styleUrls: ['./admin-layout.component.css']
})
export class AdminLayoutComponent implements OnInit {
  currentAdmin: (User & { token: string }) | null = null;
  isSidebarOpen = false;

  navItems = [
    { label: 'Dashboard & Analytics', icon: 'dashboard', route: '/admin/dashboard', badge: 'FR26' },
    { label: 'Quản lý Sản phẩm', icon: 'inventory_2', route: '/admin/products', badge: 'FR22' },
    { label: 'Quản lý Đơn hàng', icon: 'receipt_long', route: '/admin/orders', badge: 'FR23' },
    { label: 'Người dùng & Phân quyền', icon: 'manage_accounts', route: '/admin/users', badge: 'FR25' }
  ];

  constructor(public authService: AuthService, private router: Router) {}

  ngOnInit(): void {
    this.currentAdmin = this.authService.getAdminUser();
    this.authService.adminUser$.subscribe(admin => {
      this.currentAdmin = admin;
      if (!admin) {
        this.router.navigate(['/admin/login']);
      }
    });
  }

  toggleSidebar(): void {
    this.isSidebarOpen = !this.isSidebarOpen;
  }

  getRoleBadgeClass(role?: string): string {
    switch (role) {
      case 'admin':
        return 'bg-amber-100 text-amber-800 border-amber-300';
      case 'staff':
        return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'audit':
        return 'bg-purple-100 text-purple-800 border-purple-300';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  }

  logout(): void {
    this.authService.adminLogout();
    this.router.navigate(['/admin/login']);
  }
}

