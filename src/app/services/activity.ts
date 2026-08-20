import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from './auth';

@Injectable({
  providedIn: 'root'
})
export class ActivityService {
  private apiUrl = 'http://localhost:8080/api/activities';

  constructor(private http: HttpClient, private authService: AuthService) {}

  private getHeaders(): HttpHeaders {
    const token = this.authService.getToken();
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    });
  }

  getAllActivities(): Observable<any[]> {
    return this.http.get<any[]>(this.apiUrl, { headers: this.getHeaders() });
  }

  createActivity(activity: any): Observable<any> {
    return this.http.post<any>(this.apiUrl, activity, { headers: this.getHeaders() });
  }

  completeActivity(id: number): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/${id}/complete`, {}, { headers: this.getHeaders() });
  }

  respondToActivity(id: number, status: string): Observable<any> {
    return this.http.post(
      `${this.apiUrl}/${id}/respond?status=${status}`,
      {},
      {
        headers: this.getHeaders(),
        responseType: 'text'
      }
    );
  }
}
