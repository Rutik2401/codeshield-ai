import { Component, inject, signal, AfterViewInit, OnDestroy, ElementRef, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { UpperCasePipe } from '@angular/common';
import { GeminiService } from '../../core/services/gemini.service';
import { HistoryService } from '../../core/services/history.service';
import { ExportService } from '../../core/services/export.service';
import { LoadingService } from '../../core/services/loading.service';
import { AnimationService } from '../../core/services/animation.service';
import { ReviewResponse, Issue } from '../../models/review.model';
import { SUPPORTED_LANGUAGES } from '../../core/constants/language.constants';
import { SeverityBadgeComponent } from '../../shared/components/severity-badge/severity-badge.component';
import { ScoreCircleComponent } from '../../shared/components/score-circle/score-circle.component';
import { SkeletonLoaderComponent } from '../../shared/components/skeleton-loader/skeleton-loader.component';
import { gsap } from 'gsap';

@Component({
  selector: 'app-reviewer',
  standalone: true,
  imports: [FormsModule, UpperCasePipe, SeverityBadgeComponent, ScoreCircleComponent, SkeletonLoaderComponent],
  template: `
    <div class="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <!-- Page header -->
      <div class="flex items-center justify-between mb-8">
        <div>
          <h1 class="text-3xl font-bold text-gray-900 dark:text-white">Code Reviewer</h1>
          <p class="text-gray-500 dark:text-gray-400 mt-1 text-sm">Paste your code and get instant AI-powered analysis</p>
        </div>
        @if (review()) {
          <div class="hidden sm:flex items-center gap-3">
            <button (click)="exportPdf()"
                    class="px-4 py-2 rounded-xl glass-card text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-primary transition-colors flex items-center gap-2">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>
              PDF
            </button>
            <button (click)="exportMarkdown()"
                    class="px-4 py-2 rounded-xl glass-card text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-primary transition-colors flex items-center gap-2">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>
              Markdown
            </button>
          </div>
        }
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
        <!-- ═══════ LEFT: Code Editor Panel ═══════ -->
        <div class="space-y-4">
          <!-- Controls bar -->
          <div class="flex items-center gap-3">
            <div class="relative">
              <select [(ngModel)]="selectedLanguage"
                      class="appearance-none pl-4 pr-10 py-2.5 rounded-xl glass-card text-sm font-medium text-gray-700 dark:text-gray-200 focus:ring-2 focus:ring-primary/50 outline-none cursor-pointer">
                @for (lang of languages; track lang.id) {
                  <option [value]="lang.id">{{ lang.name }}</option>
                }
              </select>
              <svg class="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/>
              </svg>
            </div>

            <label class="flex items-center gap-2 px-4 py-2.5 rounded-xl glass-card cursor-pointer hover:border-primary/50 transition-all group">
              <svg class="w-4 h-4 text-gray-400 group-hover:text-primary transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"/>
              </svg>
              <span class="text-sm text-gray-500 dark:text-gray-400 group-hover:text-primary transition-colors">Upload</span>
              <input type="file" class="hidden" (change)="onFileUpload($event)" accept=".js,.ts,.py,.java,.cpp,.go,.rs,.php,.rb,.cs,.swift,.kt,.html,.css,.sql,.sh">
            </label>

            <div class="flex-1"></div>

            <span class="text-xs text-gray-400 dark:text-gray-500 hidden sm:block">
              <kbd class="px-1.5 py-0.5 rounded bg-gray-100 dark:bg-slate-800 font-mono text-xs border border-gray-200 dark:border-slate-700">Ctrl+Enter</kbd>
            </span>
          </div>

          <!-- Code textarea -->
          <div class="relative group">
            <div class="absolute -inset-0.5 bg-gradient-to-r from-primary/20 via-accent/20 to-violet-500/20 rounded-2xl opacity-0 group-focus-within:opacity-100 transition-opacity duration-500 blur-sm"></div>
            <textarea
              [(ngModel)]="code"
              rows="24"
              placeholder="// Paste your code here..."
              class="relative w-full p-5 rounded-2xl glass-card text-gray-800 dark:text-gray-100 font-mono text-sm leading-relaxed resize-none focus:ring-2 focus:ring-primary/30 outline-none placeholder-gray-400 dark:placeholder-gray-600 code-editor"
              (keydown.control.enter)="reviewCode()"
            ></textarea>
          </div>

          <!-- Review button -->
          <button (click)="reviewCode()"
                  [disabled]="loading.isLoading() || !code.trim()"
                  class="w-full py-4 rounded-xl font-semibold text-lg transition-all disabled:opacity-40 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center gap-3"
                  [class]="loading.isLoading()
                    ? 'bg-gray-100 dark:bg-slate-800 text-gray-500 dark:text-gray-400'
                    : 'btn-primary'">
            @if (loading.isLoading()) {
              <div class="flex items-center gap-3">
                <div class="relative w-5 h-5">
                  <div class="absolute inset-0 rounded-full border-2 border-primary/20"></div>
                  <div class="absolute inset-0 rounded-full border-2 border-primary border-t-transparent animate-spin"></div>
                </div>
                <span>{{ thinkingText() }}</span>
              </div>
            } @else {
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"/>
              </svg>
              Review Code
            }
          </button>

          <!-- Error message -->
          @if (error()) {
            <div class="p-4 rounded-xl bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 text-sm text-red-600 dark:text-red-400 flex items-center gap-3">
              <svg class="w-5 h-5 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd"/>
              </svg>
              {{ error() }}
            </div>
          }
        </div>

        <!-- ═══════ RIGHT: Results Panel ═══════ -->
        <div id="review-results" class="space-y-5" #resultsPanel>
          @if (loading.isLoading()) {
            <!-- AI Thinking State -->
            <div class="glass-card rounded-2xl p-8 overflow-hidden relative">
              <!-- Animated gradient border -->
              <div class="absolute inset-0 rounded-2xl"
                   style="background: linear-gradient(90deg, rgba(37,99,235,0.1), rgba(16,185,129,0.1), rgba(139,92,246,0.1)); background-size: 200% 100%; animation: shimmer 3s linear infinite;"></div>

              <div class="relative space-y-6">
                <div class="flex items-center gap-3 mb-6">
                  <div class="relative w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                    <svg class="w-5 h-5 text-white animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"/>
                    </svg>
                  </div>
                  <div>
                    <p class="font-semibold text-gray-900 dark:text-white">AI is analyzing your code</p>
                    <p class="text-xs text-gray-400">This usually takes a few seconds</p>
                  </div>
                </div>

                <!-- Thinking steps -->
                @for (step of thinkingSteps; track step.label; let i = $index) {
                  <div class="flex items-center gap-3" [class.opacity-40]="thinkingStep() <= i">
                    <div class="w-6 h-6 rounded-full flex items-center justify-center shrink-0"
                         [class]="thinkingStep() > i ? 'bg-accent/20 text-accent' : thinkingStep() === i ? 'bg-primary/20 text-primary' : 'bg-gray-100 dark:bg-slate-800 text-gray-400'">
                      @if (thinkingStep() > i) {
                        <svg class="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"/></svg>
                      } @else if (thinkingStep() === i) {
                        <div class="w-2 h-2 rounded-full bg-primary animate-pulse"></div>
                      } @else {
                        <div class="w-2 h-2 rounded-full bg-gray-300 dark:bg-gray-600"></div>
                      }
                    </div>
                    <span class="text-sm" [class]="thinkingStep() >= i ? 'text-gray-700 dark:text-gray-300' : 'text-gray-400 dark:text-gray-600'">
                      {{ step.label }}
                    </span>
                  </div>
                }

                <!-- Progress bar -->
                <div class="h-1.5 rounded-full bg-gray-100 dark:bg-slate-800 overflow-hidden mt-4">
                  <div class="h-full rounded-full bg-gradient-to-r from-primary via-accent to-violet-500 transition-all duration-1000 ease-out"
                       [style.width.%]="thinkingProgress()"></div>
                </div>
              </div>
            </div>
          } @else if (review()) {
            <!-- ═══ Score & Summary ═══ -->
            <div class="result-card glass-card rounded-2xl p-6 lg:p-8">
              <div class="flex items-start gap-6">
                <app-score-circle [score]="review()!.score" [size]="100" [strokeWidth]="7" />
                <div class="flex-1 min-w-0">
                  <h3 class="text-lg font-bold text-gray-900 dark:text-white mb-2">Analysis Complete</h3>
                  <p class="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">{{ review()!.summary }}</p>
                </div>
              </div>

              <!-- Metrics pills -->
              <div class="mt-6 flex gap-2 flex-wrap">
                @if (review()!.metrics.critical > 0) {
                  <span class="px-3 py-1.5 rounded-lg text-xs font-semibold bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 border border-red-200/50 dark:border-red-500/20">
                    {{ review()!.metrics.critical }} Critical
                  </span>
                }
                @if (review()!.metrics.high > 0) {
                  <span class="px-3 py-1.5 rounded-lg text-xs font-semibold bg-orange-50 dark:bg-orange-500/10 text-orange-600 dark:text-orange-400 border border-orange-200/50 dark:border-orange-500/20">
                    {{ review()!.metrics.high }} High
                  </span>
                }
                @if (review()!.metrics.medium > 0) {
                  <span class="px-3 py-1.5 rounded-lg text-xs font-semibold bg-yellow-50 dark:bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 border border-yellow-200/50 dark:border-yellow-500/20">
                    {{ review()!.metrics.medium }} Medium
                  </span>
                }
                @if (review()!.metrics.low > 0) {
                  <span class="px-3 py-1.5 rounded-lg text-xs font-semibold bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-200/50 dark:border-blue-500/20">
                    {{ review()!.metrics.low }} Low
                  </span>
                }
              </div>
            </div>

            <!-- ═══ Issues List ═══ -->
            @for (issue of review()!.issues; track issue.id; let i = $index) {
              <div class="result-card glass-card rounded-2xl p-5 lg:p-6 severity-glow-{{ issue.severity }} hover:scale-[1.01] transition-transform duration-300">
                <div class="flex items-center gap-3 mb-3">
                  <app-severity-badge [severity]="issue.severity" />
                  <span class="text-xs px-2 py-0.5 rounded-lg bg-gray-100 dark:bg-slate-700/50 text-gray-500 dark:text-gray-400 font-medium">{{ issue.type }}</span>
                  <span class="text-xs text-gray-400 ml-auto font-mono">Line {{ issue.line }}</span>
                </div>

                <h4 class="font-semibold text-gray-900 dark:text-white mb-1.5">{{ issue.title }}</h4>
                <p class="text-sm text-gray-500 dark:text-gray-400 leading-relaxed mb-3">{{ issue.description }}</p>

                <div class="flex items-start gap-2 text-sm">
                  <svg class="w-4 h-4 text-accent shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/>
                  </svg>
                  <span class="text-accent font-medium">{{ issue.suggestion }}</span>
                </div>

                @if (issue.fixedCode) {
                  <details class="mt-4 group/fix">
                    <summary class="text-sm text-primary cursor-pointer font-medium flex items-center gap-1 hover:gap-2 transition-all">
                      <svg class="w-4 h-4 transition-transform group-open/fix:rotate-90" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/>
                      </svg>
                      View Fix
                    </summary>
                    <pre class="mt-3 p-4 rounded-xl bg-gray-50 dark:bg-slate-900/80 text-sm text-gray-700 dark:text-gray-300 overflow-x-auto font-mono border border-gray-200 dark:border-slate-700/50"><code>{{ issue.fixedCode }}</code></pre>
                  </details>
                }
              </div>
            }

            <!-- ═══ Security Audit ═══ -->
            @if (review()!.securityAudit.vulnerabilities.length) {
              <div class="result-card glass-card rounded-2xl p-5 lg:p-6 border-2 border-critical/20 relative overflow-hidden">
                <!-- Danger gradient -->
                <div class="absolute inset-0 bg-gradient-to-br from-red-500/5 to-transparent pointer-events-none"></div>

                <div class="relative">
                  <h3 class="text-lg font-bold text-critical mb-5 flex items-center gap-3">
                    <div class="w-8 h-8 rounded-lg bg-critical/10 flex items-center justify-center">
                      <svg class="w-4 h-4 text-critical" fill="currentColor" viewBox="0 0 20 20">
                        <path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd"/>
                      </svg>
                    </div>
                    Security Audit
                    <span class="ml-auto text-xs px-3 py-1 rounded-lg bg-critical/10 text-critical font-semibold uppercase">
                      {{ review()!.securityAudit.riskLevel }}
                    </span>
                  </h3>

                  @for (vuln of review()!.securityAudit.vulnerabilities; track vuln.owasp) {
                    <div class="mb-3 p-4 rounded-xl bg-red-50/50 dark:bg-red-500/5 border border-red-200/30 dark:border-red-500/10">
                      <div class="flex items-center gap-2 mb-2">
                        <app-severity-badge [severity]="vuln.severity" />
                        <span class="font-semibold text-gray-900 dark:text-white text-sm">{{ vuln.owasp }}</span>
                      </div>
                      <p class="text-sm text-gray-500 dark:text-gray-400 mb-1">{{ vuln.description }}</p>
                      <p class="text-xs text-accent font-medium flex items-center gap-1">
                        <svg class="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/></svg>
                        {{ vuln.remediation }}
                      </p>
                    </div>
                  }

                  @if (review()!.securityAudit.recommendations.length) {
                    <h4 class="font-semibold text-gray-900 dark:text-white mt-5 mb-3 text-sm">Recommendations</h4>
                    <ul class="space-y-2">
                      @for (rec of review()!.securityAudit.recommendations; track rec) {
                        <li class="flex items-start gap-2 text-sm text-gray-500 dark:text-gray-400">
                          <svg class="w-4 h-4 text-primary shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4"/>
                          </svg>
                          {{ rec }}
                        </li>
                      }
                    </ul>
                  }
                </div>
              </div>
            }

            <!-- Mobile export buttons -->
            <div class="flex gap-3 sm:hidden">
              <button (click)="exportPdf()"
                      class="flex-1 py-3 rounded-xl glass-card text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-primary transition-colors">
                Export PDF
              </button>
              <button (click)="exportMarkdown()"
                      class="flex-1 py-3 rounded-xl glass-card text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-primary transition-colors">
                Export Markdown
              </button>
            </div>
          } @else {
            <!-- ═══ Empty State ═══ -->
            <div class="glass-card rounded-2xl p-16 text-center relative overflow-hidden">
              <div class="absolute inset-0 bg-gradient-to-br from-primary/3 to-accent/3 pointer-events-none"></div>
              <div class="relative">
                <div class="w-20 h-20 mx-auto rounded-2xl bg-gray-100 dark:bg-slate-800 flex items-center justify-center mb-6">
                  <svg class="w-10 h-10 text-gray-300 dark:text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4"/>
                  </svg>
                </div>
                <h3 class="text-lg font-semibold text-gray-600 dark:text-gray-400 mb-2">Paste your code to begin</h3>
                <p class="text-sm text-gray-400 dark:text-gray-500">AI-powered analysis results will appear here</p>
              </div>
            </div>
          }
        </div>
      </div>
    </div>
  `,
  styles: [`
    :host { display: block; }
  `]
})
export class ReviewerComponent implements AfterViewInit, OnDestroy {
  private geminiService = inject(GeminiService);
  private historyService = inject(HistoryService);
  private exportService = inject(ExportService);
  private anim = inject(AnimationService);
  loading = inject(LoadingService);

  @ViewChild('resultsPanel') resultsPanel!: ElementRef;

  languages = SUPPORTED_LANGUAGES;
  selectedLanguage = 'javascript';
  code = '';
  review = signal<ReviewResponse | null>(null);
  error = signal<string | null>(null);

  // AI thinking state
  thinkingStep = signal(0);
  thinkingProgress = signal(0);
  thinkingText = signal('Analyzing...');
  private thinkingInterval: ReturnType<typeof setInterval> | null = null;

  thinkingSteps = [
    { label: 'Parsing code structure...' },
    { label: 'Analyzing syntax and logic...' },
    { label: 'Detecting security vulnerabilities...' },
    { label: 'Generating fix suggestions...' },
    { label: 'Building quality report...' },
  ];

  ngAfterViewInit(): void {}

  ngOnDestroy(): void {
    this.stopThinking();
    this.anim.cleanupScrollTriggers();
  }

  reviewCode(): void {
    if (!this.code.trim()) return;

    this.loading.show();
    this.error.set(null);
    this.review.set(null);
    this.startThinking();

    this.geminiService.reviewCode(this.code, this.selectedLanguage).subscribe({
      next: (result) => {
        this.stopThinking();
        this.review.set(result);
        this.historyService.addReview(this.code, this.selectedLanguage, result);
        this.loading.hide();

        // Animate results appearing
        setTimeout(() => this.animateResults(), 50);
      },
      error: (err) => {
        this.stopThinking();
        this.error.set('Failed to review code. Please try again.');
        this.loading.hide();
        console.error('Review error:', err);
      }
    });
  }

  private startThinking(): void {
    this.thinkingStep.set(0);
    this.thinkingProgress.set(5);
    this.thinkingText.set(this.thinkingSteps[0].label);

    let step = 0;
    this.thinkingInterval = setInterval(() => {
      step++;
      if (step < this.thinkingSteps.length) {
        this.thinkingStep.set(step);
        this.thinkingText.set(this.thinkingSteps[step].label);
        this.thinkingProgress.set(Math.min(90, (step / this.thinkingSteps.length) * 100));
      }
    }, 1500);
  }

  private stopThinking(): void {
    if (this.thinkingInterval) {
      clearInterval(this.thinkingInterval);
      this.thinkingInterval = null;
    }
    this.thinkingProgress.set(100);
  }

  private animateResults(): void {
    const panel = this.resultsPanel?.nativeElement;
    if (!panel) return;

    const cards = panel.querySelectorAll('.result-card');
    gsap.fromTo(cards,
      { opacity: 0, y: 25, scale: 0.97 },
      {
        opacity: 1,
        y: 0,
        scale: 1,
        duration: 0.5,
        stagger: 0.1,
        ease: 'power2.out',
      }
    );
  }

  onFileUpload(event: Event): void {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      this.code = reader.result as string;
      this.detectLanguage(file.name);
    };
    reader.readAsText(file);
  }

  private detectLanguage(filename: string): void {
    const ext = filename.split('.').pop()?.toLowerCase();
    const extMap: Record<string, string> = {
      js: 'javascript', ts: 'typescript', py: 'python', java: 'java',
      cs: 'csharp', cpp: 'cpp', cc: 'cpp', go: 'go', rs: 'rust',
      php: 'php', rb: 'ruby', swift: 'swift', kt: 'kotlin',
      html: 'html', css: 'css', sql: 'sql', sh: 'shell',
    };
    if (ext && extMap[ext]) {
      this.selectedLanguage = extMap[ext];
    }
  }

  exportPdf(): void {
    this.exportService.exportAsPdf('review-results');
  }

  exportMarkdown(): void {
    const r = this.review();
    if (r) this.exportService.exportAsMarkdown(r, this.selectedLanguage);
  }
}
