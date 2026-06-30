import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

interface SignupFieldErrors {
  fullName: string;
  email: string;
  phoneNumber: string;
  password: string;
  confirmPassword: string;
  agreeTerms: string;
}

@Component({
  selector: 'app-signup',
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.css']
})
export class SignupComponent {
  showPassword = false;
  showConfirmPassword = false;

  fullName = '';
  email = '';
  phoneNumber = '';
  password = '';
  confirmPassword = '';
  agreeTerms = false;
  successMessage = '';

  fieldErrors: SignupFieldErrors = {
    fullName: '', email: '', phoneNumber: '', password: '', confirmPassword: '', agreeTerms: ''
  };

  constructor(private authService: AuthService, private router: Router) {}

  togglePassword() {
    this.showPassword = !this.showPassword;
  }

  toggleConfirmPassword() {
    this.showConfirmPassword = !this.showConfirmPassword;
  }

  /** Validate từng ô riêng biệt: trống -> sai định dạng -> đã tồn tại */
  private async validateAll(): Promise<boolean> {
    const errors: SignupFieldErrors = {
      fullName: '', email: '', phoneNumber: '', password: '', confirmPassword: '', agreeTerms: ''
    };

    if (!this.fullName.trim()) {
      errors.fullName = 'Tên không được để trống.';
    } else if (!this.authService.isValidFullName(this.fullName)) {
      errors.fullName = 'Tên sai định dạng.';
    }

    if (!this.email.trim()) {
      errors.email = 'Email không được để trống.';
    } else if (!this.authService.isValidEmail(this.email.trim())) {
      errors.email = 'Email sai định dạng.';
    } else if (await this.authService.emailExists(this.email)) {
      errors.email = 'Email đã tồn tại, vui lòng nhập email khác.';
    }

    if (!this.phoneNumber.trim()) {
      errors.phoneNumber = 'Số điện thoại không được để trống.';
    } else if (!this.authService.isValidPhone(this.phoneNumber)) {
      errors.phoneNumber = 'Số điện thoại phải gồm đúng 10 chữ số.';
    } else if (await this.authService.phoneExists(this.phoneNumber)) {
      errors.phoneNumber = 'Số điện thoại đã tồn tại, vui lòng nhập số khác.';
    }

    if (!this.password) {
      errors.password = 'Mật khẩu không được để trống.';
    }

    if (!this.confirmPassword) {
      errors.confirmPassword = 'Vui lòng xác nhận mật khẩu.';
    } else if (this.password && this.confirmPassword !== this.password) {
      errors.confirmPassword = 'Mật khẩu xác nhận không khớp.';
    }

    if (!this.agreeTerms) {
      errors.agreeTerms = 'Bạn cần đồng ý với Điều khoản sử dụng và Chính sách bảo mật.';
    }

    this.fieldErrors = errors;
    return Object.values(errors).every(e => !e);
  }

  async onSubmit(event: Event) {
    event.preventDefault();
    this.successMessage = '';

    if (!(await this.validateAll())) {
      return;
    }

    const result = await this.authService.signup({
      email: this.email.trim(),
      password: this.password,
      fullName: this.fullName.trim(),
      phoneNumber: this.phoneNumber.trim()
    });

    if (result.success) {
      this.successMessage = result.message;
      setTimeout(() => this.router.navigate(['/login']), 1500);
    } else {
      // Trường hợp hiếm: dữ liệu trùng vừa được tạo ở tab khác giữa lúc validate và submit
      if (result.message.includes('Email')) {
        this.fieldErrors.email = result.message;
      } else if (result.message.includes('điện thoại')) {
        this.fieldErrors.phoneNumber = result.message;
      }
    }
  }
}