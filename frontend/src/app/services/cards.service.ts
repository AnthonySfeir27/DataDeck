import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CardsService {
  private apiUrl = 'http://localhost:8000/api';

  constructor(private http: HttpClient) {}

  getCards(userId: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/cards/?user_id=${userId}`);
  }

  createCard(cardData: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/cards/create/`, cardData);
  }

  updateCard(cardId: string, cardData: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/cards/${cardId}/update/`, cardData);
  }

  deleteCard(cardId: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/cards/${cardId}/delete/`);
  }
}
