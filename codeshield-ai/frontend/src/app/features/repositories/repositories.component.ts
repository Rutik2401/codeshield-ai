import { Component, inject, signal, computed } from '@angular/core';
import { RouterLink } from '@angular/router';
import { RepositoryService, ConnectedRepo, GitHubRepo } from '../../core/services/repository.service';
import { AuthService } from '../../core/services/auth.service';
import { TimeAgoPipe } from '../../shared/pipes/time-ago.pipe';

@Component({
  selector: 'app-repositories',
  standalone: true,
  imports: [RouterLink, TimeAgoPipe],
  templateUrl: './repositories.component.html',
})
export class RepositoriesComponent {
  repoService = inject(RepositoryService);
  auth = inject(AuthService);

  activeTab = signal<'connected' | 'browse'>('connected');
  hasGitHub = computed(() => !!this.auth.getGitHubToken());

  constructor() {
    this.repoService.fetchConnectedRepos();
  }

  switchTab(tab: 'connected' | 'browse'): void {
    this.activeTab.set(tab);
    if (tab === 'browse' && this.repoService.githubRepos().length === 0) {
      this.repoService.fetchGitHubRepos();
    }
  }

  connect(repo: GitHubRepo): void {
    this.repoService.connectRepo(repo);
  }

  disconnect(id: string): void {
    this.repoService.disconnectRepo(id);
  }

  toggleAutoReview(repo: ConnectedRepo): void {
    this.repoService.updateSettings(repo.id, { autoReview: !repo.autoReview });
  }

  toggleActive(repo: ConnectedRepo): void {
    this.repoService.updateSettings(repo.id, { isActive: !repo.isActive });
  }
}
