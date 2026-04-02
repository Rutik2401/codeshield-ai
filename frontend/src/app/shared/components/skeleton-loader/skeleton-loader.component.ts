import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-skeleton-loader',
  standalone: true,
  template: `
    <div class="space-y-4">
      @for (i of lines; track i) {
        <div class="h-4 rounded-lg overflow-hidden" [style.width]="getWidth(i)">
          <div class="h-full bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 dark:from-slate-700 dark:via-slate-600 dark:to-slate-700 animate-shimmer"
               style="background-size: 200% 100%;"></div>
        </div>
      }
    </div>
  `
})
export class SkeletonLoaderComponent {
  @Input() count = 3;

  get lines(): number[] {
    return Array.from({ length: this.count }, (_, i) => i);
  }

  getWidth(index: number): string {
    const widths = ['100%', '80%', '92%', '70%', '85%', '65%'];
    return widths[index % widths.length];
  }
}
