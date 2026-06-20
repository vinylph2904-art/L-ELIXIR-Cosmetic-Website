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
  email = '';
  password = '';
  errorMessage = '';
  successMessage = '';

  constructor(private authService: AuthService, private router: Router) {}

  togglePassword() {
    this.showPassword = !this.showPassword;
  }

  async onSubmit() {
    this.errorMessage = '';
    this.successMessage = '';
    const result = await this.authService.login(this.email, this.password);

    if (result.success) {
      this.successMessage = result.message;
      setTimeout(() => this.router.navigate(['/']), 1000);
    } else {
      this.errorMessage = result.message;
    }
  }
}
