import { Injectable, NgZone, inject } from '@angular/core';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

@Injectable({ providedIn: 'root' })
export class AnimationService {
  private zone = inject(NgZone);
  private isMobile = typeof window !== 'undefined' && window.innerWidth < 640;

  refreshScrollTriggers(): void {
    setTimeout(() => ScrollTrigger.refresh(), 100);
  }

  fadeInUp(elements: string | Element | Element[], opts?: {
    delay?: number;
    duration?: number;
    stagger?: number;
    trigger?: string | Element;
    start?: string;
  }): gsap.core.Tween {
    const yDist = this.isMobile ? 20 : 40;
    const dur = this.isMobile ? (opts?.duration ?? 0.8) * 0.6 : (opts?.duration ?? 0.8);
    return this.zone.runOutsideAngular(() =>
      gsap.fromTo(elements,
        { opacity: 0, y: yDist },
        {
          opacity: 1,
          y: 0,
          duration: dur,
          delay: opts?.delay ?? 0,
          stagger: opts?.stagger ?? 0,
          ease: 'power3.out',
          scrollTrigger: opts?.trigger ? {
            trigger: opts.trigger,
            start: opts?.start ?? 'top 85%',
            once: true,
          } : undefined,
        }
      )
    );
  }

  staggerCards(container: string | Element, items: string, opts?: {
    delay?: number;
    stagger?: number;
  }): gsap.core.Tween {
    const yDist = this.isMobile ? 15 : 30;
    const stag = this.isMobile ? 0.06 : (opts?.stagger ?? 0.12);
    return this.zone.runOutsideAngular(() =>
      gsap.fromTo(items,
        { opacity: 0, y: yDist, scale: 0.97 },
        {
          opacity: 1,
          y: 0,
          scale: 1,
          duration: this.isMobile ? 0.4 : 0.6,
          stagger: stag,
          ease: 'power2.out',
          delay: opts?.delay ?? 0,
          scrollTrigger: {
            trigger: container,
            start: 'top 80%',
            once: true,
          },
        }
      )
    );
  }

  slideInLeft(elements: string | Element | Element[], opts?: {
    trigger?: string | Element;
    duration?: number;
  }): gsap.core.Tween {
    return this.zone.runOutsideAngular(() =>
      gsap.fromTo(elements,
        { opacity: 0, x: -60 },
        {
          opacity: 1,
          x: 0,
          duration: opts?.duration ?? 0.8,
          ease: 'power3.out',
          scrollTrigger: opts?.trigger ? {
            trigger: opts.trigger,
            start: 'top 80%',
            once: true,
          } : undefined,
        }
      )
    );
  }

  slideInRight(elements: string | Element | Element[], opts?: {
    trigger?: string | Element;
    duration?: number;
  }): gsap.core.Tween {
    return this.zone.runOutsideAngular(() =>
      gsap.fromTo(elements,
        { opacity: 0, x: 60 },
        {
          opacity: 1,
          x: 0,
          duration: opts?.duration ?? 0.8,
          ease: 'power3.out',
          scrollTrigger: opts?.trigger ? {
            trigger: opts.trigger,
            start: 'top 80%',
            once: true,
          } : undefined,
        }
      )
    );
  }

  countUp(element: Element, endValue: number, duration = 1.5): void {
    this.zone.runOutsideAngular(() => {
      const obj = { val: 0 };
      gsap.to(obj, {
        val: endValue,
        duration,
        ease: 'power2.out',
        scrollTrigger: {
          trigger: element,
          start: 'top 90%',
          once: true,
        },
        onUpdate: () => {
          element.textContent = Math.round(obj.val).toString();
        },
      });
    });
  }

  parallax(element: string | Element, speed = 0.3): void {
    this.zone.runOutsideAngular(() => {
      gsap.to(element, {
        y: () => speed * 100,
        ease: 'none',
        scrollTrigger: {
          trigger: element,
          start: 'top bottom',
          end: 'bottom top',
          scrub: true,
        },
      });
    });
  }

  heroEntrance(container: Element): void {
    this.zone.runOutsideAngular(() => {
      if (this.isMobile) {
        // Simpler, faster animations on mobile
        const tl = gsap.timeline({ defaults: { ease: 'power2.out' } });
        tl.fromTo(container.querySelector('.hero-badge'),
          { opacity: 0, y: 10 },
          { opacity: 1, y: 0, duration: 0.4 }
        )
        .fromTo(container.querySelector('.hero-title'),
          { opacity: 0, y: 20 },
          { opacity: 1, y: 0, duration: 0.5 }, '-=0.2'
        )
        .fromTo(container.querySelector('.hero-subtitle'),
          { opacity: 0, y: 15 },
          { opacity: 1, y: 0, duration: 0.4 }, '-=0.2'
        )
        .fromTo(container.querySelectorAll('.hero-cta'),
          { opacity: 0, y: 10 },
          { opacity: 1, y: 0, duration: 0.3, stagger: 0.1 }, '-=0.2'
        );
      } else {
        const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });
        tl.fromTo(container.querySelector('.hero-badge'),
          { opacity: 0, y: 20, scale: 0.9 },
          { opacity: 1, y: 0, scale: 1, duration: 0.6 }
        )
        .fromTo(container.querySelector('.hero-title'),
          { opacity: 0, y: 40 },
          { opacity: 1, y: 0, duration: 0.8 }, '-=0.3'
        )
        .fromTo(container.querySelector('.hero-subtitle'),
          { opacity: 0, y: 30 },
          { opacity: 1, y: 0, duration: 0.7 }, '-=0.4'
        )
        .fromTo(container.querySelectorAll('.hero-cta'),
          { opacity: 0, y: 20 },
          { opacity: 1, y: 0, duration: 0.5, stagger: 0.15 }, '-=0.3'
        )
        .fromTo(container.querySelectorAll('.hero-float'),
          { opacity: 0, scale: 0.8 },
          { opacity: 1, scale: 1, duration: 0.8, stagger: 0.1 }, '-=0.4'
        );
      }
    });
  }

  cleanupScrollTriggers(): void {
    ScrollTrigger.getAll().forEach(st => st.kill());
  }
}
