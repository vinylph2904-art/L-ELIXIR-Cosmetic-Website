import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { AuthService } from '../services/auth.service';

/**
 * AdminGuard - Bảo vệ các tuyến đường Back-office (/admin/*).
 * Chỉ cho phép người dùng có role là 'admin' | 'staff' | 'audit' và status !== 'locked'.
 * Nếu chưa đăng nhập Back-office, điều hướng về /admin/login.
 */
export const adminGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);

  if (auth.isAdminLoggedIn()) {
    return true;
  }

  return router.parseUrl('/admin/login');
};

/**
 * AdminGuestGuard - Chỉ cho phép truy cập /admin/login khi CHƯA đăng nhập Back-office.
 * Nếu đã đăng nhập, tự động chuyển về /admin/dashboard.
 */
export const adminGuestGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);

  if (!auth.isAdminLoggedIn()) {
    return true;
  }

  return router.parseUrl('/admin/dashboard');
};

