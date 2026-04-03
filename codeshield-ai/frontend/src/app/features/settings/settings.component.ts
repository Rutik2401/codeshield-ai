import { Component, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../core/services/auth.service';
import { HistoryService } from '../../core/services/history.service';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [FormsModule, RouterLink],
  templateUrl: './settings.component.html',
})
export class SettingsComponent {
  auth = inject(AuthService);
  private history = inject(HistoryService);
  private router = inject(Router);

  name = this.auth.currentUser()?.name ?? '';
  email = this.auth.currentUser()?.email ?? '';
  saved = signal(false);

  totalReviews = this.history.history().length;

  saveProfile(): void {
    const user = this.auth.currentUser();
    if (!user || !this.name.trim()) return;

    const updated = {
      ...user,
      name: this.name.trim(),
      avatar: this.name.trim().split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2),
    };
    localStorage.setItem('codeshield-user', JSON.stringify(updated));
    this.auth.currentUser.set(updated);

    this.saved.set(true);
    setTimeout(() => this.saved.set(false), 2000);
  }

  signOut(): void {
    this.auth.signOut();
    this.router.navigate(['/']);
  }
}
