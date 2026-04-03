import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ReviewResponse } from '../../models/review.model';
import { API_ENDPOINTS } from '../constants/api.constants';

@Injectable({ providedIn: 'root' })
export class GeminiService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  reviewCode(code: string, language: string): Observable<ReviewResponse> {
    return this.http.post<ReviewResponse>(`${this.apiUrl}${API_ENDPOINTS.REVIEW}`, {
      code,
      language
    });
  }
}
