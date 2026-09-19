import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-admin-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './admin-login.component.html',
  styleUrls: ['./admin-login.component.css']
})
export class AdminLoginComponent {
  email = '';
  password = '';
  showPassword = false;
  isLoading = false;
  errorMessage = '';
  successMessage = '';

  constructor(private authService: AuthService, private router: Router) {}

  togglePassword(): void {
    this.showPassword = !this.showPassword;
  }

  fillDemoAccount(type: 'admin' | 'staff' | 'audit'): void {
    if (type === 'admin') {
      this.email = 'admin@lelixir.vn';
      this.password = 'admin123';
    } else if (type === 'staff') {
      this.email = 'staff@lelixir.vn';
      this.password = 'staff123';
    } else {
      this.email = 'audit@lelixir.vn';
      this.password = 'audit123';
    }
    this.errorMessage = '';
  }

  async onSubmit(): Promise<void> {
    this.errorMessage = '';
    this.successMessage = '';

    if (!this.email.trim()) {
      this.errorMessage = 'Vui lòng nhập email tài khoản quản trị.';
      return;
    }

    if (!this.password.trim()) {
      this.errorMessage = 'Vui lòng nhập mật khẩu.';
      return;
    }

    this.isLoading = true;

    try {
      const result = await this.authService.adminLogin(this.email.trim(), this.password);
      if (result.success) {
        this.successMessage = result.message;
        setTimeout(() => {
          this.router.navigate(['/admin/dashboard']);
        }, 800);
      } else {
        this.errorMessage = result.message;
      }
    } catch {
      this.errorMessage = 'Đã xảy ra lỗi trong quá trình xác thực. Vui lòng thử lại.';
    } finally {
      this.isLoading = false;
    }
  }
}

