import { Injectable } from '@angular/core';
import { ReviewResponse } from '../../models/review.model';
import { saveAs } from 'file-saver';

@Injectable({ providedIn: 'root' })
export class ExportService {

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

    const blob = new Blob([md], { type: 'text/markdown;charset=utf-8' });
    saveAs(blob, `codeshield-review-${Date.now()}.md`);
  }

  async exportAsPdf(elementId: string): Promise<void> {
    const html2pdf = (await import('html2pdf.js')).default;
    const element = document.getElementById(elementId);
    if (!element) return;

    html2pdf()
      .set({
        margin: 10,
        filename: `codeshield-review-${Date.now()}.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2 },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
      })
      .from(element)
      .save();
  }
}
