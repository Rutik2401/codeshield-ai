import { Injectable, inject, signal } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { AuthService } from './auth.service';

export interface ConnectedRepo {
  id: string;
  githubRepoId: number;
  name: string;
  fullName: string;
  owner: string;
  defaultBranch: string;
  isPrivate: boolean;
  isActive: boolean;
  autoReview: boolean;
  createdAt: string;
}

export interface GitHubRepo {
  id: number;
  name: string;
  fullName: string;
  owner: string;
  defaultBranch: string;
  isPrivate: boolean;
  description: string;
  language: string;
  updatedAt: string;
  connected: boolean;
}

export interface PrReview {
  id: string;
  repositoryFullName: string;
  prNumber: number;
  prTitle: string;
  prAuthor: string;
  headSha: string;
  status: string;
  score: number;
  totalIssues: number;
  critical: number;
  high: number;
  medium: number;
  low: number;
  filesReviewed: number;
  githubReviewId: number;
  createdAt: string;
  completedAt: string;
}

@Injectable({ providedIn: 'root' })
export class RepositoryService {
  private apiUrl = `${environment.apiUrl}/repositories`;
  private http = inject(HttpClient);
  private auth = inject(AuthService);

  connectedRepos = signal<ConnectedRepo[]>([]);
  githubRepos = signal<GitHubRepo[]>([]);
  prReviews = signal<PrReview[]>([]);
  loading = signal(false);

  private ghHeaders(): HttpHeaders {
    const token = this.auth.getGitHubToken();
    return token ? new HttpHeaders({ 'X-GitHub-Token': token }) : new HttpHeaders();
  }

  fetchConnectedRepos(): void {
    this.loading.set(true);
    this.http.get<ConnectedRepo[]>(this.apiUrl).subscribe({
      next: (repos) => {
        this.connectedRepos.set(repos);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  fetchGitHubRepos(page = 1): void {
    this.loading.set(true);
    this.http.get<GitHubRepo[]>(`${this.apiUrl}/github?page=${page}`, { headers: this.ghHeaders() }).subscribe({
      next: (repos) => {
        this.githubRepos.set(repos);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  connectRepo(repo: GitHubRepo): void {
    const body = {
      githubRepoId: repo.id,
      name: repo.name,
      fullName: repo.fullName,
      owner: repo.owner,
      defaultBranch: repo.defaultBranch,
      isPrivate: repo.isPrivate,
    };
    this.http.post<ConnectedRepo>(`${this.apiUrl}/connect`, body, { headers: this.ghHeaders() }).subscribe({
      next: (connected) => {
        this.connectedRepos.update(repos => [connected, ...repos]);
        this.githubRepos.update(repos =>
          repos.map(r => r.id === repo.id ? { ...r, connected: true } : r)
        );
      },
    });
  }

  disconnectRepo(id: string): void {
    this.http.delete(`${this.apiUrl}/${id}`, { headers: this.ghHeaders() }).subscribe({
      next: () => {
        this.connectedRepos.update(repos => repos.filter(r => r.id !== id));
      },
    });
  }

  updateSettings(id: string, settings: { autoReview?: boolean; isActive?: boolean }): void {
    this.http.put<ConnectedRepo>(`${this.apiUrl}/${id}/settings`, settings).subscribe({
      next: (updated) => {
        this.connectedRepos.update(repos =>
          repos.map(r => r.id === id ? updated : r)
        );
      },
    });
  }

  fetchAllPrReviews(): void {
    this.loading.set(true);
    this.http.get<PrReview[]>(`${this.apiUrl}/pr-reviews`).subscribe({
      next: (reviews) => {
        this.prReviews.set(reviews);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  fetchRepoPrReviews(repoId: string): void {
    this.http.get<PrReview[]>(`${this.apiUrl}/${repoId}/pr-reviews`).subscribe({
      next: (reviews) => this.prReviews.set(reviews),
    });
  }

  triggerPrReview(repoId: string, prNumber: number): void {
    this.http.post<any>(`${this.apiUrl}/${repoId}/review-pr/${prNumber}`, {}).subscribe();
  }
}
