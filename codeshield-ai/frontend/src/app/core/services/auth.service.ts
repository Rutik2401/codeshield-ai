import { inject, Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';

export interface User {
  id?: string;
  name: string;
  email: string;
  avatar?: string;
}

interface AuthResponse {
  token: string;
  refreshToken: string;
  user: { id: string; name: string; email: string; avatar: string };
  githubAccessToken?: string;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private apiUrl = `${environment.apiUrl}/auth`;
  private http = inject(HttpClient);

  isLoggedIn = signal(this.hasToken());
  currentUser = signal<User | null>(this.loadStoredUser());
  showAuthModal = signal(false);
  authTab = signal<'signin' | 'create'>('signin');
  toastMessage = signal<string | null>(null);

  private hasToken(): boolean {
    return !!localStorage.getItem('auth_token');
  }

  private loadStoredUser(): User | null {
    try {
      const raw = localStorage.getItem('auth_user');
      return raw ? JSON.parse(raw) : null;
    } catch { return null; }
  }

  openSignIn(): void {
    this.authTab.set('signin');
    this.showAuthModal.set(true);
  }

  openCreateAccount(): void {
    this.authTab.set('create');
    this.showAuthModal.set(true);
  }

  closeModal(): void {
    this.showAuthModal.set(false);
  }

  signIn(email: string, password: string): void {
    this.http.post<AuthResponse>(`${this.apiUrl}/signin`, { email, password }).subscribe({
      next: (res) => {
        this.storeAuth(res);
        this.showAuthModal.set(false);
        this.showToast(`Welcome back, ${res.user.name.split(' ')[0]}`);
      },
      error: (err) => {
        this.toastMessage.set(err.error?.message || 'Invalid credentials');
      },
    });
  }

  createAccount(name: string, email: string, password: string): void {
    this.http.post<AuthResponse>(`${this.apiUrl}/signup`, { name, email, password }).subscribe({
      next: (res) => {
        this.storeAuth(res);
        this.showAuthModal.set(false);
        this.showToast(`Welcome, ${res.user.name.split(' ')[0]}!`);
      },
      error: (err) => {
        this.toastMessage.set(err.error?.message || 'Could not create account');
      },
    });
  }

  googleSignIn(): void {
    this.http.get<{ url: string }>(`${this.apiUrl}/oauth2/google/url`)
      .subscribe({
        next: (res) => {
          this.showAuthModal.set(false);
          window.location.href = res.url;
        },
        error: () => {
          this.toastMessage.set('Google sign-in unavailable');
        },
      });
  }

  githubSignIn(): void {
    this.http.get<{ url: string }>(`${this.apiUrl}/oauth2/github/url`)
      .subscribe({
        next: (res) => {
          this.showAuthModal.set(false);
          window.location.href = res.url;
        },
        error: () => {
          this.toastMessage.set('GitHub sign-in unavailable');
        },
      });
  }

  getGitHubToken(): string | null {
    return localStorage.getItem('github_access_token');
  }

  handleOAuthResponse(res: any): void {
    this.storeAuth(res);
    this.showToast('Welcome!');
  }

  signOut(): void {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('auth_refresh_token');
    localStorage.removeItem('auth_user');
    this.currentUser.set(null);
    this.isLoggedIn.set(false);
  }

  private storeAuth(res: AuthResponse): void {
    localStorage.setItem('auth_token', res.token);
    localStorage.setItem('auth_refresh_token', res.refreshToken);
    localStorage.setItem('auth_user', JSON.stringify(res.user));
    if (res.githubAccessToken) {
      localStorage.setItem('github_access_token', res.githubAccessToken);
    }
    this.currentUser.set(res.user);
    this.isLoggedIn.set(true);
  }

  private showToast(message: string): void {
    this.toastMessage.set(message);
    setTimeout(() => this.toastMessage.set(null), 3000);
  }
}
