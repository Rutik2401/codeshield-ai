import { Component, AfterViewInit, OnDestroy, ElementRef, ViewChild, inject, signal } from '@angular/core';
import { AnimationService } from '../../core/services/animation.service';
import { AuthService } from '../../core/services/auth.service';

interface PlanFeature {
  text: string;
  included: boolean;
}

interface Plan {
  id: string;
  name: string;
  badge: string | null;
  description: string;
  monthlyPrice: number;
  annualPrice: number;
  cta: string;
  popular: boolean;
  features: PlanFeature[];
}

interface CompRow {
  label: string;
  free: string | boolean;
  pro: string | boolean;
  team: string | boolean;
}

@Component({
  selector: 'app-pricing',
  standalone: true,
  imports: [],
  templateUrl: './pricing.component.html',
  styles: [`
    @keyframes expandFaq {
      from { height: 0; opacity: 0; }
      to { height: var(--faq-height, auto); opacity: 1; }
    }
  `]
})
export class PricingComponent implements AfterViewInit, OnDestroy {
  private anim = inject(AnimationService);
  auth = inject(AuthService);

  @ViewChild('heroSection', { static: true }) heroSection!: ElementRef;
  @ViewChild('cardsSection', { static: true }) cardsSection!: ElementRef;
  @ViewChild('compSection', { static: true }) compSection!: ElementRef;
  @ViewChild('statsSection', { static: true }) statsSection!: ElementRef;
  @ViewChild('faqSection', { static: true }) faqSection!: ElementRef;
  @ViewChild('ctaSection', { static: true }) ctaSection!: ElementRef;

  annual = signal(true);
  activePlan = signal('pro');
  openFaq = signal<number | null>(null);

  plans: Plan[] = [
    {
      id: 'free', name: 'Free', badge: 'Starter', description: 'Everything you need to start reviewing code and catching bugs.',
      monthlyPrice: 0, annualPrice: 0, cta: 'Get Started', popular: false,
      features: [
        { text: '10 code reviews / day', included: true },
        { text: 'All 16+ languages', included: true },
        { text: 'OWASP security scan', included: true },
        { text: 'PDF & Markdown export', included: true },
        { text: 'Quality score & metrics', included: true },
        { text: 'GitHub integration', included: false },
        { text: 'Priority AI processing', included: false },
        { text: 'Review history (cloud)', included: false },
        { text: 'API access', included: false },
        { text: 'Team dashboard', included: false },
      ],
    },
    {
      id: 'pro', name: 'Pro', badge: 'Most Popular', description: 'Full power for serious developers. GitHub integration + unlimited reviews.',
      monthlyPrice: 12, annualPrice: 9, cta: 'Start Pro Trial', popular: true,
      features: [
        { text: 'Unlimited code reviews', included: true },
        { text: 'All 16+ languages', included: true },
        { text: 'OWASP security scan', included: true },
        { text: 'PDF & Markdown export', included: true },
        { text: 'Quality score & metrics', included: true },
        { text: 'GitHub integration (5 repos)', included: true },
        { text: 'Priority AI processing', included: true },
        { text: 'Review history (cloud)', included: true },
        { text: 'API access', included: true },
        { text: 'Team dashboard', included: false },
      ],
    },
    {
      id: 'team', name: 'Team', badge: 'Best Value', description: 'For dev teams. Unlimited repos, custom rules, and admin controls.',
      monthlyPrice: 29, annualPrice: 19, cta: 'Contact Sales', popular: false,
      features: [
        { text: 'Unlimited code reviews', included: true },
        { text: 'All 16+ languages', included: true },
        { text: 'OWASP security scan', included: true },
        { text: 'PDF & Markdown export', included: true },
        { text: 'Quality score & metrics', included: true },
        { text: 'Unlimited repositories', included: true },
        { text: 'Priority AI processing', included: true },
        { text: 'Review history (cloud)', included: true },
        { text: 'API access', included: true },
        { text: 'Up to 10 team seats', included: true },
      ],
    },
  ];

