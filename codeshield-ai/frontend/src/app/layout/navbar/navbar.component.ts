import { Component, inject, computed, HostListener } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { NotificationService } from '../../core/services/notification.service';
import { TimeAgoPipe } from '../../shared/pipes/time-ago.pipe';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, TimeAgoPipe],
  templateUrl: './navbar.component.html',
  styles: [`
    @keyframes slideUp {
      from { opacity: 0; transform: translateY(20px); }
      to { opacity: 1; transform: translateY(0); }
    }
  `],
})
export class NavbarComponent {
  auth = inject(AuthService);
  notif = inject(NotificationService);

  mobileMenuOpen = false;
  showUserMenu = false;

  private router = inject(Router);

  navLinks = computed(() => {
    if (this.auth.isLoggedIn()) {
      return [
        { path: '/dashboard', label: 'Dashboard', exact: false },
        { path: '/reviewer', label: 'Reviewer', exact: false },
        { path: '/repositories', label: 'Repos', exact: false },
        { path: '/pr-reviews', label: 'PR Reviews', exact: false },
      ];
    }

    return [
      { label: 'Features', fragment: 'features' },
      { label: 'How It Works', fragment: 'how-it-works' },
      { path: '/pricing', label: 'Pricing', exact: false },
    ];
  });

  scrollTo(id: string): void {
    this.closeMobileMenu();

    const isHome = this.router.url === '/' || this.router.url.startsWith('/#');
    if (isHome) {
      document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
    } else {
      this.router.navigate(['/'], { fragment: id }).then(() => {
        setTimeout(() => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' }), 300);
      });
    }
  }

  closeMobileMenu(): void {
    this.mobileMenuOpen = false;
  }

  signOut(): void {
    this.auth.signOut();
    this.notif.stopPolling();
    this.showUserMenu = false;
    this.mobileMenuOpen = false;
    this.router.navigate(['/']);
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: Event): void {
    const target = event.target as HTMLElement;
    if (!target.closest('.notif-panel') && !target.closest('.notif-bell')) {
      this.notif.closePanel();
    }
  }

  constructor() {
    if (this.auth.isLoggedIn()) {
      this.notif.startPolling();
    }
  }
}
