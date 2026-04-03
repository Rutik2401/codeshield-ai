import { Component, AfterViewInit, OnDestroy, ElementRef, ViewChild, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AnimationService } from '../../core/services/animation.service';
import { gsap } from 'gsap';

@Component({
  selector: 'app-landing',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './landing.component.html'
})
export class LandingComponent implements AfterViewInit, OnDestroy {
  private anim = inject(AnimationService);

  @ViewChild('heroSection', { static: true }) heroSection!: ElementRef;
  @ViewChild('howSection', { static: true }) howSection!: ElementRef;
  @ViewChild('featuresSection', { static: true }) featuresSection!: ElementRef;
  @ViewChild('demoSection', { static: true }) demoSection!: ElementRef;
  @ViewChild('ctaSection', { static: true }) ctaSection!: ElementRef;

  steps = [
    { num: '1', title: 'Paste Your Code', desc: 'Drop your code into our editor with syntax highlighting for 50+ languages.' },
    { num: '2', title: 'AI Analyzes It', desc: 'Our AI scans for bugs, security flaws, and best practice violations in seconds.' },
    { num: '3', title: 'Fix & Ship', desc: 'Get actionable fixes with before/after diffs and a quality score.' },
  ];

  codePreviewHtml = `
    <div class="text-gray-500">
      <span class="text-gray-600 select-none">1&nbsp;&nbsp;</span>
      <span class="text-violet-400">app</span>.<span class="text-blue-400">get</span>(<span class="text-amber-400">'/user'</span>, (req, res) =&gt; {
    </div>
    <div class="text-gray-500 bg-red-500/5 -mx-6 px-6 border-l-2 border-l-red-500">
      <span class="text-gray-600 select-none">2&nbsp;&nbsp;</span>
      &nbsp;&nbsp;<span class="text-violet-400">db</span>.<span class="text-blue-400">query</span>(<span class="text-amber-400">\`SELECT * FROM users WHERE id = \${</span><span class="text-red-500">req.params.id</span><span class="text-amber-400">}\`</span>)
    </div>
    <div class="text-gray-500">
      <span class="text-gray-600 select-none">3&nbsp;&nbsp;</span>
      &nbsp;&nbsp;.<span class="text-blue-400">then</span>(data =&gt; res.<span class="text-blue-400">json</span>(data))
    </div>
    <div class="text-gray-500">
      <span class="text-gray-600 select-none">4&nbsp;&nbsp;</span>
      })
    </div>`;

  features = [
    { icon: '\uD83D\uDC1B', title: 'Bug Detection', desc: 'Find logic errors, null references, and runtime bugs before they reach production.', bgClass: 'bg-red-500/10', glowClass: 'bg-red-500/20' },
    { icon: '\uD83D\uDD12', title: 'Security Audit', desc: 'OWASP Top 10 vulnerability detection \u2014 SQL injection, XSS, and more.', bgClass: 'bg-amber-500/10', glowClass: 'bg-amber-500/20' },
    { icon: '\uD83D\uDCA1', title: 'Fix Suggestions', desc: 'AI-generated code fixes with before/after diff view you can apply instantly.', bgClass: 'bg-green-500/10', glowClass: 'bg-green-500/20' },
    { icon: '\uD83C\uDF10', title: 'Multi-Language', desc: 'Supports JavaScript, Python, Java, C++, Go, Rust, and 10+ more languages.', bgClass: 'bg-blue-500/10', glowClass: 'bg-blue-500/20' },
    { icon: '\uD83D\uDCCA', title: 'Quality Score', desc: 'Get a 0-100 code quality score with detailed metrics breakdown.', bgClass: 'bg-violet-500/10', glowClass: 'bg-violet-500/20' },
    { icon: '\uD83D\uDCC4', title: 'Export Reports', desc: 'Export your review as a PDF or Markdown report for documentation.', bgClass: 'bg-cyan-500/10', glowClass: 'bg-cyan-500/20' },
  ];

  ngAfterViewInit(): void {
    this.anim.heroEntrance(this.heroSection.nativeElement);

    const howEl = this.howSection.nativeElement;
    this.anim.fadeInUp(howEl.querySelector('.how-badge'), { trigger: howEl });
    this.anim.fadeInUp(howEl.querySelector('.how-title'), { trigger: howEl, delay: 0.1 });
    this.anim.staggerCards(howEl, '.step-card', { stagger: 0.15 });

    const featEl = this.featuresSection.nativeElement;
    this.anim.fadeInUp(featEl.querySelector('.feat-badge'), { trigger: featEl });
    this.anim.fadeInUp(featEl.querySelector('.feat-title'), { trigger: featEl, delay: 0.1 });
    this.anim.fadeInUp(featEl.querySelector('.feat-sub'), { trigger: featEl, delay: 0.15 });
    this.anim.staggerCards(featEl, '.feature-card', { stagger: 0.1 });

    const demoEl = this.demoSection.nativeElement;
    this.anim.fadeInUp(demoEl.querySelector('.demo-badge'), { trigger: demoEl });
    this.anim.fadeInUp(demoEl.querySelector('.demo-title'), { trigger: demoEl, delay: 0.1 });
    this.anim.fadeInUp('.demo-preview', { trigger: demoEl, delay: 0.2, duration: 1 });

    const ctaEl = this.ctaSection.nativeElement;
    this.anim.fadeInUp(ctaEl.querySelector('.cta-title'), { trigger: ctaEl });
    this.anim.fadeInUp(ctaEl.querySelector('.cta-sub'), { trigger: ctaEl, delay: 0.1 });
    this.anim.fadeInUp(ctaEl.querySelector('.cta-btn'), { trigger: ctaEl, delay: 0.2 });

    this.anim.refreshScrollTriggers();
  }

  ngOnDestroy(): void {
    this.anim.cleanupScrollTriggers();
  }
}
