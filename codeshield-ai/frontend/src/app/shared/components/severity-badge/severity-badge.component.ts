import { Component, Input } from '@angular/core';
import { NgClass } from '@angular/common';

@Component({
  selector: 'app-severity-badge',
  standalone: true,
  imports: [NgClass],
  templateUrl: './severity-badge.component.html'
})
export class SeverityBadgeComponent {
  @Input({ required: true }) severity!: string;

  get badgeClass(): string {
    const classes: Record<string, string> = {
      critical: 'bg-red-500/10 text-red-400 border border-red-500/20',
      high: 'bg-orange-500/10 text-orange-400 border border-orange-500/20',
      medium: 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20',
      low: 'bg-blue-500/10 text-blue-400 border border-blue-500/20',
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
