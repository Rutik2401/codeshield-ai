import { Injectable, signal } from '@angular/core';
import { HistoryItem, ReviewResponse } from '../../models/review.model';

@Injectable({ providedIn: 'root' })
export class HistoryService {
  private readonly STORAGE_KEY = 'codeshield-history';
  history = signal<HistoryItem[]>(this.loadHistory());

  private loadHistory(): HistoryItem[] {
    const data = localStorage.getItem(this.STORAGE_KEY);
    if (!data) return [];
    return JSON.parse(data).map((item: HistoryItem) => ({
      ...item,
      createdAt: new Date(item.createdAt),
    }));
  }

  addReview(code: string, language: string, review: ReviewResponse): void {
    const item: HistoryItem = {
      id: crypto.randomUUID(),
      code,
      language,
      review,
      createdAt: new Date(),
    };
    const updated = [item, ...this.history()];
    this.history.set(updated);
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(updated));
  }

  deleteReview(id: string): void {
    const updated = this.history().filter(item => item.id !== id);
    this.history.set(updated);
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(updated));
  }

  clearHistory(): void {
    this.history.set([]);
    localStorage.removeItem(this.STORAGE_KEY);
  }

  getReview(id: string): HistoryItem | undefined {
    return this.history().find(item => item.id === id);
  }
}
