import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-auth-modal',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './auth-modal.component.html',
  styles: [`
    @keyframes fadeIn {
      from { opacity: 0; }
      to { opacity: 1; }
    }
    @keyframes scaleIn {
      from { opacity: 0; transform: scale(0.95) translateY(10px); }
      to { opacity: 1; transform: scale(1) translateY(0); }
    }
  `]
})
export class AuthModalComponent {
  auth = inject(AuthService);
  private router = inject(Router);

  name = '';
  email = '';
  password = '';
  confirmPassword = '';
  showPassword = false;
  agreeTerms = false;
  error = '';
  isSubmitting = false;

  submit(): void {
    this.error = '';

    if (!this.email || !this.password) {
      this.error = 'Please fill in all fields.';
      return;
    }

    if (this.auth.authTab() === 'create') {
      if (!this.name) { this.error = 'Please enter your name.'; return; }
      if (this.password !== this.confirmPassword) { this.error = 'Passwords do not match.'; return; }
      if (this.password.length < 6) { this.error = 'Password must be at least 6 characters.'; return; }
      if (!this.agreeTerms) { this.error = 'You must agree to the terms.'; return; }

      this.isSubmitting = true;
      setTimeout(() => {
        const result = this.auth.createAccount(this.name, this.email, this.password);
        this.isSubmitting = false;
        if (!result.success) { this.error = result.error!; }
        else { this.resetForm(); this.router.navigate(['/dashboard']); }
      }, 800);
    } else {
      this.isSubmitting = true;
      setTimeout(() => {
        const result = this.auth.signIn(this.email, this.password);
        this.isSubmitting = false;
        if (!result.success) { this.error = result.error!; }
        else { this.resetForm(); this.router.navigate(['/dashboard']); }
      }, 600);
    }
  }

  googleSignIn(): void {
    this.isSubmitting = true;
    setTimeout(() => {
      this.auth.createAccount('Google User', 'user@gmail.com', 'google-oauth');
      this.isSubmitting = false;
      this.resetForm();
      this.router.navigate(['/dashboard']);
    }, 800);
  }

  onFocus(event: Event): void {
    (event.target as HTMLElement).style.borderColor = 'var(--color-primary)';
    (event.target as HTMLElement).style.boxShadow = '0 0 0 3px rgba(99, 102, 241, 0.15)';
  }

  onBlur(event: Event): void {
    (event.target as HTMLElement).style.borderColor = 'var(--border-default)';
    (event.target as HTMLElement).style.boxShadow = 'none';
  }

  private resetForm(): void {
    this.name = '';
    this.email = '';
    this.password = '';
    this.confirmPassword = '';
    this.agreeTerms = false;
    this.error = '';
  }
}
