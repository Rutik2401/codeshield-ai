import { Component, AfterViewInit, OnDestroy, ElementRef, ViewChild, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AnimationService } from '../../core/services/animation.service';
import { gsap } from 'gsap';

@Component({
  selector: 'app-landing',
  standalone: true,
  imports: [RouterLink],
  template: `
    <!-- ═══════════ HERO SECTION ═══════════ -->
    <section #heroSection class="relative min-h-screen flex items-center justify-center overflow-hidden">
      <!-- Animated mesh background -->
      <div class="absolute inset-0 bg-gradient-to-br from-slate-50 via-blue-50/50 to-emerald-50/30 dark:from-[#0A0F1E] dark:via-[#0F1629] dark:to-[#0A1628]"></div>

      <!-- Floating gradient orbs -->
      <div class="absolute top-1/4 -left-32 w-96 h-96 bg-primary/10 rounded-full blur-3xl animate-float hero-float"></div>
      <div class="absolute bottom-1/4 -right-32 w-96 h-96 bg-accent/10 rounded-full blur-3xl animate-float hero-float" style="animation-delay: -3s;"></div>
      <div class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-violet-500/5 rounded-full blur-3xl hero-float"></div>

      <!-- Grid pattern overlay -->
      <div class="absolute inset-0 opacity-[0.03] dark:opacity-[0.05]"
           style="background-image: radial-gradient(circle, #2563EB 1px, transparent 1px); background-size: 40px 40px;"></div>

      <!-- Floating code snippets -->
      <div class="absolute top-20 left-10 lg:left-20 opacity-0 hero-float">
        <div class="glass-card rounded-xl p-4 text-xs font-mono text-gray-500 dark:text-gray-400 rotate-[-6deg]">
          <span class="text-primary">const</span> secure = <span class="text-accent">true</span>;
        </div>
      </div>
      <div class="absolute bottom-32 right-10 lg:right-24 opacity-0 hero-float">
        <div class="glass-card rounded-xl p-4 text-xs font-mono text-gray-500 dark:text-gray-400 rotate-[4deg]">
          <span class="text-critical">!</span> SQL Injection on <span class="text-high">line 42</span>
        </div>
      </div>
      <div class="absolute top-40 right-16 lg:right-40 opacity-0 hero-float hidden lg:block">
        <div class="glass-card rounded-xl p-4 text-xs font-mono text-gray-500 dark:text-gray-400 rotate-[8deg]">
          Score: <span class="text-accent font-bold">92</span>/100
        </div>
      </div>

      <!-- Hero content -->
      <div class="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <!-- Badge -->
        <div class="hero-badge inline-flex items-center gap-2 px-4 py-2 rounded-full glass-card text-sm font-medium text-gray-600 dark:text-gray-300 mb-8 opacity-0">
          <span class="w-2 h-2 rounded-full bg-accent animate-pulse"></span>
          AI-Powered Code Security Platform
        </div>

        <!-- Title -->
        <h1 class="hero-title text-5xl sm:text-6xl lg:text-7xl xl:text-8xl font-black tracking-tight leading-[0.9] mb-8 opacity-0">
          <span class="block text-gray-900 dark:text-white">Review.</span>
          <span class="block gradient-text mt-2">Audit.</span>
          <span class="block text-gray-900 dark:text-white mt-2">Protect.</span>
        </h1>

        <!-- Subtitle -->
        <p class="hero-subtitle text-lg sm:text-xl lg:text-2xl text-gray-500 dark:text-gray-400 max-w-2xl mx-auto mb-12 font-light leading-relaxed opacity-0">
          Instant AI-powered code reviews with security vulnerability detection,
          fix suggestions, and quality scoring.
        </p>

        <!-- CTAs -->
        <div class="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <a routerLink="/reviewer" class="hero-cta btn-primary text-lg px-10 py-4 opacity-0">
            Start Reviewing
            <svg class="ml-2 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7l5 5m0 0l-5 5m5-5H6"/>
            </svg>
          </a>
          <a href="https://github.com/rutik/codeshield-ai" target="_blank" class="hero-cta btn-ghost text-lg px-10 py-4 opacity-0">
            <svg class="mr-2 w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/></svg>
            View on GitHub
          </a>
        </div>

        <!-- Keyboard shortcut hint -->
        <p class="mt-8 text-xs text-gray-400 dark:text-gray-500 hero-cta opacity-0">
          Press <kbd class="px-2 py-1 rounded bg-gray-100 dark:bg-slate-800 text-gray-600 dark:text-gray-400 font-mono text-xs border border-gray-200 dark:border-slate-700">Ctrl</kbd> + <kbd class="px-2 py-1 rounded bg-gray-100 dark:bg-slate-800 text-gray-600 dark:text-gray-400 font-mono text-xs border border-gray-200 dark:border-slate-700">K</kbd> to open command palette
        </p>
      </div>

      <!-- Scroll indicator -->
      <div class="absolute bottom-10 left-1/2 -translate-x-1/2 animate-bounce opacity-40">
        <svg class="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 14l-7 7m0 0l-7-7m7 7V3"/>
        </svg>
      </div>
    </section>

    <!-- ═══════════ HOW IT WORKS ═══════════ -->
    <section #howSection class="py-32 relative">
      <div class="absolute inset-0 bg-white dark:bg-[#0A0F1E]"></div>
      <div class="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="text-center mb-20">
          <span class="how-badge inline-block px-4 py-1.5 rounded-full text-xs font-semibold tracking-wider uppercase text-primary bg-primary/10 mb-6">
            Simple Process
          </span>
          <h2 class="how-title text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white">
            How It Works
          </h2>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-12">
          @for (step of steps; track step.title; let i = $index) {
            <div class="step-card group relative">
              <!-- Connector line -->
              @if (i < 2) {
                <div class="hidden md:block absolute top-12 left-[60%] w-[80%] h-px bg-gradient-to-r from-primary/30 to-transparent"></div>
              }

              <div class="glass-card rounded-2xl p-8 text-center relative overflow-hidden">
                <!-- Step number -->
                <div class="w-14 h-14 mx-auto rounded-2xl bg-gradient-to-br from-primary to-blue-700 flex items-center justify-center text-white text-xl font-bold mb-6 shadow-lg shadow-primary/20 group-hover:scale-110 transition-transform duration-300">
                  {{ step.num }}
                </div>

                <h3 class="text-xl font-bold text-gray-900 dark:text-white mb-3">{{ step.title }}</h3>
                <p class="text-gray-500 dark:text-gray-400 leading-relaxed">{{ step.desc }}</p>

                <!-- Hover glow -->
                <div class="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
                     style="background: radial-gradient(circle at 50% 0%, rgba(37, 99, 235, 0.05), transparent 70%);"></div>
              </div>
            </div>
          }
        </div>
      </div>
    </section>

    <!-- ═══════════ FEATURES GRID ═══════════ -->
    <section #featuresSection class="py-32 relative overflow-hidden">
      <div class="absolute inset-0 bg-gray-50/80 dark:bg-[#0D1220]"></div>
      <!-- Background decoration -->
      <div class="absolute top-0 right-0 w-96 h-96 bg-primary/5 rounded-full blur-3xl"></div>
      <div class="absolute bottom-0 left-0 w-96 h-96 bg-accent/5 rounded-full blur-3xl"></div>

      <div class="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="text-center mb-20">
          <span class="feat-badge inline-block px-4 py-1.5 rounded-full text-xs font-semibold tracking-wider uppercase text-accent bg-accent/10 mb-6">
            Capabilities
          </span>
          <h2 class="feat-title text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white">
            Everything You Need
          </h2>
          <p class="feat-sub mt-4 text-lg text-gray-500 dark:text-gray-400 max-w-2xl mx-auto">
            Professional-grade code analysis tools, powered by AI.
          </p>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          @for (feature of features; track feature.title) {
            <div class="feature-card group glass-card rounded-2xl p-8 relative overflow-hidden cursor-default">
              <!-- Icon container -->
              <div class="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl mb-6 transition-transform duration-300 group-hover:scale-110"
                   [class]="feature.bgClass">
                {{ feature.icon }}
              </div>

              <h3 class="text-lg font-bold text-gray-900 dark:text-white mb-2">{{ feature.title }}</h3>
              <p class="text-gray-500 dark:text-gray-400 text-sm leading-relaxed">{{ feature.desc }}</p>

              <!-- Corner glow on hover -->
              <div class="absolute -top-12 -right-12 w-32 h-32 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-2xl"
                   [class]="feature.glowClass"></div>
            </div>
          }
        </div>
      </div>
    </section>

    <!-- ═══════════ DEMO PREVIEW ═══════════ -->
    <section #demoSection class="py-32 relative">
      <div class="absolute inset-0 bg-white dark:bg-[#0A0F1E]"></div>
      <div class="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="text-center mb-16">
          <span class="demo-badge inline-block px-4 py-1.5 rounded-full text-xs font-semibold tracking-wider uppercase text-violet-600 dark:text-violet-400 bg-violet-500/10 mb-6">
            Live Preview
          </span>
          <h2 class="demo-title text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white">
            See It In Action
          </h2>
        </div>

        <!-- Fake editor preview -->
        <div class="demo-preview glass-card rounded-2xl overflow-hidden shadow-2xl shadow-black/10 dark:shadow-black/30">
          <!-- Window chrome -->
          <div class="flex items-center gap-2 px-4 py-3 bg-gray-100/80 dark:bg-slate-800/80 border-b border-gray-200 dark:border-slate-700">
            <div class="w-3 h-3 rounded-full bg-red-400"></div>
            <div class="w-3 h-3 rounded-full bg-yellow-400"></div>
            <div class="w-3 h-3 rounded-full bg-green-400"></div>
            <span class="ml-4 text-xs text-gray-500 dark:text-gray-400 font-mono">app.controller.js — CodeShield AI</span>
          </div>

          <div class="grid grid-cols-1 lg:grid-cols-2 divide-y lg:divide-y-0 lg:divide-x divide-gray-200 dark:divide-slate-700">
            <!-- Code side -->
            <div class="p-6 font-mono text-sm leading-loose" [innerHTML]="codePreviewHtml">
            </div>

            <!-- Review side -->
            <div class="p-6 space-y-4">
              <div class="flex items-center gap-3 mb-4">
                <div class="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white font-bold text-sm">
                  72
                </div>
                <div>
                  <div class="text-sm font-semibold text-gray-900 dark:text-white">Code Quality</div>
                  <div class="text-xs text-gray-400">1 critical issue found</div>
                </div>
              </div>

              <div class="p-3 rounded-xl bg-red-50 dark:bg-red-500/10 border border-red-200/50 dark:border-red-500/20">
                <div class="flex items-center gap-2 mb-1">
                  <span class="w-2 h-2 rounded-full bg-critical"></span>
                  <span class="text-xs font-bold text-critical uppercase">Critical</span>
                  <span class="text-xs text-gray-400 ml-auto">Line 2</span>
                </div>
                <p class="text-sm font-medium text-gray-900 dark:text-white">SQL Injection Vulnerability</p>
                <p class="text-xs text-gray-500 dark:text-gray-400 mt-1">User input directly in query string</p>
              </div>

              <div class="p-3 rounded-xl bg-accent/5 border border-accent/20">
                <p class="text-xs font-semibold text-accent mb-1">Suggested Fix</p>
                <code class="text-xs text-gray-600 dark:text-gray-300 font-mono">db.query('SELECT * FROM users WHERE id = $1', [req.params.id])</code>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- ═══════════ CTA ═══════════ -->
    <section #ctaSection class="py-32 relative overflow-hidden">
      <div class="absolute inset-0 bg-gradient-to-br from-primary via-blue-700 to-violet-700"></div>
      <!-- Decorative elements -->
      <div class="absolute top-0 left-0 w-full h-full opacity-10"
           style="background-image: radial-gradient(circle, white 1px, transparent 1px); background-size: 30px 30px;"></div>
      <div class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] bg-white/5 rounded-full blur-3xl"></div>

      <div class="relative max-w-4xl mx-auto px-4 text-center">
        <h2 class="cta-title text-4xl lg:text-5xl font-bold text-white mb-6">
          Ready to write better code?
        </h2>
        <p class="cta-sub text-blue-100/80 text-lg lg:text-xl mb-10 max-w-2xl mx-auto">
          Start reviewing your code for free. No signup required. No credit card needed.
        </p>
        <a routerLink="/reviewer" class="cta-btn inline-flex items-center px-10 py-4 rounded-xl bg-white text-primary font-bold text-lg hover:bg-gray-50 transition-all shadow-2xl shadow-black/20 hover:-translate-y-1">
          Start Reviewing — Free
          <svg class="ml-3 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7l5 5m0 0l-5 5m5-5H6"/>
          </svg>
        </a>
      </div>
    </section>
  `,
  styles: [`
    :host { display: block; }
  `]
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
    <div class="text-gray-400 dark:text-gray-500">
      <span class="text-gray-300 dark:text-gray-600 select-none">1&nbsp;&nbsp;</span>
      <span class="text-violet-600 dark:text-violet-400">app</span>.<span class="text-blue-600 dark:text-blue-400">get</span>(<span class="text-amber-600 dark:text-amber-400">'/user'</span>, (req, res) =&gt; {
    </div>
    <div class="text-gray-400 dark:text-gray-500 bg-red-50/50 dark:bg-red-500/5 -mx-6 px-6 border-l-2 border-l-red-500">
      <span class="text-gray-300 dark:text-gray-600 select-none">2&nbsp;&nbsp;</span>
      &nbsp;&nbsp;<span class="text-violet-600 dark:text-violet-400">db</span>.<span class="text-blue-600 dark:text-blue-400">query</span>(<span class="text-amber-600 dark:text-amber-400">\`SELECT * FROM users WHERE id = \${</span><span class="text-red-500">req.params.id</span><span class="text-amber-600 dark:text-amber-400">}\`</span>)
    </div>
    <div class="text-gray-400 dark:text-gray-500">
      <span class="text-gray-300 dark:text-gray-600 select-none">3&nbsp;&nbsp;</span>
      &nbsp;&nbsp;.<span class="text-blue-600 dark:text-blue-400">then</span>(data =&gt; res.<span class="text-blue-600 dark:text-blue-400">json</span>(data))
    </div>
    <div class="text-gray-400 dark:text-gray-500">
      <span class="text-gray-300 dark:text-gray-600 select-none">4&nbsp;&nbsp;</span>
      })
    </div>`;

  features = [
    { icon: '\uD83D\uDC1B', title: 'Bug Detection', desc: 'Find logic errors, null references, and runtime bugs before they reach production.', bgClass: 'bg-red-50 dark:bg-red-500/10', glowClass: 'bg-red-500/20' },
    { icon: '\uD83D\uDD12', title: 'Security Audit', desc: 'OWASP Top 10 vulnerability detection \u2014 SQL injection, XSS, and more.', bgClass: 'bg-amber-50 dark:bg-amber-500/10', glowClass: 'bg-amber-500/20' },
    { icon: '\uD83D\uDCA1', title: 'Fix Suggestions', desc: 'AI-generated code fixes with before/after diff view you can apply instantly.', bgClass: 'bg-green-50 dark:bg-green-500/10', glowClass: 'bg-green-500/20' },
    { icon: '\uD83C\uDF10', title: 'Multi-Language', desc: 'Supports JavaScript, Python, Java, C++, Go, Rust, and 10+ more languages.', bgClass: 'bg-blue-50 dark:bg-blue-500/10', glowClass: 'bg-blue-500/20' },
    { icon: '\uD83D\uDCCA', title: 'Quality Score', desc: 'Get a 0-100 code quality score with detailed metrics breakdown.', bgClass: 'bg-violet-50 dark:bg-violet-500/10', glowClass: 'bg-violet-500/20' },
    { icon: '\uD83D\uDCC4', title: 'Export Reports', desc: 'Export your review as a PDF or Markdown report for documentation.', bgClass: 'bg-cyan-50 dark:bg-cyan-500/10', glowClass: 'bg-cyan-500/20' },
  ];

  ngAfterViewInit(): void {
    // Hero entrance animation
    this.anim.heroEntrance(this.heroSection.nativeElement);

    // How It Works section
    const howEl = this.howSection.nativeElement;
    this.anim.fadeInUp(howEl.querySelector('.how-badge'), { trigger: howEl });
    this.anim.fadeInUp(howEl.querySelector('.how-title'), { trigger: howEl, delay: 0.1 });
    this.anim.staggerCards(howEl, '.step-card', { stagger: 0.15 });

    // Features section
    const featEl = this.featuresSection.nativeElement;
    this.anim.fadeInUp(featEl.querySelector('.feat-badge'), { trigger: featEl });
    this.anim.fadeInUp(featEl.querySelector('.feat-title'), { trigger: featEl, delay: 0.1 });
    this.anim.fadeInUp(featEl.querySelector('.feat-sub'), { trigger: featEl, delay: 0.15 });
    this.anim.staggerCards(featEl, '.feature-card', { stagger: 0.1 });

    // Demo section
    const demoEl = this.demoSection.nativeElement;
    this.anim.fadeInUp(demoEl.querySelector('.demo-badge'), { trigger: demoEl });
    this.anim.fadeInUp(demoEl.querySelector('.demo-title'), { trigger: demoEl, delay: 0.1 });
    this.anim.fadeInUp('.demo-preview', { trigger: demoEl, delay: 0.2, duration: 1 });

    // CTA section
    const ctaEl = this.ctaSection.nativeElement;
    this.anim.fadeInUp(ctaEl.querySelector('.cta-title'), { trigger: ctaEl });
    this.anim.fadeInUp(ctaEl.querySelector('.cta-sub'), { trigger: ctaEl, delay: 0.1 });
    this.anim.fadeInUp(ctaEl.querySelector('.cta-btn'), { trigger: ctaEl, delay: 0.2 });
  }

  ngOnDestroy(): void {
    this.anim.cleanupScrollTriggers();
  }
}
