import { Component, inject, signal, AfterViewInit, OnDestroy, ElementRef, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { GeminiService } from '../../core/services/gemini.service';
import { HistoryService } from '../../core/services/history.service';
import { ExportService } from '../../core/services/export.service';
import { LoadingService } from '../../core/services/loading.service';
import { AnimationService } from '../../core/services/animation.service';
import { ReviewResponse } from '../../models/review.model';
import { SUPPORTED_LANGUAGES } from '../../core/constants/language.constants';
import { SeverityBadgeComponent } from '../../shared/components/severity-badge/severity-badge.component';
import { ScoreCircleComponent } from '../../shared/components/score-circle/score-circle.component';
import { MonacoEditorModule } from 'ngx-monaco-editor-v2';
import { gsap } from 'gsap';

declare const monaco: any;

@Component({
  selector: 'app-reviewer',
  standalone: true,
  imports: [FormsModule, SeverityBadgeComponent, ScoreCircleComponent, MonacoEditorModule],
  templateUrl: './reviewer.component.html',
  styles: [`
    :host { display: block; }

    .reviewer-layout {
      height: calc(100vh - 64px);
      display: flex;
      flex-direction: column;
      overflow: hidden;
    }

    .split-container {
      flex: 1;
      display: flex;
      flex-direction: column;
      overflow: hidden;
    }

    @media (min-width: 1024px) {
      .split-container {
        flex-direction: row;
      }
      .panel-left {
        width: 50%;
        display: flex;
        flex-direction: column;
        overflow: hidden;
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

    .editor-window {
      flex: 1;
      display: flex;
      flex-direction: column;
      border-radius: 12px;
      overflow: hidden;
      border: 1px solid rgba(51, 65, 85, 0.4);
      background: #1e1e2e;
    }

    .editor-window .code-area {
      flex: 1;
      overflow: hidden;
      min-height: 0;
      position: relative;
    }

    .editor-window .code-area ngx-monaco-editor,
    .editor-window .code-area ::ng-deep .editor-container,
    .editor-window .code-area ::ng-deep .monaco-editor {
      position: absolute !important;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      height: 100% !important;
      width: 100% !important;
    }

    .editor-titlebar {
      background: #181825;
      border-bottom: 1px solid rgba(69, 71, 90, 0.5);
    }

    .editor-statusbar {
      background: #181825;
      border-top: 1px solid rgba(69, 71, 90, 0.5);
    }
  `],
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
  private editorInstance: any = null;

  editorOptions: Record<string, any> = {
    theme: 'vs-dark',
    language: 'javascript',
    minimap: { enabled: false },
    automaticLayout: true,
    fontSize: 13,
    fontFamily: "'JetBrains Mono', 'Fira Code', 'Cascadia Code', Consolas, monospace",
    fontLigatures: true,
    lineNumbers: 'on',
    lineHeight: 22,
    letterSpacing: 0.3,
    scrollBeyondLastLine: false,
    roundedSelection: true,
    padding: { top: 12, bottom: 12 },
    wordWrap: 'on',
    tabSize: 2,
    suggestOnTriggerCharacters: true,
    quickSuggestions: true,
    formatOnPaste: true,
    bracketPairColorization: { enabled: true },
    guides: { bracketPairs: true, indentation: true },
    smoothScrolling: true,
    cursorBlinking: 'smooth',
    cursorSmoothCaretAnimation: 'on',
    renderLineHighlight: 'gutter',
    renderWhitespace: 'none',
    overviewRulerBorder: false,
    hideCursorInOverviewRuler: true,
    scrollbar: {
      verticalScrollbarSize: 8,
      horizontalScrollbarSize: 8,
      useShadows: false,
    },
  };

  review = signal<ReviewResponse | null>(null);
  error = signal<string | null>(null);
  mobilePanel: 'editor' | 'results' = 'editor';
  copiedIssueId: string | null = null;
  appliedIssueId: string | null = null;
  lineCount = signal(0);
  charCount = signal(0);

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

  onLanguageChange(): void {
    this.editorOptions = { ...this.editorOptions, language: this.mapLanguage(this.selectedLanguage) };
  }

  private mapLanguage(lang: string): string {
    const found = this.languages.find(l => l.id === lang);
    return found?.monacoId || 'plaintext';
  }

  onEditorInit(editor: any): void {
    this.editorInstance = editor;

    // Ctrl+Enter to review
    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.Enter, () => {
      this.reviewCode();
    });

    // Ctrl+S to export PDF
    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyS, () => {
      if (this.review()) this.exportPdf();
    });

    // Track line/char count
    editor.onDidChangeModelContent(() => {
      const model = editor.getModel();
      if (model) {
        this.lineCount.set(model.getLineCount());
        this.charCount.set(model.getValue().length);
      }
    });
  }

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
        setTimeout(() => this.animateResults(), 50);
      },
      error: (err) => {
        this.stopThinking();
        this.error.set('Failed to review code. Please try again.');
        this.loading.hide();
        console.error('Review error:', err);
      },
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
      { opacity: 1, y: 0, scale: 1, duration: 0.5, stagger: 0.1, ease: 'power2.out' },
    );
  }

  onFileUpload(event: Event): void {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      this.code = reader.result as string;
      this.detectLanguage(file.name);
      this.onLanguageChange();
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

  copyFix(fixedCode: string, issueId: string): void {
    navigator.clipboard.writeText(fixedCode).then(() => {
      this.copiedIssueId = issueId;
      setTimeout(() => (this.copiedIssueId = null), 2000);
    });
  }

  applyFix(fixedCode: string, issueId: string, issueLine: number): void {
    const model = this.editorInstance?.getModel();
    if (!model) return;

    const originalLines = model.getValue().split('\n');
    const fixLines = fixedCode.split('\n');

    // If fix is most of the file (>70%), it's a full replacement
    if (fixLines.length > originalLines.length * 0.7) {
      model.setValue(fixedCode);
      this.code = model.getValue();
      this.showApplied(issueId);
      return;
    }

    // Partial fix — find where to insert using line anchoring
    const range = this.findFixRange(originalLines, fixLines, issueLine - 1);

    // Monaco Range is 1-indexed
    const startLine = range.start + 1;
    const endLine = Math.min(range.end + 1, originalLines.length);
    const endCol = model.getLineMaxColumn(endLine);

    const editRange = new monaco.Range(startLine, 1, endLine, endCol);
    model.pushEditOperations([], [{ range: editRange, text: fixedCode }], () => null);

    this.code = model.getValue();
    this.editorInstance.revealLineInCenter(startLine);
    this.showApplied(issueId);
  }

  private findFixRange(origLines: string[], fixLines: string[], issueLine: number): { start: number; end: number } {
    const firstFix = fixLines[0]?.trim();
    const lastFix = fixLines[fixLines.length - 1]?.trim();

    // Search near issue line for the first line of the fix
    let start = this.searchNear(origLines, firstFix, issueLine, 15);
    if (start === -1) start = Math.max(0, issueLine - 1);

    // Search for the last line of the fix to find the end
    let end = this.searchNear(origLines, lastFix, start + fixLines.length - 1, 10);
    if (end === -1 || end < start) {
      end = Math.min(origLines.length - 1, start + fixLines.length - 1);
    }

    return { start, end };
  }

  private searchNear(lines: string[], target: string, center: number, radius: number): number {
    if (!target) return -1;
    const safeCenter = Math.max(0, Math.min(lines.length - 1, center));
    for (let d = 0; d <= radius; d++) {
      const before = safeCenter - d;
      const after = safeCenter + d;
      if (before >= 0 && lines[before].trim() === target) return before;
      if (after < lines.length && lines[after].trim() === target) return after;
    }
    return -1;
  }

  private showApplied(issueId: string): void {
    this.appliedIssueId = issueId;
    setTimeout(() => (this.appliedIssueId = null), 2000);
    this.mobilePanel = 'editor';
  }

  clearEditor(): void {
    this.code = '';
    this.review.set(null);
    this.error.set(null);
    if (this.editorInstance) {
      this.editorInstance.getModel()?.setValue('');
      this.editorInstance.focus();
    }
  }

  exportPdf(): void {
    const r = this.review();
    if (r) this.exportService.exportPdfFromBackend(r, this.selectedLanguage);
  }

  exportMarkdown(): void {
    const r = this.review();
    if (r) this.exportService.exportAsMarkdown(r, this.selectedLanguage);
  }
}
