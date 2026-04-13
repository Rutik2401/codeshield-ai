import { Directive, ElementRef, Input, OnInit, OnDestroy, PLATFORM_ID, inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

@Directive({
  selector: '[appScrollAnimate]',
  standalone: true,
})
export class ScrollAnimateDirective implements OnInit, OnDestroy {
  @Input() appScrollAnimate: 'fade' | 'slide-up' | 'slide-left' | 'slide-right' | 'scale' = 'slide-up';
  @Input() animateDelay = 0;

  private el = inject(ElementRef);
  private platformId = inject(PLATFORM_ID);
  private observer: IntersectionObserver | null = null;

  ngOnInit(): void {
    if (!isPlatformBrowser(this.platformId)) return;

    const element = this.el.nativeElement as HTMLElement;
    element.classList.add('scroll-hidden');

    if (this.appScrollAnimate === 'fade') {
      element.classList.add('scroll-fade');
    } else if (this.appScrollAnimate === 'slide-left') {
      element.classList.add('scroll-slide-left');
    } else if (this.appScrollAnimate === 'slide-right') {
      element.classList.add('scroll-slide-right');
    } else if (this.appScrollAnimate === 'scale') {
      element.classList.add('scroll-scale');
    }

    if (this.animateDelay > 0) {
      element.style.transitionDelay = `${this.animateDelay}ms`;
    }

    this.observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('scroll-visible');
            this.observer?.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1, rootMargin: '0px 0px -40px 0px' }
    );

    this.observer.observe(element);
  }

  ngOnDestroy(): void {
    this.observer?.disconnect();
  }
}
