import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = 'http://localhost:8080/api/auth';

  constructor(private http: HttpClient) {}

  register(data: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/register`, data, { responseType: 'text' });
  }

  verify(email: string, code: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/verify?email=${email}&code=${code}`, {}, { responseType: 'text' });
  }

  login(data: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/login`, data);
  }

  getAllUsers(): Observable<any[]> {
    const token = this.getToken();
    const headers = new HttpHeaders({ 'Authorization': `Bearer ${token}` });
    return this.http.get<any[]>(`${this.apiUrl}/users`, { headers });
  }

  // login.ts dosyasının beklediği metot:
  saveUser(token: string, email?: string, fullName?: string, role?: string) {
    localStorage.setItem('token', token);
    if (email) localStorage.setItem('email', email);
    if (fullName) localStorage.setItem('fullName', fullName);
    if (role) localStorage.setItem('role', role);
  }

  saveSession(token: string, fullName: string, role?: string) {
    this.saveUser(token, undefined, fullName, role);
  }

  getToken(): string | null {
    return localStorage.getItem('token');
  }

  getFullName(): string | null {
    return localStorage.getItem('fullName');
  }

  isLoggedIn(): boolean {
    return !!this.getToken();
  }

  logout() {
    localStorage.clear();
  }
}
