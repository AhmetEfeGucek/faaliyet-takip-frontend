import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { HttpClient, HttpHeaders } from '@angular/common/http';

export interface CategoryItem {
  id: number;
  name: string;
}

@Component({
  selector: 'app-activity-create',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './activity-create.html',
  styleUrl: './activity-create.css'
})
export class ActivityCreateComponent implements OnInit {
  title: string = '';
  categoryId: number | null = null;
  eventDateOnly: string = '';
  eventTimeOnly: string = '12:00';
  description: string = '';

  categories: CategoryItem[] = [];
  errorMessage: string = '';
  isLoading: boolean = false;

  constructor(
    private http: HttpClient,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const dd = String(today.getDate()).padStart(2, '0');
    this.eventDateOnly = `${yyyy}-${mm}-${dd}`;

    this.loadCategories();
  }

  private getAuthHeaders(): HttpHeaders {
    const token = localStorage.getItem('token') || localStorage.getItem('jwt');
    return new HttpHeaders({
      'Authorization': token ? `Bearer ${token}` : ''
    });
  }

  loadCategories(): void {
    this.http.get<CategoryItem[]>('http://localhost:8080/api/categories', { headers: this.getAuthHeaders() })
      .subscribe({
        next: (data) => {
          this.categories = data || [];
          if (this.categories.length > 0) {
            this.categoryId = this.categories[0].id;
          }
          this.cdr.detectChanges();
        },
        error: (err) => {
          console.error('Kategoriler yüklenemedi:', err);
          this.cdr.detectChanges();
        }
      });
  }

  createActivity(): void {
    this.errorMessage = '';

    if (!this.title.trim()) {
      this.errorMessage = 'Lütfen faaliyet başlığını giriniz.';
      return;
    }

    if (!this.categoryId) {
      this.errorMessage = 'Lütfen bir kategori seçiniz.';
      return;
    }

    if (!this.eventDateOnly || !this.eventTimeOnly) {
      this.errorMessage = 'Lütfen faaliyet tarihini ve saatini seçiniz.';
      return;
    }

    this.isLoading = true;

    const fullDateTime = `${this.eventDateOnly}T${this.eventTimeOnly}:00`;

    const payload = {
      title: this.title.trim(),
      description: this.description.trim(),
      eventDate: fullDateTime,
      categoryId: Number(this.categoryId)
    };

    this.http.post('http://localhost:8080/api/activities', payload, { headers: this.getAuthHeaders() })
      .subscribe({
        next: () => {
          this.isLoading = false;
          alert('Faaliyet başarıyla oluşturuldu!');
          this.router.navigate(['/dashboard']);
        },
        error: (err) => {
          this.isLoading = false;
          console.error('Faaliyet oluşturulamadı:', err);
          this.errorMessage = typeof err.error === 'string' ? err.error : (err.error?.message || 'Faaliyet kaydedilirken bir hata oluştu.');
          this.cdr.detectChanges();
        }
      });
  }
}
