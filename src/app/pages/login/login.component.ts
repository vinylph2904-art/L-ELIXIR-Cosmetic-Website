import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  showPassword = false;
  mode: 'login' | 'reset' = 'login';
  email = '';
  password = '';
  newPassword = '';
  confirmPassword = '';
  errorMessage = '';
  successMessage = '';

  constructor(private authService: AuthService, private router: Router) {}

  togglePassword() {
    this.showPassword = !this.showPassword;
  }

  switchToReset() {
    this.mode = 'reset';
    this.errorMessage = '';
    this.successMessage = '';
    this.password = '';
    this.newPassword = '';
    this.confirmPassword = '';
  }

  switchToLogin() {
    this.mode = 'login';
    this.errorMessage = '';
    this.successMessage = '';
    this.password = '';
    this.newPassword = '';
    this.confirmPassword = '';
  }

  async onSubmit() {
    this.errorMessage = '';
    this.successMessage = '';

    if (this.mode === 'login') {
      const result = await this.authService.login(this.email, this.password);
      if (result.success) {
        this.successMessage = result.message;
        setTimeout(() => this.router.navigate(['/']), 1000);
      } else {
        this.errorMessage = result.message;
      }
      return;
    }

    if (!this.authService.isValidEmail(this.email.trim())) {
      this.errorMessage = 'Email không đúng định dạng.';
      return;
    }

    if (!this.newPassword.trim() || !this.confirmPassword.trim()) {
      this.errorMessage = 'Vui lòng nhập mật khẩu mới và xác nhận mật khẩu.';
      return;
    }

    if (this.newPassword.trim().length < 6) {
      this.errorMessage = 'Mật khẩu mới phải có ít nhất 6 ký tự.';
      return;
    }

    if (this.newPassword !== this.confirmPassword) {
      this.errorMessage = 'Mật khẩu xác nhận không khớp.';
      return;
    }

    const verifyEmail = await this.authService.emailExists(this.email);
    if (!verifyEmail) {
      this.errorMessage = 'Email không tồn tại trong hệ thống.';
      return;
    }

    const result = await this.authService.resetPassword(this.email, this.newPassword);
    if (result.success) {
      this.successMessage = result.message;
      setTimeout(() => this.switchToLogin(), 1600);
    } else {
      this.errorMessage = result.message;
    }
  }
}
