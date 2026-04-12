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

  activeTab = signal<'connected' | 'browse' | 'open-prs'>('connected');
  selectedRepoId = signal<string | null>(null);
  selectedRepoName = signal<string>('');
  hasGitHub = computed(() => !!this.auth.getGitHubToken());

  constructor() {
    this.repoService.fetchConnectedRepos();
  }

  switchTab(tab: 'connected' | 'browse' | 'open-prs'): void {
    this.activeTab.set(tab);
    if (tab === 'browse' && this.repoService.githubRepos().length === 0) {
      this.repoService.fetchGitHubRepos();
    }
  }

  showOpenPrs(repo: { id: string; fullName: string }): void {
    this.selectedRepoId.set(repo.id);
    this.selectedRepoName.set(repo.fullName);
    this.activeTab.set('open-prs');
    this.repoService.fetchOpenPrs(repo.id);
  }

  reviewOpenPr(prNumber: number): void {
    const repoId = this.selectedRepoId();
    if (repoId) {
      this.repoService.triggerPrReview(repoId, prNumber);
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

  triggerReview(repo: ConnectedRepo): void {
    const input = document.getElementById('pr-' + repo.id) as HTMLInputElement;
    const prNumber = parseInt(input?.value, 10);
    if (!prNumber || prNumber < 1) return;
    this.repoService.triggerPrReview(repo.id, prNumber);
    input.value = '';
  }
}
