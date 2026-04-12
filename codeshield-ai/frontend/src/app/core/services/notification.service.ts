import { Injectable, inject, signal, computed, OnDestroy } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { AuthService } from './auth.service';

export interface AppNotification {
  id: string;
  type: string;
  title: string;
  message: string;
  link: string;
  isRead: boolean;
  createdAt: string;
}

@Injectable({ providedIn: 'root' })
export class NotificationService implements OnDestroy {
  private apiUrl = `${environment.apiUrl}/notifications`;
  private http = inject(HttpClient);
  private auth = inject(AuthService);
  private pollInterval: ReturnType<typeof setInterval> | null = null;

  notifications = signal<AppNotification[]>([]);
  unreadCount = signal(0);
  showPanel = signal(false);
  latestToast = signal<AppNotification | null>(null);

  hasUnread = computed(() => this.unreadCount() > 0);

  startPolling(): void {
    if (this.pollInterval) return;
    this.fetchNotifications();
    this.pollInterval = setInterval(() => {
      if (this.auth.isLoggedIn()) {
        this.fetchUnreadCount();
      }
    }, 10000);
  }

  stopPolling(): void {
    if (this.pollInterval) {
      clearInterval(this.pollInterval);
      this.pollInterval = null;
    }
  }

  ngOnDestroy(): void {
    this.stopPolling();
  }

  fetchNotifications(): void {
    this.http.get<AppNotification[]>(this.apiUrl).subscribe({
      next: (items) => {
        const prev = this.notifications();
        this.notifications.set(items);
        this.unreadCount.set(items.filter(n => !n.isRead).length);

        // Show toast for new unread notifications
        if (prev.length > 0 && items.length > prev.length) {
          const newest = items[0];
          if (!newest.isRead) {
            this.latestToast.set(newest);
            setTimeout(() => this.latestToast.set(null), 6000);
          }
        }
      },
    });
  }

  fetchUnreadCount(): void {
    this.http.get<{ count: number }>(`${this.apiUrl}/unread-count`).subscribe({
      next: (res) => {
        const prevCount = this.unreadCount();
        this.unreadCount.set(res.count);

        // If count increased, fetch full list to get the new notification for toast
        if (res.count > prevCount) {
          this.fetchNotifications();
        }
      },
    });
  }

  togglePanel(): void {
    this.showPanel.update(v => !v);
    if (this.showPanel()) {
      this.fetchNotifications();
    }
  }

  closePanel(): void {
    this.showPanel.set(false);
  }

  markAllAsRead(): void {
    this.http.post(`${this.apiUrl}/mark-all-read`, {}).subscribe({
      next: () => {
        this.notifications.update(items => items.map(n => ({ ...n, isRead: true })));
        this.unreadCount.set(0);
      },
    });
  }

  markAsRead(id: string): void {
    this.http.post(`${this.apiUrl}/${id}/read`, {}).subscribe({
      next: () => {
        this.notifications.update(items =>
          items.map(n => n.id === id ? { ...n, isRead: true } : n)
        );
        this.unreadCount.update(c => Math.max(0, c - 1));
      },
    });
  }

  deleteNotification(id: string): void {
    this.http.delete(`${this.apiUrl}/${id}`).subscribe({
      next: () => {
        const item = this.notifications().find(n => n.id === id);
        this.notifications.update(items => items.filter(n => n.id !== id));
        if (item && !item.isRead) {
          this.unreadCount.update(c => Math.max(0, c - 1));
        }
      },
    });
  }

  clearAll(): void {
    this.http.delete(this.apiUrl).subscribe({
      next: () => {
        this.notifications.set([]);
        this.unreadCount.set(0);
      },
    });
  }
}
