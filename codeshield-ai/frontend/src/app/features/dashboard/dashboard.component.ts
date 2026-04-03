import { Component, inject, computed, AfterViewInit, OnDestroy, ElementRef, ViewChild } from '@angular/core';
import { RouterLink } from '@angular/router';
import { HistoryService } from '../../core/services/history.service';
import { ScoreCircleComponent } from '../../shared/components/score-circle/score-circle.component';
import { TimeAgoPipe } from '../../shared/pipes/time-ago.pipe';
import { FormsModule } from '@angular/forms';
import { AnimationService } from '../../core/services/animation.service';
import { gsap } from 'gsap';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [RouterLink, ScoreCircleComponent, TimeAgoPipe, FormsModule],
  templateUrl: './dashboard.component.html'
})
export class DashboardComponent implements AfterViewInit, OnDestroy {
  historyService = inject(HistoryService);
  private anim = inject(AnimationService);
  searchQuery = '';

  @ViewChild('pageHeader', { static: true }) pageHeader!: ElementRef;
  @ViewChild('statsGrid', { static: true }) statsGrid!: ElementRef;
  @ViewChild('historySection', { static: true }) historySection!: ElementRef;

  totalReviews = computed(() => this.historyService.history().length);

  avgScore = computed(() => {
    const h = this.historyService.history();
    if (!h.length) return 0;
    return Math.round(h.reduce((sum, item) => sum + item.review.score, 0) / h.length);
  });

  totalCritical = computed(() =>
    this.historyService.history().reduce((sum, item) => sum + item.review.metrics.critical, 0)
  );

  totalIssues = computed(() =>
    this.historyService.history().reduce((sum, item) => sum + item.review.metrics.totalIssues, 0)
  );

  statsCards = computed(() => [
    {
      label: 'Total Reviews',
      value: this.totalReviews(),
      icon: '\uD83D\uDCCB',
      iconBg: 'bg-primary/10',
      color: '#2563EB',
      sub: 'All time reviews',
    },
    {
      label: 'Avg Score',
      value: this.avgScore(),
      icon: '\uD83C\uDFAF',
      iconBg: this.avgScore() >= 70 ? 'bg-green-500/10' : 'bg-orange-500/10',
      color: this.avgScore() >= 70 ? '#10B981' : '#F97316',
      sub: this.avgScore() >= 70 ? 'Good quality' : 'Needs improvement',
    },
    {
      label: 'Critical Issues',
      value: this.totalCritical(),
      icon: '\u26A0\uFE0F',
      iconBg: 'bg-red-500/10',
      color: '#EF4444',
      sub: 'Requires attention',
    },
    {
      label: 'Total Issues',
      value: this.totalIssues(),
      icon: '\uD83D\uDD0D',
      iconBg: 'bg-violet-500/10',
      color: '#8B5CF6',
      sub: 'Across all reviews',
    },
  ]);

  filteredHistory = computed(() => {
    const q = this.searchQuery.toLowerCase();
    if (!q) return this.historyService.history();
    return this.historyService.history().filter(item =>
      item.language.toLowerCase().includes(q) ||
      item.review.summary.toLowerCase().includes(q)
    );
  });

  ngAfterViewInit(): void {
    // Animate page header
    this.anim.fadeInUp(this.pageHeader.nativeElement, { duration: 0.6 });

    // Stagger stat cards
    this.anim.staggerCards(this.statsGrid.nativeElement, '.stat-card', { stagger: 0.1 });

    // History section
    this.anim.fadeInUp(this.historySection.nativeElement, {
      trigger: this.historySection.nativeElement,
      delay: 0.2,
    });

    this.anim.refreshScrollTriggers();
  }

  ngOnDestroy(): void {
    this.anim.cleanupScrollTriggers();
  }

  deleteReview(id: string): void {
    this.historyService.deleteReview(id);
  }

  clearAll(): void {
    this.historyService.clearHistory();
  }
}
