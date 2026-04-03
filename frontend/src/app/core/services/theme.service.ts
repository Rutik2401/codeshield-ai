import { Injectable, signal } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class ThemeService {
  isDark = signal(this.getStoredTheme());

  private getStoredTheme(): boolean {
    const stored = localStorage.getItem('codeshield-theme');
    if (stored) return stored === 'dark';
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  }

  toggle(): void {
    this.isDark.update(v => !v);
    this.applyTheme();
    localStorage.setItem('codeshield-theme', this.isDark() ? 'dark' : 'light');
  }

  applyTheme(): void {
    document.body.classList.toggle('dark', this.isDark());
  }

  init(): void {
    this.applyTheme();
  }
}
