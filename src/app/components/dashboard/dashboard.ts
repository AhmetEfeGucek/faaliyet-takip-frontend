import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { HttpClient, HttpHeaders } from '@angular/common/http';

export interface ParticipantInfo {
  userId: number;
  fullName: string;
  email: string;
  status: string;
}

export interface ActivityItem {
  id: number;
  title: string;
  description: string;
  eventDate: string;
  completionDate?: string;
  status: string;
  categoryName?: string;
  createdByUserName?: string;
  participants?: ParticipantInfo[];
}

export interface UserItem {
  id: number;
  fullName: string;
  email: string;
  role: string;
  createdAt?: string;
}

export interface NotificationItem {
  id?: number;
  title: string;
  message: string;
  createdAt: string;
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css'
})
export class DashboardComponent implements OnInit {
  activities: ActivityItem[] = [];
  users: UserItem[] = [];
  notifications: NotificationItem[] = [];

  fullName: string = 'Kullanıcı';
  isAdmin: boolean = false;
  isDarkMode: boolean = false;

  showNotifications: boolean = false;
  showUserList: boolean = false;
  showCompletedArchive: boolean = false;
  selectedActivity: ActivityItem | null = null;

  constructor(
    private http: HttpClient,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        this.fullName = user.fullName || user.email || 'Kullanıcı';
        this.isAdmin = user.role === 'ADMIN' || user.role === 'ROLE_ADMIN';
      } catch (e) {
        this.fullName = 'Kullanıcı';
        this.isAdmin = false;
      }
    }

    const savedTheme = localStorage.getItem('theme');
    this.isDarkMode = savedTheme === 'dark';

    this.loadActivities();
    this.loadNotifications();
    if (this.isAdmin) {
      this.loadUsers();
    }
  }

  private getAuthHeaders(): HttpHeaders {
    const token = localStorage.getItem('token') || localStorage.getItem('jwt');
    return new HttpHeaders({
      'Authorization': token ? `Bearer ${token}` : ''
    });
  }

  loadActivities(): void {
    this.http.get<ActivityItem[]>('http://localhost:8080/api/activities', { headers: this.getAuthHeaders() })
      .subscribe({
        next: (data) => {
          this.activities = data || [];
          this.cdr.detectChanges();
        },
        error: (err) => {
          console.error('Faaliyetler yüklenemedi:', err);
          this.cdr.detectChanges();
        }
      });
  }

  loadUsers(): void {
    this.http.get<UserItem[]>('http://localhost:8080/api/admin/users', { headers: this.getAuthHeaders() })
      .subscribe({
        next: (data) => {
          this.users = data || [];
          this.cdr.detectChanges();
        },
        error: (err) => {
          console.error('Kullanıcılar yüklenemedi:', err);
          this.cdr.detectChanges();
        }
      });
  }

  loadNotifications(): void {
    this.http.get<NotificationItem[]>('http://localhost:8080/api/notifications', { headers: this.getAuthHeaders() })
      .subscribe({
        next: (data) => {
          this.notifications = data || [];
          this.cdr.detectChanges();
        },
        error: () => {
          this.notifications = [];
          this.cdr.detectChanges();
        }
      });
  }

  // Tarih kontrolü: Faaliyetin zamanı geçti mi?
  isEventPassed(eventDateStr: string): boolean {
    if (!eventDateStr) return false;
    return new Date(eventDateStr).getTime() < new Date().getTime();
  }

  // Bitişinin üzerinden 3 gün geçti mi kontrolü
  isArchivedForUsers(eventDateStr: string): boolean {
    if (!eventDateStr) return false;
    const eventTime = new Date(eventDateStr).getTime();
    const nowTime = new Date().getTime();
    const diffDays = (nowTime - eventTime) / (1000 * 3600 * 24);
    return diffDays > 3;
  }

  // Görünür Faaliyetler Filtresi
  get visibleActivities(): ActivityItem[] {
    if (this.isAdmin && this.showCompletedArchive) {
      return this.activities.filter(a => this.isArchivedForUsers(a.eventDate));
    }
    return this.activities.filter(a => !this.isArchivedForUsers(a.eventDate));
  }

  // Admin için Faaliyet Silme Metodu
  deleteActivity(activityId: number): void {
    if (!confirm('Bu faaliyeti sistemden tamamen silmek istediğinize emin misiniz?')) {
      return;
    }

    this.http.delete(`http://localhost:8080/api/activities/${activityId}`, {
      headers: this.getAuthHeaders(),
      responseType: 'text'
    }).subscribe({
      next: () => {
        this.activities = this.activities.filter(a => a.id !== activityId);
        if (this.selectedActivity && this.selectedActivity.id === activityId) {
          this.selectedActivity = null;
        }
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Silme hatası:', err);
        alert('Faaliyet silinemedi: ' + (err.error || err.message));
      }
    });
  }

  // Admin için Kullanıcı Rolünü Değiştirme Metodu
  toggleUserRole(user: UserItem): void {
    const targetRole = (user.role === 'ROLE_ADMIN' || user.role === 'ADMIN') ? 'ROLE_USER' : 'ROLE_ADMIN';
    const roleText = targetRole === 'ROLE_ADMIN' ? 'YÖNETİCİ (ADMIN)' : 'STANDART KULLANICI';

    if (!confirm(`${user.fullName} kullanıcısının rolünü ${roleText} olarak değiştirmek istiyor musunuz?`)) {
      return;
    }

    this.http.put(`http://localhost:8080/api/admin/users/${user.id}/role`, { role: targetRole }, {
      headers: this.getAuthHeaders()
    }).subscribe({
      next: () => {
        user.role = targetRole;
        this.loadUsers(); // Tabloyu anında tazele
        this.cdr.detectChanges();
      },
      error: (err) => {
        const errorMsg = typeof err.error === 'string' ? err.error : (err.error?.message || err.message);
        alert('Rol güncellenemedi: ' + errorMsg);
      }
    });
  }

  // Admin için Kullanıcı Silme Metodu
  deleteUser(userId: number, fullName: string): void {
    if (!confirm(`${fullName} isimli kullanıcıyı tamamen silmek istediğinize emin misiniz?`)) {
      return;
    }

    this.http.delete(`http://localhost:8080/api/admin/users/${userId}`, {
      headers: this.getAuthHeaders(),
      responseType: 'text'
    }).subscribe({
      next: () => {
        this.users = this.users.filter(u => u.id !== userId);
        this.cdr.detectChanges();
      },
      error: (err) => {
        const errorMsg = typeof err.error === 'string' ? err.error : (err.error?.message || err.message);
        alert('Kullanıcı silinemedi: ' + errorMsg);
      }
    });
  }

  toggleArchiveView(): void {
    this.showCompletedArchive = !this.showCompletedArchive;
    this.cdr.detectChanges();
  }

  respond(activityId: number, status: 'ACCEPTED' | 'REJECTED'): void {
    this.http.post(`http://localhost:8080/api/activities/${activityId}/respond?status=${status}`, {}, {
      headers: this.getAuthHeaders(),
      responseType: 'text'
    }).subscribe({
      next: () => {
        this.loadActivities();
      },
      error: (err) => {
        console.error('Katılım yanıtı hatası:', err);
        alert('Yanıt kaydedilemedi: ' + (err.error || err.message));
      }
    });
  }

  toggleNotifications(): void {
    this.showNotifications = !this.showNotifications;
    this.cdr.detectChanges();
  }

  toggleUserList(): void {
    this.showUserList = !this.showUserList;
    if (this.showUserList && this.users.length === 0) {
      this.loadUsers();
    }
    this.cdr.detectChanges();
  }

  openDetails(activity: ActivityItem): void {
    this.selectedActivity = activity;
    this.cdr.detectChanges();
  }

  closeDetails(): void {
    this.selectedActivity = null;
    this.cdr.detectChanges();
  }

  toggleTheme(): void {
    this.isDarkMode = !this.isDarkMode;
    localStorage.setItem('theme', this.isDarkMode ? 'dark' : 'light');
    this.cdr.detectChanges();
  }

  logout(): void {
    localStorage.clear();
    this.router.navigate(['/login']);
  }
}
