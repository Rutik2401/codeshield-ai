import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-learn',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './learn.component.html',
})
export class LearnComponent {
  searchQuery = '';
  activeCategory = 'all';

  categories = [
    { id: 'all', label: 'All Topics' },
    { id: 'vulnerability', label: 'Vulnerabilities' },
    { id: 'practice', label: 'Best Practices' },
    { id: 'language', label: 'By Language' },
  ];

  topics = [
    { category: 'vulnerability', title: 'SQL Injection', severity: 'critical', desc: 'Attackers inject malicious SQL through unsanitized user inputs to access or modify your database.', fix: 'Use parameterized queries or prepared statements. Never concatenate user input into SQL strings.', search: 'SQL injection prevention best practices', icon: '🗃️' },
    { category: 'vulnerability', title: 'Cross-Site Scripting (XSS)', severity: 'critical', desc: 'Malicious scripts get injected into web pages viewed by other users through unescaped output.', fix: 'Escape all user-generated content before rendering. Use Content-Security-Policy headers.', search: 'XSS cross site scripting prevention', icon: '🌐' },
    { category: 'vulnerability', title: 'Broken Authentication', severity: 'high', desc: 'Weak session management or credential handling lets attackers impersonate legitimate users.', fix: 'Use proven auth libraries, enforce strong passwords, implement MFA, and rotate session tokens.', search: 'broken authentication OWASP prevention', icon: '🔓' },
    { category: 'vulnerability', title: 'Insecure Deserialization', severity: 'high', desc: 'Untrusted data is deserialized without validation, allowing remote code execution or data tampering.', fix: 'Validate and sanitize all serialized data. Use safe serialization formats like JSON over native objects.', search: 'insecure deserialization prevention', icon: '📦' },
    { category: 'vulnerability', title: 'Security Misconfiguration', severity: 'medium', desc: 'Default configs, open cloud storage, verbose error messages, or missing security headers.', fix: 'Harden all environments. Disable defaults, remove unused features, automate config audits.', search: 'security misconfiguration checklist', icon: '⚙️' },
    { category: 'vulnerability', title: 'Sensitive Data Exposure', severity: 'critical', desc: 'Unencrypted storage or transmission of passwords, tokens, credit cards, or personal data.', fix: 'Encrypt data at rest and in transit (TLS). Never log sensitive values. Use secrets managers.', search: 'sensitive data exposure prevention', icon: '🔑' },
    { category: 'practice', title: 'Input Validation', severity: 'low', desc: 'Validate all data at system boundaries — user input, API payloads, file uploads, query params.', fix: 'Whitelist allowed patterns. Reject unexpected types or lengths. Validate server-side, not just client-side.', search: 'input validation best practices server side', icon: '✅' },
    { category: 'practice', title: 'Error Handling', severity: 'low', desc: 'Proper error handling prevents information leakage and improves debugging without exposing internals.', fix: 'Use generic error messages for users. Log detailed errors server-side. Never expose stack traces in production.', search: 'secure error handling best practices', icon: '🛡️' },
    { category: 'practice', title: 'Dependency Management', severity: 'medium', desc: 'Outdated or vulnerable dependencies are the most common attack vector in modern applications.', fix: 'Audit dependencies regularly. Use tools like npm audit, Snyk, or Dependabot. Pin versions in production.', search: 'dependency vulnerability scanning tools', icon: '📦' },
    { category: 'practice', title: 'Secure API Design', severity: 'medium', desc: 'APIs must authenticate callers, authorize actions, rate limit requests, and validate all inputs.', fix: 'Use JWT/OAuth2. Implement RBAC. Add rate limiting. Validate request bodies against schemas.', search: 'secure REST API design checklist', icon: '🔗' },
    { category: 'language', title: 'JavaScript / TypeScript', severity: 'low', desc: 'Prototype pollution, eval() injection, regex DoS, and insecure DOM manipulation are common JS pitfalls.', fix: 'Avoid eval/innerHTML. Freeze prototypes. Use strict TypeScript. Sanitize all DOM insertions.', search: 'JavaScript security best practices 2024', icon: '🟨' },
    { category: 'language', title: 'Java / Spring Boot', severity: 'low', desc: 'XML external entities, unsafe reflection, JDBC injection, and insecure deserialization in Java apps.', fix: 'Use prepared statements. Disable DTD processing. Avoid native serialization. Keep Spring Boot updated.', search: 'Java Spring Boot security best practices', icon: '☕' },
    { category: 'language', title: 'Python', severity: 'low', desc: 'Pickle deserialization, OS command injection via subprocess, SQL injection in raw queries.', fix: 'Never unpickle untrusted data. Use parameterized queries. Avoid shell=True in subprocess calls.', search: 'Python security vulnerabilities common', icon: '🐍' },
    { category: 'language', title: 'Go', severity: 'low', desc: 'Race conditions, unchecked errors, template injection, and insecure HTTP defaults in Go services.', fix: 'Use race detector. Always check errors. Set timeouts on HTTP clients/servers. Use html/template, not text/template.', search: 'Go Golang security best practices', icon: '🔵' },
  ];

  get filteredTopics() {
    let result = this.topics;
    if (this.activeCategory !== 'all') {
      result = result.filter(t => t.category === this.activeCategory);
    }
    if (this.searchQuery.trim()) {
      const q = this.searchQuery.toLowerCase();
      result = result.filter(t =>
        t.title.toLowerCase().includes(q) ||
        t.desc.toLowerCase().includes(q) ||
        t.fix.toLowerCase().includes(q) ||
        t.category.toLowerCase().includes(q)
      );
    }
    return result;
  }

  sevColor(severity: string): string {
    const map: Record<string, string> = { critical: 'var(--color-critical)', high: 'var(--color-high)', medium: 'var(--color-medium)', low: 'var(--color-primary)' };
    return map[severity] || 'var(--text-tertiary)';
  }

  sevBg(severity: string): string {
    const map: Record<string, string> = { critical: 'rgba(239,68,68,0.1)', high: 'rgba(249,115,22,0.1)', medium: 'rgba(234,179,8,0.1)', low: 'rgba(59,130,246,0.1)' };
    return map[severity] || 'transparent';
  }

  searchGoogle(query: string): void {
    window.open(`https://www.google.com/search?q=${encodeURIComponent(query + ' site:owasp.org OR site:cheatsheetseries.owasp.org OR site:cwe.mitre.org')}`, '_blank');
  }

  searchTopic(): void {
    if (!this.searchQuery.trim()) return;
    window.open(`https://www.google.com/search?q=${encodeURIComponent(this.searchQuery + ' code security vulnerability fix')}`, '_blank');
  }

  setCategory(id: string): void {
    this.activeCategory = id;
  }
}
