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
  template: `
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <!-- Page header -->
      <div class="mb-10" #pageHeader>
        <h1 class="text-3xl font-bold text-gray-900 dark:text-white">Dashboard</h1>
        <p class="text-gray-500 dark:text-gray-400 mt-1 text-sm">Track your code review history and quality trends</p>
      </div>

      <!-- Stats Cards -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 mb-10" #statsGrid>
        @for (stat of statsCards(); track stat.label) {
          <div class="stat-card glass-card rounded-2xl p-6 group cursor-default">
            <div class="flex items-center justify-between mb-3">
              <p class="text-sm font-medium text-gray-500 dark:text-gray-400">{{ stat.label }}</p>
              <div class="w-10 h-10 rounded-xl flex items-center justify-center transition-transform duration-300 group-hover:scale-110"
                   [class]="stat.iconBg">
                <span class="text-lg">{{ stat.icon }}</span>
              </div>
            </div>
            <p class="text-4xl font-bold tracking-tight" [style.color]="stat.color">
              {{ stat.value }}
            </p>
            <p class="text-xs text-gray-400 dark:text-gray-500 mt-2">{{ stat.sub }}</p>
          </div>
        }
      </div>

      <!-- Review History -->
      <div class="glass-card rounded-2xl overflow-hidden" #historySection>
        <div class="p-6 border-b border-gray-200/50 dark:border-slate-700/50 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h2 class="text-lg font-bold text-gray-900 dark:text-white">Review History</h2>
            <p class="text-xs text-gray-400 dark:text-gray-500 mt-0.5">{{ totalReviews() }} total reviews</p>
          </div>
          <div class="flex gap-3 items-center">
            <div class="relative">
              <svg class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
              </svg>
              <input type="text" [(ngModel)]="searchQuery" placeholder="Search reviews..."
                     class="pl-10 pr-4 py-2 text-sm rounded-xl bg-gray-50 dark:bg-slate-800/50 text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-primary/30 border border-gray-200/50 dark:border-slate-700/50 transition-all w-48 focus:w-56">
            </div>
            @if (historyService.history().length) {
              <button (click)="clearAll()"
                      class="px-3 py-2 text-xs font-medium text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg transition-all">
                Clear All
              </button>
            }
          </div>
        </div>

        @if (filteredHistory().length === 0) {
          <div class="p-16 text-center">
            <div class="w-16 h-16 mx-auto rounded-2xl bg-gray-100 dark:bg-slate-800 flex items-center justify-center mb-4">
              <svg class="w-8 h-8 text-gray-300 dark:text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/>
              </svg>
            </div>
            <p class="text-gray-500 dark:text-gray-400 font-medium mb-1">No reviews yet</p>
            <p class="text-sm text-gray-400 dark:text-gray-500">
              Head to the <a routerLink="/reviewer" class="text-primary hover:underline font-medium">Reviewer</a> to get started.
            </p>
          </div>
        } @else {
          <div class="divide-y divide-gray-100/80 dark:divide-slate-700/50">
            @for (item of filteredHistory(); track item.id; let i = $index) {
              <div class="history-item p-5 hover:bg-gray-50/50 dark:hover:bg-slate-800/30 transition-all flex items-center justify-between gap-4 group">
                <div class="flex items-center gap-5 flex-1 min-w-0">
                  <app-score-circle [score]="item.review.score" [size]="48" [strokeWidth]="4" />
                  <div class="min-w-0 flex-1">
                    <div class="flex items-center gap-2 mb-1.5">
                      <span class="text-xs px-2.5 py-1 rounded-lg bg-primary/8 text-primary font-semibold uppercase tracking-wide">{{ item.language }}</span>
                      <span class="text-xs text-gray-400 dark:text-gray-500">{{ item.review.metrics.totalIssues }} issues</span>
                      @if (item.review.metrics.critical > 0) {
                        <span class="text-xs text-critical font-medium">{{ item.review.metrics.critical }} critical</span>
                      }
                    </div>
                    <p class="text-sm text-gray-600 dark:text-gray-400 truncate">{{ item.review.summary }}</p>
                  </div>
                </div>
                <div class="flex items-center gap-4 shrink-0">
                  <span class="text-xs text-gray-400 dark:text-gray-500 hidden sm:block">{{ item.createdAt | timeAgo }}</span>
                  <button (click)="deleteReview(item.id)"
                          class="p-2 rounded-lg text-gray-300 dark:text-gray-600 hover:text-red-500 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 opacity-0 group-hover:opacity-100 transition-all"
                          title="Delete">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                    </svg>
                  </button>
                </div>
              </div>
            }
          </div>
        }
      </div>
    </div>
  `,
  styles: [`
    :host { display: block; }
  `]
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