  comparison: CompRow[] = [
    { label: 'Reviews per day', free: '10', pro: 'Unlimited', team: 'Unlimited' },
    { label: 'Languages', free: '16+', pro: '16+', team: '16+' },
    { label: 'Security scan (OWASP)', free: true, pro: true, team: true },
    { label: 'Export (PDF/MD)', free: true, pro: true, team: true },
    { label: 'GitHub integration', free: false, pro: '5 repos', team: 'Unlimited' },
    { label: 'Priority processing', free: false, pro: true, team: true },
    { label: 'Cloud review history', free: false, pro: true, team: true },
    { label: 'API access', free: false, pro: true, team: true },
    { label: 'Team seats', free: false, pro: false, team: '10' },
    { label: 'Custom review rules', free: false, pro: false, team: true },
    { label: 'Dedicated support', free: 'Community', pro: 'Email', team: 'Slack + call' },
  ];

  stats = [
    { value: '16+', label: 'Languages supported' },
    { value: '< 5s', label: 'Average review time' },
    { value: '100%', label: 'Free to start' },
    { value: 'OWASP', label: 'Security standard' },
  ];

  faqs = [
    { q: 'How does CodeShield AI work?', a: 'Paste your code, select the language, and our AI analyzes it in seconds. It checks for bugs, security vulnerabilities (OWASP Top 10), and best practice violations, then gives you a quality score and actionable fix suggestions.' },
    { q: 'Is the Free plan really free?', a: 'Yes! 10 reviews per day with full access to security scanning, fix suggestions, and export. No credit card required. No time limit.' },
    { q: 'Can I upgrade or downgrade anytime?', a: 'Absolutely. Upgrades take effect immediately. Downgrades apply at the end of your current billing cycle. No lock-in.' },
    { q: 'Is my code stored on your servers?', a: 'Code is sent to our AI engine for analysis only. It is not permanently stored. Review results are saved to your account if you\'re on Pro/Team, or to browser localStorage on Free.' },
    { q: 'What AI model powers the analysis?', a: 'We use Google Gemini for code analysis with security-focused prompts to catch OWASP Top 10 vulnerabilities, logic errors, and best practice violations.' },
    { q: 'Do you offer refunds?', a: 'Yes. If you\'re not satisfied within 14 days, we issue a full refund — no questions asked.' },
    { q: 'When is GitHub integration available?', a: 'GitHub integration is launching in Phase 2. It will automatically review Pull Requests and post inline comments. Pro and Team users get early access.' },
  ];

  getPrice(plan: Plan): number {
    return this.annual() ? plan.annualPrice : plan.monthlyPrice;
  }

  toggleFaq(i: number): void {
    this.openFaq.set(this.openFaq() === i ? null : i);
  }

  onPlanCta(planId: string): void {
    if (planId === 'team') {
      window.location.href = 'mailto:rutik@codeshield.ai?subject=CodeShield AI Team Plan';
    } else {
      this.auth.openCreateAccount();
    }
  }

  isString(val: string | boolean): boolean {
    return typeof val === 'string';
  }

  ngAfterViewInit(): void {
    this.anim.fadeInUp(this.heroSection.nativeElement.querySelector('.pricing-badge'), { trigger: this.heroSection.nativeElement });
    this.anim.fadeInUp(this.heroSection.nativeElement.querySelector('.pricing-title'), { trigger: this.heroSection.nativeElement, delay: 0.1 });

    this.anim.staggerCards(this.cardsSection.nativeElement, '.plan-card', { stagger: 0.12 });

    this.anim.fadeInUp(this.compSection.nativeElement, { trigger: this.compSection.nativeElement });
    this.anim.fadeInUp(this.statsSection.nativeElement, { trigger: this.statsSection.nativeElement });
    this.anim.fadeInUp(this.faqSection.nativeElement, { trigger: this.faqSection.nativeElement });
    this.anim.fadeInUp(this.ctaSection.nativeElement, { trigger: this.ctaSection.nativeElement });

    this.anim.refreshScrollTriggers();
  }

  ngOnDestroy(): void {
    this.anim.cleanupScrollTriggers();
  }
}
