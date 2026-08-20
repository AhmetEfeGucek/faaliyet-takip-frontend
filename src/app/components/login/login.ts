import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { HttpClient } from '@angular/common/http';

export interface AuthResponse {
  token: string;
  fullName: string;
  email: string;
  role: string;
}

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './login.html',
  styleUrl: './login.css'
})
export class LoginComponent implements OnInit {
  email: string = '';
  password: string = '';
  errorMessage: string = '';
  isLoading: boolean = false;

  constructor(
    private http: HttpClient,
    private router: Router
  ) {}

  ngOnInit(): void {
    if (localStorage.getItem('token')) {
      this.router.navigate(['/dashboard']);
    }
  }

  private extractErrorMessage(err: any): string {
    if (!err) {
      return 'Bilinmeyen bir hata oluştu.';
    }

    // 1. Durum Kodu Kontrolleri (Forbidden / Unauthorized engelleme)
    if (err.status === 401 || err.status === 403) {
      // Backend özel bir mesaj yolladıysa (örn: "Lütfen önce mailinizi doğrulayın") onu al, yoksa standart mesaj bas
      if (err.error && typeof err.error === 'string' && !err.error.toLowerCase().includes('forbidden')) {
        return err.error;
      }
      if (err.error && typeof err.error === 'object' && err.error.message && !err.error.message.toLowerCase().includes('forbidden')) {
        return err.error.message;
      }
      return 'E-posta adresi veya şifre hatalı.';
    }

    if (err.status === 404) {
      return 'Kullanıcı veya giriş servisi bulunamadı.';
    }

    if (err.status === 0) {
      return 'Sunucuya bağlanılamadı. Lütfen internet bağlantınızı ve backend servisini kontrol ediniz.';
    }

    // 2. String formatındaki hata mesajları
    if (typeof err.error === 'string') {
      if (err.error.toLowerCase().includes('forbidden')) {
        return 'E-posta adresi veya şifre hatalı.';
      }
      return err.error;
    }

    // 3. Obje formatındaki hata mesajları
    if (err.error && typeof err.error === 'object') {
      if (err.error.message && typeof err.error.message === 'string') {
        if (err.error.message.toLowerCase().includes('forbidden')) {
          return 'E-posta adresi veya şifre hatalı.';
        }
        return err.error.message;
      }

      if (err.error.error && typeof err.error.error === 'string') {
        if (err.error.error.toLowerCase().includes('forbidden')) {
          return 'E-posta adresi veya şifre hatalı.';
        }
        return err.error.error;
      }

      // Spring Boot validation hataları (Map/Dictionary)
      if (err.error.errors && typeof err.error.errors === 'object') {
        const errorValues = Object.values(err.error.errors);
        if (errorValues.length > 0) {
          return errorValues.join(' - ');
        }
      }

      const firstVal = Object.values(err.error)[0];
      if (typeof firstVal === 'string' && !firstVal.toLowerCase().includes('forbidden')) {
        return firstVal;
      }
    }

    return 'Giriş yapılamadı. Bilgilerinizi kontrol edip tekrar deneyiniz.';
  }

  login(): void {
    this.errorMessage = '';

    if (!this.email || !this.email.trim()) {
      this.errorMessage = 'Lütfen e-posta adresinizi giriniz.';
      return;
    }

    if (!this.password || !this.password.trim()) {
      this.errorMessage = 'Lütfen şifrenizi giriniz.';
      return;
    }

    this.isLoading = true;

    const payload = {
      email: this.email.trim(),
      password: this.password
    };

    this.http.post<AuthResponse>('http://localhost:8080/api/auth/login', payload).subscribe({
      next: (res) => {
        this.isLoading = false;
        if (res && res.token) {
          localStorage.setItem('token', res.token);
          localStorage.setItem('jwt', res.token);
          localStorage.setItem('user', JSON.stringify({
            fullName: res.fullName,
            email: res.email,
            role: res.role
          }));
          this.router.navigate(['/dashboard']);
        }
      },
      error: (err) => {
        this.isLoading = false;
        console.error('Giriş hatası detay:', err);
        this.errorMessage = this.extractErrorMessage(err);
      }
    });
  }
}
