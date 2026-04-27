import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = 'http://localhost:8000/api';
  private currentUser: any = null;

  constructor(private http: HttpClient) {
    const storedUser = localStorage.getItem('currentUser');
    if (storedUser) {
      this.currentUser = JSON.parse(storedUser);
    }
  }

  signup(username: string, email: string, password: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/signup/`, { username, email, password }).pipe(
      tap((response: any) => {
        this.currentUser = response.user;
        localStorage.setItem('currentUser', JSON.stringify(response.user));
      })
    );
  }

  login(usernameOrEmail: string, password: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/login/`, { username_or_email: usernameOrEmail, password }).pipe(
      tap((response: any) => {
        this.currentUser = response.user;
        localStorage.setItem('currentUser', JSON.stringify(response.user));
      })
    );
  }

  logout(): void {
    this.currentUser = null;
    localStorage.removeItem('currentUser');
  }

  getCurrentUser(): any {
    return this.currentUser;
  }

  isLoggedIn(): boolean {
    return this.currentUser !== null;
  }
}
