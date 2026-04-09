import { Component, OnInit, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../../core/services/auth.service';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-oauth-callback',
  standalone: true,
  template: `
    <div class="min-h-screen flex items-center justify-center" style="background-color: var(--bg-primary);">
      <div class="text-center">
        <div class="w-12 h-12 mx-auto mb-4 rounded-full border-2 border-primary border-t-transparent animate-spin"></div>
        <p class="text-sm" style="color: var(--text-secondary);">Completing sign in...</p>
      </div>
    </div>
  `,
})
export class OAuthCallbackComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private http = inject(HttpClient);
  private auth = inject(AuthService);

  ngOnInit(): void {
    const code = this.route.snapshot.queryParamMap.get('code');
    const provider = this.route.snapshot.queryParamMap.get('provider') || 'google';

    if (!code) {
      this.router.navigate(['/']);
      return;
    }

    const callbackUrl = provider === 'github'
      ? `${environment.apiUrl}/auth/oauth2/github/callback`
      : `${environment.apiUrl}/auth/oauth2/google/callback`;

    this.http.post<any>(callbackUrl, { code })
      .subscribe({
        next: (res) => {
          this.auth.handleOAuthResponse(res);
          this.router.navigate(['/dashboard']);
        },
        error: () => {
          this.router.navigate(['/']);
        },
      });
  }
}
