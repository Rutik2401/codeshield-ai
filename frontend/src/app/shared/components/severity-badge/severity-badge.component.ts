import { Component, Input } from '@angular/core';
import { NgClass } from '@angular/common';

@Component({
  selector: 'app-severity-badge',
  standalone: true,
  imports: [NgClass],
  template: `
    <span [ngClass]="badgeClass" class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold uppercase tracking-wide">
      <span class="w-1.5 h-1.5 rounded-full" [ngClass]="dotClass"></span>
      {{ severity }}
    </span>
  `
})
export class SeverityBadgeComponent {
  @Input({ required: true }) severity!: string;

  get badgeClass(): string {
    const classes: Record<string, string> = {
      critical: 'bg-red-50 text-red-600 dark:bg-red-500/10 dark:text-red-400 border border-red-200/50 dark:border-red-500/20',
      high: 'bg-orange-50 text-orange-600 dark:bg-orange-500/10 dark:text-orange-400 border border-orange-200/50 dark:border-orange-500/20',
      medium: 'bg-yellow-50 text-yellow-600 dark:bg-yellow-500/10 dark:text-yellow-400 border border-yellow-200/50 dark:border-yellow-500/20',
      low: 'bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400 border border-blue-200/50 dark:border-blue-500/20',
    };
    return classes[this.severity] || classes['low'];
  }

  get dotClass(): string {
    const classes: Record<string, string> = {
      critical: 'bg-red-500',
      high: 'bg-orange-500',
      medium: 'bg-yellow-500',
      low: 'bg-blue-500',
    };
    return classes[this.severity] || classes['low'];
  }
}
