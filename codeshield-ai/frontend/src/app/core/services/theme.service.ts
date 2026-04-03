import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class ThemeService {
  init(): void {
    // Dark mode only — no toggle needed
    document.body.classList.add('dark');
  }
}
