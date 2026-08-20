import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth';

@Component({
  selector: 'app-verify',
  standalone: true,
  imports: [FormsModule, RouterModule, CommonModule],
  templateUrl: './verify.html',
  styleUrl: './verify.css'
})
export class VerifyComponent implements OnInit {
  email = '';
  code = '';
  message = '';
  error = '';

  constructor(private authService: AuthService, private route: ActivatedRoute, private router: Router) {}

  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      if (params['email']) {
        this.email = params['email'];
      }
    });
  }

  onSubmit() {
    this.message = '';
    this.error = '';
    this.authService.verify(this.email, this.code).subscribe({
      next: (res) => {
        this.message = res;
        setTimeout(() => {
          this.router.navigate(['/login']);
        }, 1500);
      },
      error: (err) => {
        this.error = err.error?.message || err.error || 'Doğrulama başarısız!';
      }
    });
  }
}
