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
  
  // Login fields
  email = '';
  password = '';

  // Reset Password via OTP fields
  resetStep: 1 | 2 | 3 = 1;
  resetIdentifier = '';
  resetOtp = '';
  demoOtpHit = '';
  newPassword = '';
  confirmPassword = '';
  otpCountdown = 60;
  private timerInterval: any = null;

  errorMessage = '';
  successMessage = '';
  fieldErrors = {
    email: '',
    password: '',
    resetIdentifier: '',
    resetOtp: '',
    newPassword: '',
    confirmPassword: ''
  };

  constructor(private authService: AuthService, private router: Router) {}

  togglePassword() {
    this.showPassword = !this.showPassword;
  }

  switchToReset() {
    this.mode = 'reset';
    this.resetStep = 1;
    this.resetIdentifier = this.email || '';
    this.resetOtp = '';
    this.demoOtpHit = '';
    this.newPassword = '';
    this.confirmPassword = '';
    this.clearErrors();
  }

  switchToLogin() {
    this.mode = 'login';
    this.clearErrors();
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
    }
  }

  clearErrors() {
    this.errorMessage = '';
    this.successMessage = '';
    this.fieldErrors = {
      email: '',
      password: '',
      resetIdentifier: '',
      resetOtp: '',
      newPassword: '',
      confirmPassword: ''
    };
  }

  // --- Step 1: Request OTP ---
  onRequestOtp() {
    this.clearErrors();
    const id = this.resetIdentifier.trim();
    if (!id) {
      this.fieldErrors.resetIdentifier = 'Vui lòng nhập Email hoặc Số điện thoại.';
      return;
    }

    const res = this.authService.requestPasswordResetOtp(id);
    if (res.success) {
      this.demoOtpHit = res.otp || '123456';
      this.successMessage = res.message;
      this.resetStep = 2;
      this.startOtpTimer();
    } else {
      this.errorMessage = res.message;
    }
  }

  // --- Step 2: Verify OTP ---
  onVerifyOtp() {
    this.clearErrors();
    if (!this.resetOtp.trim()) {
      this.fieldErrors.resetOtp = 'Vui lòng nhập mã OTP 6 chữ số.';
      return;
    }

    const res = this.authService.verifyResetOtp(this.resetIdentifier.trim(), this.resetOtp.trim());
    if (res.success) {
      this.resetStep = 3;
      this.successMessage = 'Xác thực OTP thành công. Vui lòng thiết lập mật khẩu mới.';
    } else {
      this.fieldErrors.resetOtp = res.message;
    }
  }

  startOtpTimer() {
    this.otpCountdown = 60;
    if (this.timerInterval) clearInterval(this.timerInterval);
    this.timerInterval = setInterval(() => {
      if (this.otpCountdown > 0) {
        this.otpCountdown--;
      } else {
        clearInterval(this.timerInterval);
      }
    }, 1000);
  }

  resendOtp() {
    if (this.otpCountdown > 0) return;
    this.onRequestOtp();
  }

  // --- Step 3: Confirm new password ---
  async onConfirmNewPassword() {
    this.clearErrors();

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

    const res = await this.authService.confirmPasswordResetWithOtp(
      this.resetIdentifier.trim(),
      this.resetOtp.trim(),
      this.newPassword.trim()
    );

    if (res.success) {
      this.successMessage = res.message;
      setTimeout(() => this.switchToLogin(), 1800);
    } else {
      this.errorMessage = res.message;
    }
  }

  async onSubmit() {
    this.clearErrors();

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
        setTimeout(() => this.router.navigate(['/']), 800);
      } else if (result.message.includes('Tài khoản không tồn tại')) {
        this.fieldErrors.email = 'Email chưa tồn tại, vui lòng đăng ký.';
      } else if (result.message.includes('Mật khẩu không đúng')) {
        this.fieldErrors.password = 'Mật khẩu nhập không đúng.';
      } else {
        this.errorMessage = result.message;
      }
      return;
    }
  }
}
