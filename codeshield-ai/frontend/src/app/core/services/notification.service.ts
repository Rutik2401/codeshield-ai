import { Injectable, inject, signal, computed } from '@angular/core';
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
export class NotificationService {
  private apiUrl = `${environment.apiUrl}/notifications`;
  private http = inject(HttpClient);
  private auth = inject(AuthService);
  private pollInterval: ReturnType<typeof setInterval> | null = null;
  private isTabVisible = true;

  notifications = signal<AppNotification[]>([]);
  unreadCount = signal(0);
  showPanel = signal(false);
  latestToast = signal<AppNotification | null>(null);

  hasUnread = computed(() => this.unreadCount() > 0);

  startPolling(): void {
    if (this.pollInterval) return;

    // Listen for tab visibility changes — stop polling when tab is hidden
    document.addEventListener('visibilitychange', () => {
      this.isTabVisible = !document.hidden;
    });

    this.fetchNotifications();

    // Poll every 30s, only when tab is visible and user is logged in
    this.pollInterval = setInterval(() => {
      if (this.auth.isLoggedIn() && this.isTabVisible) {
        this.fetchUnreadCount();
      }
    }, 30000);
  }

  stopPolling(): void {
    if (this.pollInterval) {
      clearInterval(this.pollInterval);
      this.pollInterval = null;
    }
  }

  fetchNotifications(): void {
    if (!this.auth.isLoggedIn()) return;

    this.http.get<AppNotification[]>(this.apiUrl).subscribe({
      next: (items) => {
        const prevCount = this.unreadCount();
        this.notifications.set(items);
        const newUnread = items.filter(n => !n.isRead).length;
        this.unreadCount.set(newUnread);

        // Show toast only if unread count went up
        if (newUnread > prevCount && items.length > 0) {
          const newest = items.find(n => !n.isRead);
          if (newest) {
            this.latestToast.set(newest);
            setTimeout(() => this.latestToast.set(null), 6000);
          }
        }
      },
    });
  }

  fetchUnreadCount(): void {
    if (!this.auth.isLoggedIn()) return;

    this.http.get<{ count: number }>(`${this.apiUrl}/unread-count`).subscribe({
      next: (res) => {
        const prevCount = this.unreadCount();
        this.unreadCount.set(res.count);

        // Only fetch full list when there are new notifications
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
