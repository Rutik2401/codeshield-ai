import { Injectable, signal } from '@angular/core';

export interface User {
  name: string;
  email: string;
  avatar?: string;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  isLoggedIn = signal(this.loadUser() !== null);
  currentUser = signal<User | null>(this.loadUser());
  showAuthModal = signal(false);
  authTab = signal<'signin' | 'create'>('signin');
  toastMessage = signal<string | null>(null);

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

  signIn(email: string, _password: string): { success: boolean; error?: string } {
    const users = this.getStoredUsers();
    const user = users.find(u => u.email === email);
    if (!user) return { success: false, error: 'No account found with this email.' };

    this.setUser(user);
    this.showToast(`Welcome back, ${user.name.split(' ')[0]}`);
    return { success: true };
  }

  createAccount(name: string, email: string, _password: string): { success: boolean; error?: string } {
    const users = this.getStoredUsers();
    if (users.find(u => u.email === email)) {
      return { success: false, error: 'An account with this email already exists.' };
    }

    const user: User = {
      name,
      email,
      avatar: name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2),
    };
    users.push(user);
    localStorage.setItem('codeshield-users', JSON.stringify(users));
    this.setUser(user);
    this.showToast(`Welcome, ${user.name.split(' ')[0]}!`);
    return { success: true };
  }

  signOut(): void {
    localStorage.removeItem('codeshield-user');
    this.currentUser.set(null);
    this.isLoggedIn.set(false);
  }

  private showToast(message: string): void {
    this.toastMessage.set(message);
    setTimeout(() => this.toastMessage.set(null), 3000);
  }

  private setUser(user: User): void {
    localStorage.setItem('codeshield-user', JSON.stringify(user));
    this.currentUser.set(user);
    this.isLoggedIn.set(true);
    this.showAuthModal.set(false);
  }

  private loadUser(): User | null {
    try {
      const raw = localStorage.getItem('codeshield-user');
      return raw ? JSON.parse(raw) : null;
    } catch { return null; }
  }

  private getStoredUsers(): User[] {
    try {
      const raw = localStorage.getItem('codeshield-users');
      return raw ? JSON.parse(raw) : [];
    } catch { return []; }
  }
}
