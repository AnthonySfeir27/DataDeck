import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class WelcomeService {
  private apiUrl = 'http://localhost:8000/api';

  constructor(private http: HttpClient) {}

  getWelcomeMessage(): Observable<any> {
    return this.http.get(`${this.apiUrl}/welcome/`);
  }
}
