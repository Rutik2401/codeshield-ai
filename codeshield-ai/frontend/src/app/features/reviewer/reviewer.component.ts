import { Component, inject, signal, AfterViewInit, OnDestroy, ElementRef, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { GeminiService } from '../../core/services/gemini.service';
import { HistoryService } from '../../core/services/history.service';
import { ExportService } from '../../core/services/export.service';
import { LoadingService } from '../../core/services/loading.service';
import { AnimationService } from '../../core/services/animation.service';
import { ReviewResponse, Issue } from '../../models/review.model';
import { SUPPORTED_LANGUAGES } from '../../core/constants/language.constants';
import { SeverityBadgeComponent } from '../../shared/components/severity-badge/severity-badge.component';
import { ScoreCircleComponent } from '../../shared/components/score-circle/score-circle.component';
import { gsap } from 'gsap';

@Component({
  selector: 'app-reviewer',
  standalone: true,
  imports: [FormsModule, SeverityBadgeComponent, ScoreCircleComponent],
  templateUrl: './reviewer.component.html',
  styles: [`
    :host { display: block; }

    .reviewer-layout {
      min-height: calc(100vh - 64px);
    }

    @media (min-width: 1024px) {
      .split-container {
        display: flex;
        height: calc(100vh - 140px);
      }
      .panel-left {
        width: 50%;
        display: flex;
        flex-direction: column;
        border-right: 1px solid rgba(51, 65, 85, 0.5);
        overflow: hidden;
      }
      .panel-left .code-area {
        flex: 1;
        overflow: hidden;
      }
      .panel-left textarea {
        height: 100% !important;
        min-height: unset !important;
      }
      .panel-right {
        width: 50%;
        overflow-y: auto;
        scrollbar-width: thin;
        scrollbar-color: rgba(100,116,139,0.3) transparent;
      }
      .panel-right::-webkit-scrollbar { width: 6px; }
      .panel-right::-webkit-scrollbar-track { background: transparent; }
      .panel-right::-webkit-scrollbar-thumb { background: rgba(100,116,139,0.3); border-radius: 3px; }
      .panel-right::-webkit-scrollbar-thumb:hover { background: rgba(100,116,139,0.5); }
    }

    textarea.code-editor {
      tab-size: 2;
      -moz-tab-size: 2;
    }
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
  mobilePanel: 'editor' | 'results' = 'editor';
  copiedIssueId: string | null = null;

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
    this.mobilePanel = 'results';
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

  copyFix(fixedCode: string): void {
    navigator.clipboard.writeText(fixedCode).then(() => {
      const issue = this.review()?.issues.find(i => i.fixedCode === fixedCode);
      if (issue) {
        this.copiedIssueId = issue.id;
        setTimeout(() => this.copiedIssueId = null, 2000);
      }
    });
  }

  applyFix(fixedCode: string): void {
    this.code = fixedCode;
    this.mobilePanel = 'editor';
  }

  exportPdf(): void {
    this.exportService.exportAsPdf('review-results');
  }

  exportMarkdown(): void {
    const r = this.review();
    if (r) this.exportService.exportAsMarkdown(r, this.selectedLanguage);
  }
}
