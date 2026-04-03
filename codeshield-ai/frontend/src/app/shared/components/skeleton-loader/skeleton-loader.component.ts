import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-skeleton-loader',
  standalone: true,
  templateUrl: './skeleton-loader.component.html'
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
