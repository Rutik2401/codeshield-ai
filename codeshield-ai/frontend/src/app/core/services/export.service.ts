import { Injectable } from '@angular/core';
import { ReviewResponse } from '../../models/review.model';

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

    this.downloadFile(md, `codeshield-review-${Date.now()}.md`, 'text/markdown;charset=utf-8');
  }

  async exportAsPdf(elementId: string): Promise<void> {
    const element = document.getElementById(elementId);
    if (!element) return;

    try {
      const mod = await import('html2pdf.js');
      const html2pdf = mod.default ?? mod;

      await html2pdf()
        .set({
          margin: [10, 10, 10, 10],
          filename: `codeshield-review-${Date.now()}.pdf`,
          image: { type: 'jpeg', quality: 0.98 },
          html2canvas: {
            scale: 2,
            useCORS: true,
            backgroundColor: '#0F172A',
          },
          jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
        })
        .from(element)
        .save();
    } catch (err) {
      console.error('PDF export failed, using print fallback:', err);
      this.printFallback(element);
    }
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

  private printFallback(element: HTMLElement): void {
    const win = window.open('', '_blank');
    if (!win) return;

    win.document.write(`
      <html>
        <head>
          <title>CodeShield AI - Review Report</title>
          <style>
            body { font-family: system-ui, sans-serif; padding: 24px; background: #0F172A; color: #F8FAFC; }
          </style>
        </head>
        <body>${element.innerHTML}</body>
      </html>
    `);
    win.document.close();
    win.print();
  }
}
