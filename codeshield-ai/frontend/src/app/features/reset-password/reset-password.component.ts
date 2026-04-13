import { Component, inject, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-reset-password',
  standalone: true,
  imports: [FormsModule, RouterLink],
  templateUrl: './reset-password.component.html',
})
export class ResetPasswordComponent {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private auth = inject(AuthService);

  token = '';
  newPassword = '';
  confirmPassword = '';
  showPassword = false;
  error = signal('');
  success = signal(false);
  isSubmitting = signal(false);

  constructor() {
    this.token = this.route.snapshot.queryParamMap.get('token') || '';
    if (!this.token) {
      this.error.set('Invalid reset link. Please request a new one.');
    }
  }

  submit(): void {
    this.error.set('');

    if (!this.newPassword || !this.confirmPassword) {
      this.error.set('Please fill in all fields.');
      return;
    }
    if (this.newPassword.length < 6) {
      this.error.set('Password must be at least 6 characters.');
      return;
    }
    if (this.newPassword !== this.confirmPassword) {
      this.error.set('Passwords do not match.');
      return;
    }

    this.isSubmitting.set(true);
    this.auth.resetPassword(this.token, this.newPassword).subscribe({
      next: () => {
        this.success.set(true);
        this.isSubmitting.set(false);
      },
      error: (err) => {
        this.error.set(err.error?.message || 'Failed to reset password. The link may have expired.');
        this.isSubmitting.set(false);
      },
    });
  }

  onFocus(event: Event): void {
    (event.target as HTMLElement).style.borderColor = 'var(--color-primary)';
    (event.target as HTMLElement).style.boxShadow = '0 0 0 3px rgba(99, 102, 241, 0.15)';
  }

  onBlur(event: Event): void {
    (event.target as HTMLElement).style.borderColor = 'var(--border-default)';
    (event.target as HTMLElement).style.boxShadow = 'none';
  }
}
