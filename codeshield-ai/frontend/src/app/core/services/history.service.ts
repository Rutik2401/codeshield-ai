import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { HistoryItem } from '../../models/review.model';
import { API_ENDPOINTS } from '../constants/api.constants';

@Injectable({ providedIn: 'root' })
export class HistoryService {
  private apiUrl = environment.apiUrl;
  history = signal<HistoryItem[]>([]);
  loading = signal(false);

  constructor(private http: HttpClient) {}

  fetchHistory(): void {
    this.loading.set(true);
    this.http.get<HistoryItem[]>(`${this.apiUrl}${API_ENDPOINTS.REVIEWS}`).subscribe({
      next: (items) => {
        this.history.set(items.map(item => ({
          ...item,
          createdAt: new Date(item.createdAt),
        })));
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
      },
    });
  }

  deleteReview(id: string): void {
    this.http.delete(`${this.apiUrl}${API_ENDPOINTS.REVIEWS}/${id}`).subscribe({
      next: () => {
        this.history.update(items => items.filter(item => item.id !== id));
      },
    });
  }

  clearHistory(): void {
    const ids = this.history().map(item => item.id);
    ids.forEach(id => {
      this.http.delete(`${this.apiUrl}${API_ENDPOINTS.REVIEWS}/${id}`).subscribe();
    });
    this.history.set([]);
  }

  getReview(id: string): HistoryItem | undefined {
    return this.history().find(item => item.id === id);
  }
}
