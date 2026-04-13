import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./features/landing/landing.component').then(m => m.LandingComponent),
  },
  {
    path: 'pricing',
    loadComponent: () => import('./features/pricing/pricing.component').then(m => m.PricingComponent),
  },
  {
    path: 'reviewer',
    canActivate: [authGuard],
    loadComponent: () => import('./features/reviewer/reviewer.component').then(m => m.ReviewerComponent),
  },
  {
    path: 'dashboard',
    canActivate: [authGuard],
    loadComponent: () => import('./features/dashboard/dashboard.component').then(m => m.DashboardComponent),
  },
  {
    path: 'repositories',
    canActivate: [authGuard],
    loadComponent: () => import('./features/repositories/repositories.component').then(m => m.RepositoriesComponent),
  },
  {
    path: 'repositories/:id/reviews',
    canActivate: [authGuard],
    loadComponent: () => import('./features/pr-reviews/pr-reviews.component').then(m => m.PrReviewsComponent),
  },
  {
    path: 'pr-reviews',
    canActivate: [authGuard],
    loadComponent: () => import('./features/pr-reviews/pr-reviews.component').then(m => m.PrReviewsComponent),
  },
  {
    path: 'settings',
    canActivate: [authGuard],
    loadComponent: () => import('./features/settings/settings.component').then(m => m.SettingsComponent),
  },
  {
    path: 'learn',
    canActivate: [authGuard],
    loadComponent: () => import('./features/learn/learn.component').then(m => m.LearnComponent),
  },
  {
    path: 'reset-password',
    loadComponent: () => import('./features/reset-password/reset-password.component').then(m => m.ResetPasswordComponent),
  },
  {
    path: 'oauth-callback',
    loadComponent: () => import('./features/oauth-callback/oauth-callback.component').then(m => m.OAuthCallbackComponent),
  },
  { path: '**', redirectTo: '' }
];
