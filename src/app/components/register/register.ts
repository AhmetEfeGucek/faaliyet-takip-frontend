import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './register.html',
  styleUrl: './register.css'
})
export class RegisterComponent {
  user = {
    fullName: '',
    email: '',
    password: ''
  };

  message: string = '';
  error: string = '';
  isLoading: boolean = false;

  constructor(
    private http: HttpClient,
    private router: Router
  ) {}

  private extractErrorMessage(err: any): string {
    if (!err) return 'Bilinmeyen bir hata oluştu.';
    if (typeof err.error === 'string') return err.error;
    if (err.error && typeof err.error === 'object') {
      if (err.error.message) return err.error.message;
      if (err.error.error) return err.error.error;
    }
    return err.message || 'Kayıt işlemi başarısız.';
  }

  onSubmit(): void {
    this.error = '';
    this.message = '';

    if (!this.user.fullName.trim() || !this.user.email.trim() || !this.user.password.trim()) {
      this.error = 'Lütfen tüm alanları doldurunuz.';
      return;
    }

    this.isLoading = true;

    const payload = {
      fullName: this.user.fullName.trim(),
      email: this.user.email.trim().toLowerCase(),
      password: this.user.password
    };

    this.http.post('http://localhost:8080/api/auth/register', payload, { responseType: 'text' }).subscribe({
      next: (res) => {
        this.isLoading = false;
        this.message = 'Kayıt başarılı! Lütfen doğrulama kodunu giriniz.';
        localStorage.setItem('verify_email', this.user.email.trim().toLowerCase());
        setTimeout(() => {
          this.router.navigate(['/verify']);
        }, 1500);
      },
      error: (err) => {
        this.isLoading = false;
        console.error('Kayıt hatası:', err);
        this.error = this.extractErrorMessage(err);
      }
    });
  }
}
