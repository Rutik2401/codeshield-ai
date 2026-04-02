import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';

@Component({
  selector: 'app-score-circle',
  standalone: true,
  template: `
    <div class="relative inline-flex items-center justify-center group">
      <svg [attr.width]="size" [attr.height]="size" class="-rotate-90">
        <!-- Background circle -->
        <circle [attr.cx]="size/2" [attr.cy]="size/2" [attr.r]="radius"
                fill="none" class="text-gray-100 dark:text-slate-800" stroke="currentColor"
                [attr.stroke-width]="strokeWidth"/>
        <!-- Score arc -->
        <circle [attr.cx]="size/2" [attr.cy]="size/2" [attr.r]="radius"
                fill="none" [attr.stroke]="scoreColor"
                [attr.stroke-width]="strokeWidth"
                [attr.stroke-dasharray]="circumference"
                [attr.stroke-dashoffset]="animatedOffset"
                stroke-linecap="round"
                style="transition: stroke-dashoffset 1.2s cubic-bezier(0.4, 0, 0.2, 1), stroke 0.5s ease;
                       filter: drop-shadow(0 0 6px currentColor);"
                [style.color]="scoreColor"/>
      </svg>
      <span class="absolute font-bold transition-colors duration-500"
            [style.color]="scoreColor"
            [style.font-size.px]="size * 0.22">
        {{ displayScore }}
      </span>
    </div>
  `
})
export class ScoreCircleComponent implements OnChanges {
  @Input() score = 0;
  @Input() size = 120;
  @Input() strokeWidth = 8;

  displayScore = 0;
  animatedOffset = 0;
  private animationFrame: ReturnType<typeof requestAnimationFrame> | null = null;

  get radius(): number { return (this.size - this.strokeWidth) / 2; }
  get circumference(): number { return 2 * Math.PI * this.radius; }

  get scoreColor(): string {
    if (this.score >= 80) return '#10B981';
    if (this.score >= 60) return '#EAB308';
    if (this.score >= 40) return '#F97316';
    return '#EF4444';
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['score']) {
      this.animateScore();
    }
  }

  private animateScore(): void {
    if (this.animationFrame) {
      cancelAnimationFrame(this.animationFrame);
    }

    const target = this.score;
    const duration = 1200;
    const start = performance.now();
    const startVal = this.displayScore;
    const startOffset = this.animatedOffset || this.circumference;
    const targetOffset = this.circumference * (1 - target / 100);

    const animate = (now: number) => {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      // Ease out cubic
      const eased = 1 - Math.pow(1 - progress, 3);

      this.displayScore = Math.round(startVal + (target - startVal) * eased);
      this.animatedOffset = startOffset + (targetOffset - startOffset) * eased;

      if (progress < 1) {
        this.animationFrame = requestAnimationFrame(animate);
      }
    };

    // Set initial state
    this.animatedOffset = this.circumference;
    this.animationFrame = requestAnimationFrame(animate);
  }
}
