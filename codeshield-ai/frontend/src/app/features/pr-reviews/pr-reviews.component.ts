import { Component, inject, computed } from '@angular/core';
import { RepositoryService } from '../../core/services/repository.service';
import { ScoreCircleComponent } from '../../shared/components/score-circle/score-circle.component';
import { TimeAgoPipe } from '../../shared/pipes/time-ago.pipe';

@Component({
  selector: 'app-pr-reviews',
  standalone: true,
  imports: [ScoreCircleComponent, TimeAgoPipe],
  templateUrl: './pr-reviews.component.html',
})
export class PrReviewsComponent {
  repoService = inject(RepositoryService);

  constructor() {
    this.repoService.fetchAllPrReviews();
  }

  stats = computed(() => {
    const reviews = this.repoService.prReviews();
    const completed = reviews.filter(r => r.status === 'COMPLETED');
    const avgScore = completed.length > 0
      ? Math.round(completed.reduce((sum, r) => sum + r.score, 0) / completed.length)
      : 0;
    const totalIssues = completed.reduce((sum, r) => sum + r.totalIssues, 0);
    const criticalIssues = completed.reduce((sum, r) => sum + r.critical, 0);
    return { total: reviews.length, completed: completed.length, avgScore, totalIssues, criticalIssues };
  });

  statusColor(status: string): string {
    switch (status) {
      case 'COMPLETED': return '#22c55e';
      case 'IN_PROGRESS': return '#3b82f6';
      case 'FAILED': return '#ef4444';
      default: return '#94a3b8';
    }
  }
}
