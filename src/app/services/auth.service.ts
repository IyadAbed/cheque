import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private apiUrl = 'https://your-api-url.com/auth'; // Replace with your actual API

  constructor(private http: HttpClient, private router: Router) {}

  // User Login
  login(credentials: { email: string; password: string }): Observable<any> {
    return this.http.post(`${this.apiUrl}/login`, credentials);
  }

  // User Logout
  logout(): void {
    localStorage.removeItem('token');
    this.router.navigate(['/login']);
  }

  // Check if the user is authenticated
  isAuthenticated(): boolean {
    const token = localStorage.getItem('token');
    return !!token;
  }

  // Fetch current user info
  getCurrentUser(): Observable<any> {
    return this.http.get(`${this.apiUrl}/me`);
  }

  // Save JWT token
  saveToken(token: string): void {
    localStorage.setItem('token', token);
  }

  // Get JWT token
  getToken(): string | null {
    return localStorage.getItem('token');
  }
}
