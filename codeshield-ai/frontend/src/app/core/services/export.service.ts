import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ReviewResponse } from '../../models/review.model';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class ExportService {
  private http = inject(HttpClient);
  private apiUrl = environment.apiUrl;

  exportAsMarkdown(review: ReviewResponse, language: string): void {
    let md = `# CodeShield AI - Code Review Report\n\n`;
    md += `**Language:** ${language}\n`;
    md += `**Score:** ${review.score}/100\n`;
    md += `**Total Issues:** ${review.metrics.totalIssues}\n\n`;
    md += `## Summary\n${review.summary}\n\n`;
    md += `## Issues\n\n`;

    review.issues.forEach(issue => {
      md += `### ${issue.severity.toUpperCase()}: ${issue.title}\n`;
      md += `- **Type:** ${issue.type}\n`;
      md += `- **Line:** ${issue.line}\n`;
      md += `- **Description:** ${issue.description}\n`;
      md += `- **Suggestion:** ${issue.suggestion}\n`;
      if (issue.fixedCode) {
        md += `- **Fix:**\n\`\`\`\n${issue.fixedCode}\n\`\`\`\n`;
      }
      md += `\n`;
    });

    if (review.securityAudit?.vulnerabilities?.length) {
      md += `## Security Audit\n`;
      md += `**Risk Level:** ${review.securityAudit.riskLevel}\n\n`;
      review.securityAudit.vulnerabilities.forEach(v => {
        md += `- **${v.owasp}** (${v.severity}): ${v.description}\n`;
      });
      md += `\n### Recommendations\n`;
      review.securityAudit.recommendations.forEach(r => {
        md += `- ${r}\n`;
      });
    }

    this.downloadFile(md, `codeshield-review-${Date.now()}.md`, 'text/markdown;charset=utf-8');
  }

  exportPdfFromBackend(review: ReviewResponse, language: string): void {
    this.http.post(`${this.apiUrl}/export/pdf`, { review, language }, {
      responseType: 'blob',
    }).subscribe({
      next: (blob) => {
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `codeshield-review-${Date.now()}.pdf`;
        link.click();
        URL.revokeObjectURL(url);
      },
      error: (err) => {
        console.error('PDF export failed:', err);
      },
    });
  }

  private downloadFile(content: string, filename: string, type: string): void {
    const blob = new Blob([content], { type });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.click();
    URL.revokeObjectURL(url);
  }
}
