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
  fieldErrors = {
    email: '',
    password: '',
    newPassword: '',
    confirmPassword: ''
  };

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
    this.fieldErrors = {
      email: '',
      password: '',
      newPassword: '',
      confirmPassword: ''
    };
  }

  switchToLogin() {
    this.mode = 'login';
    this.errorMessage = '';
    this.successMessage = '';
    this.password = '';
    this.newPassword = '';
    this.confirmPassword = '';
    this.fieldErrors = {
      email: '',
      password: '',
      newPassword: '',
      confirmPassword: ''
    };
  }

  async onSubmit() {
    this.errorMessage = '';
    this.successMessage = '';
    this.fieldErrors = {
      email: '',
      password: '',
      newPassword: '',
      confirmPassword: ''
    };

    if (this.mode === 'login') {
      if (!this.email.trim()) {
        this.fieldErrors.email = 'Email không được để trống.';
        return;
      }

      if (!this.authService.isValidEmail(this.email.trim())) {
        this.fieldErrors.email = 'Email sai định dạng.';
        return;
      }

      if (!this.password.trim()) {
        this.fieldErrors.password = 'Mật khẩu không được để trống.';
        return;
      }

      const result = await this.authService.login(this.email.trim(), this.password);
      if (result.success) {
        this.successMessage = result.message;
        setTimeout(() => this.router.navigate(['/']), 1000);
      } else if (result.message.includes('Tài khoản')) {
        this.fieldErrors.email = 'Email chưa tồn tại, vui lòng đăng ký.';
      } else if (result.message.includes('Mật khẩu')) {
        this.fieldErrors.password = 'Mật khẩu nhập không đúng.';
      } else {
        this.errorMessage = result.message;
      }
      return;
    }

    if (!this.email.trim()) {
      this.fieldErrors.email = 'Email không được để trống.';
      return;
    }

    if (!this.authService.isValidEmail(this.email.trim())) {
      this.fieldErrors.email = 'Email sai định dạng.';
      return;
    }

    if (!this.newPassword.trim()) {
      this.fieldErrors.newPassword = 'Mật khẩu mới không được để trống.';
      return;
    }

    if (this.newPassword.trim().length < 6) {
      this.fieldErrors.newPassword = 'Mật khẩu mới phải có ít nhất 6 ký tự.';
      return;
    }

    if (!this.confirmPassword.trim()) {
      this.fieldErrors.confirmPassword = 'Vui lòng xác nhận mật khẩu.';
      return;
    }

    if (this.newPassword !== this.confirmPassword) {
      this.fieldErrors.confirmPassword = 'Mật khẩu xác nhận không khớp.';
      return;
    }

    const verifyEmail = await this.authService.emailExists(this.email.trim());
    if (!verifyEmail) {
      this.fieldErrors.email = 'Email chưa tồn tại, vui lòng đăng ký.';
      return;
    }

    const result = await this.authService.resetPassword(this.email.trim(), this.newPassword);
    if (result.success) {
      this.successMessage = result.message;
      setTimeout(() => this.switchToLogin(), 1600);
    } else {
      this.errorMessage = result.message;
    }
  }
}
