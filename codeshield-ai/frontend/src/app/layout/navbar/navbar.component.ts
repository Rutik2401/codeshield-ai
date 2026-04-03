import { Component, inject, computed } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './navbar.component.html',
})
export class NavbarComponent {
  auth = inject(AuthService);

  mobileMenuOpen = false;
  showUserMenu = false;

  private router = inject(Router);

  navLinks = computed(() => {
    if (this.auth.isLoggedIn()) {
      return [
        { path: '/dashboard', label: 'Dashboard', exact: false },
        { path: '/reviewer', label: 'Reviewer', exact: false },
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
    this.showUserMenu = false;
    this.mobileMenuOpen = false;
    this.router.navigate(['/']);
  }
}
