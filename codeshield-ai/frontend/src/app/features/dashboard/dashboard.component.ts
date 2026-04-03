import { Component, inject, computed, AfterViewInit, OnDestroy, ElementRef, ViewChild } from '@angular/core';
import { RouterLink } from '@angular/router';
import { HistoryService } from '../../core/services/history.service';
import { ScoreCircleComponent } from '../../shared/components/score-circle/score-circle.component';
import { TimeAgoPipe } from '../../shared/pipes/time-ago.pipe';
import { FormsModule } from '@angular/forms';
import { AnimationService } from '../../core/services/animation.service';
import { gsap } from 'gsap';
import { BaseChartDirective } from 'ng2-charts';
import { ChartConfiguration } from 'chart.js';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [RouterLink, ScoreCircleComponent, TimeAgoPipe, FormsModule, BaseChartDirective],
  templateUrl: './dashboard.component.html'
})
export class DashboardComponent implements AfterViewInit, OnDestroy {
  historyService = inject(HistoryService);
  private anim = inject(AnimationService);
  searchQuery = '';

  @ViewChild('pageHeader', { static: true }) pageHeader!: ElementRef;
  @ViewChild('statsGrid', { static: true }) statsGrid!: ElementRef;
  @ViewChild('chartsSection', { static: true }) chartsSection!: ElementRef;
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

  // Score trend line chart
  scoreTrendConfig = computed<ChartConfiguration<'line'>>(() => {
    const history = this.historyService.history().slice().reverse(); // oldest first
    return {
      type: 'line',
      data: {
        labels: history.map((_, i) => `#${i + 1}`),
        datasets: [{
          data: history.map(h => h.review.score),
          borderColor: '#3B82F6',
          backgroundColor: 'rgba(59, 130, 246, 0.1)',
          fill: true,
          tension: 0.4,
          pointBackgroundColor: '#3B82F6',
          pointRadius: 4,
          pointHoverRadius: 6,
        }],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: {
            backgroundColor: '#1E293B',
            titleColor: '#F8FAFC',
            bodyColor: '#94A3B8',
            borderColor: '#334155',
            borderWidth: 1,
          },
        },
        scales: {
          x: { grid: { color: 'rgba(51,65,85,0.3)' }, ticks: { color: '#64748B', font: { size: 11 } } },
          y: { min: 0, max: 100, grid: { color: 'rgba(51,65,85,0.3)' }, ticks: { color: '#64748B', font: { size: 11 } } },
        },
      },
    };
  });

  // Severity doughnut chart
  severityConfig = computed<ChartConfiguration<'doughnut'>>(() => {
    const h = this.historyService.history();
    const critical = h.reduce((s, i) => s + i.review.metrics.critical, 0);
    const high = h.reduce((s, i) => s + i.review.metrics.high, 0);
    const medium = h.reduce((s, i) => s + i.review.metrics.medium, 0);
    const low = h.reduce((s, i) => s + i.review.metrics.low, 0);
    return {
      type: 'doughnut',
      data: {
        labels: ['Critical', 'High', 'Medium', 'Low'],
        datasets: [{
          data: [critical, high, medium, low],
          backgroundColor: ['#EF4444', '#F97316', '#EAB308', '#3B82F6'],
          borderColor: '#0F172A',
          borderWidth: 3,
        }],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        cutout: '65%',
        plugins: {
          legend: {
            position: 'bottom',
            labels: { color: '#94A3B8', padding: 16, font: { size: 12 }, usePointStyle: true, pointStyleWidth: 8 },
          },
          tooltip: {
            backgroundColor: '#1E293B',
            titleColor: '#F8FAFC',
            bodyColor: '#94A3B8',
            borderColor: '#334155',
            borderWidth: 1,
          },
        },
      },
    };
  });

  // Language bar chart
  languageConfig = computed<ChartConfiguration<'bar'>>(() => {
    const counts: Record<string, number> = {};
    this.historyService.history().forEach(h => {
      counts[h.language] = (counts[h.language] || 0) + 1;
    });
    const sorted = Object.entries(counts).sort((a, b) => b[1] - a[1]).slice(0, 6);
    return {
      type: 'bar',
      data: {
        labels: sorted.map(([lang]) => lang),
        datasets: [{
          data: sorted.map(([, count]) => count),
          backgroundColor: ['#3B82F6', '#6366F1', '#8B5CF6', '#22C55E', '#EAB308', '#F97316'],
          borderRadius: 8,
          borderSkipped: false,
        }],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        indexAxis: 'y',
        plugins: {
          legend: { display: false },
          tooltip: {
            backgroundColor: '#1E293B',
            titleColor: '#F8FAFC',
            bodyColor: '#94A3B8',
            borderColor: '#334155',
            borderWidth: 1,
          },
        },
        scales: {
          x: { grid: { color: 'rgba(51,65,85,0.3)' }, ticks: { color: '#64748B', stepSize: 1 } },
          y: { grid: { display: false }, ticks: { color: '#94A3B8', font: { size: 12 } } },
        },
      },
    };
  });

  hasChartData = computed(() => this.historyService.history().length > 0);

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

    // Charts section
    if (this.chartsSection) {
      this.anim.fadeInUp(this.chartsSection.nativeElement, {
        trigger: this.chartsSection.nativeElement,
        delay: 0.15,
      });
    }

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
