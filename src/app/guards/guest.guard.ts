import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { AuthService } from '../services/auth.service';

/** Chỉ cho phép truy cập khi CHƯA đăng nhập (login/signup), nếu đã đăng nhập thì đẩy về /account */
export const guestGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);

  if (!auth.isLoggedIn()) {
    return true;
  }
  return router.parseUrl('/account');
};
