import { Component, inject, computed } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './navbar.component.html'
})
export class NavbarComponent {
  auth = inject(AuthService);
  private router = inject(Router);
  mobileMenuOpen = false;
  showUserMenu = false;

  navLinks = computed(() => {
    if (this.auth.isLoggedIn()) {
      return [
        { path: '/dashboard', label: 'Dashboard', exact: false },
        { path: '/reviewer', label: 'Reviewer', exact: false },
        { path: '/pricing', label: 'Pricing', exact: false },
      ];
    }
    return [
      { path: '/', label: 'Home', exact: true },
      { path: '/pricing', label: 'Pricing', exact: false },
    ];
  });

  signOut(): void {
    this.auth.signOut();
    this.showUserMenu = false;
    this.mobileMenuOpen = false;
    this.router.navigate(['/']);
  }
}
