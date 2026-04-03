import { Component, inject } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { ThemeService } from '../../core/services/theme.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive],
  template: `
    <nav class="sticky top-0 z-50 glass border-b border-gray-200/50 dark:border-slate-700/30">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between items-center h-16">
          <!-- Logo -->
          <a routerLink="/" class="flex items-center gap-2.5 group">
            <div class="w-9 h-9 rounded-xl bg-gradient-to-br from-primary to-blue-700 flex items-center justify-center shadow-lg shadow-primary/20 group-hover:shadow-primary/40 transition-shadow">
              <svg class="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2L3 7v10l9 5 9-5V7l-9-5zm0 2.18l6.5 3.64v7.36L12 18.82l-6.5-3.64V7.82L12 4.18z"/>
                <path d="M12 8a1.5 1.5 0 00-1.5 1.5v3a1.5 1.5 0 003 0v-3A1.5 1.5 0 0012 8zm0 7a1 1 0 100 2 1 1 0 000-2z"/>
              </svg>
            </div>
            <span class="text-lg font-bold text-gray-900 dark:text-white tracking-tight">
              CodeShield <span class="text-primary">AI</span>
            </span>
          </a>

          <!-- Desktop Nav -->
          <div class="hidden md:flex items-center gap-1">
            @for (link of navLinks; track link.path) {
              <a [routerLink]="link.path"
                 routerLinkActive="!text-primary !bg-primary/8"
                 [routerLinkActiveOptions]="link.exact ? {exact: true} : {exact: false}"
                 class="px-4 py-2 rounded-lg text-sm font-medium text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100/60 dark:hover:bg-slate-800/60 transition-all">
                {{ link.label }}
              </a>
            }

            <!-- Divider -->
            <div class="w-px h-6 bg-gray-200 dark:bg-slate-700 mx-2"></div>

            <!-- Theme toggle -->
            <button (click)="theme.toggle()"
                    class="relative p-2.5 rounded-xl hover:bg-gray-100/60 dark:hover:bg-slate-800/60 transition-all group"
                    [title]="theme.isDark() ? 'Switch to light mode' : 'Switch to dark mode'">
              <div class="relative w-5 h-5 overflow-hidden">
                <!-- Sun icon -->
                <svg class="w-5 h-5 absolute inset-0 text-yellow-500 transition-all duration-500"
                     [style.transform]="theme.isDark() ? 'rotate(0deg) scale(1)' : 'rotate(90deg) scale(0)'"
                     [style.opacity]="theme.isDark() ? '1' : '0'"
                     fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" clip-rule="evenodd"/>
                </svg>
                <!-- Moon icon -->
                <svg class="w-5 h-5 absolute inset-0 text-gray-500 transition-all duration-500"
                     [style.transform]="theme.isDark() ? 'rotate(-90deg) scale(0)' : 'rotate(0deg) scale(1)'"
                     [style.opacity]="theme.isDark() ? '0' : '1'"
                     fill="currentColor" viewBox="0 0 20 20">
                  <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z"/>
                </svg>
              </div>
            </button>
          </div>

          <!-- Mobile menu button -->
          <button (click)="mobileMenuOpen = !mobileMenuOpen"
                  class="md:hidden p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors">
            <svg class="w-6 h-6 text-gray-600 dark:text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              @if (mobileMenuOpen) {
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
              } @else {
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"/>
              }
            </svg>
          </button>
        </div>

        <!-- Mobile Menu -->
        @if (mobileMenuOpen) {
          <div class="md:hidden pb-4 space-y-1 border-t border-gray-200/50 dark:border-slate-700/30 pt-3">
            @for (link of navLinks; track link.path) {
              <a [routerLink]="link.path" (click)="mobileMenuOpen = false"
                 routerLinkActive="!text-primary !bg-primary/8"
                 [routerLinkActiveOptions]="link.exact ? {exact: true} : {exact: false}"
                 class="block px-4 py-2.5 rounded-lg text-sm font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors">
                {{ link.label }}
              </a>
            }
            <button (click)="theme.toggle(); mobileMenuOpen = false"
                    class="w-full text-left px-4 py-2.5 rounded-lg text-sm font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors">
              {{ theme.isDark() ? 'Light Mode' : 'Dark Mode' }}
            </button>
          </div>
        }
      </div>
    </nav>
  `
})
export class NavbarComponent {
  theme = inject(ThemeService);
  mobileMenuOpen = false;

  navLinks = [
    { path: '/', label: 'Home', exact: true },
    { path: '/reviewer', label: 'Reviewer', exact: false },
    { path: '/dashboard', label: 'Dashboard', exact: false },
  ];
}
