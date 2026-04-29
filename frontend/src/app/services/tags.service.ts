import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class TagsService {
  private apiUrl = 'http://localhost:8000/api';

  constructor(private http: HttpClient) {}

  getTags(userId: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/tags/?user_id=${userId}`);
  }

  createTag(tagData: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/tags/create/`, tagData);
  }

  deleteTag(tagId: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/tags/${tagId}/delete/`);
  }
}
