package com.codeshield.service;

import com.codeshield.dto.ReviewResponse;
import com.lowagie.text.*;
import com.lowagie.text.Font;
import com.lowagie.text.Rectangle;
import com.lowagie.text.pdf.*;
import org.springframework.stereotype.Service;

import java.awt.Color;
import java.io.ByteArrayOutputStream;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.List;

@Service
public class PdfExportService {

    // Colors
    private static final Color PRIMARY_TEXT = new Color(0x1E, 0x29, 0x3B);
    private static final Color CRITICAL_COLOR = new Color(0xEF, 0x44, 0x44);
    private static final Color HIGH_COLOR = new Color(0xF9, 0x73, 0x16);
    private static final Color MEDIUM_COLOR = new Color(0xEA, 0xB3, 0x08);
    private static final Color LOW_COLOR = new Color(0x3B, 0x82, 0xF6);
    private static final Color ACCENT_GREEN = new Color(0x16, 0xA3, 0x4A);
    private static final Color CODE_BG = new Color(0xF1, 0xF5, 0xF9);
    private static final Color LIGHT_GRAY = new Color(0x94, 0xA3, 0xB8);
    private static final Color DIVIDER_COLOR = new Color(0xE2, 0xE8, 0xF0);

    // Fonts
    private static final Font TITLE_FONT = new Font(Font.HELVETICA, 22, Font.BOLD, PRIMARY_TEXT);
    private static final Font SUBTITLE_FONT = new Font(Font.HELVETICA, 11, Font.NORMAL, LIGHT_GRAY);
    private static final Font HEADING_FONT = new Font(Font.HELVETICA, 16, Font.BOLD, PRIMARY_TEXT);
    private static final Font SUBHEADING_FONT = new Font(Font.HELVETICA, 13, Font.BOLD, PRIMARY_TEXT);
    private static final Font BODY_FONT = new Font(Font.HELVETICA, 10, Font.NORMAL, PRIMARY_TEXT);
    private static final Font BODY_BOLD = new Font(Font.HELVETICA, 10, Font.BOLD, PRIMARY_TEXT);
    private static final Font SMALL_FONT = new Font(Font.HELVETICA, 9, Font.NORMAL, LIGHT_GRAY);
    private static final Font CODE_FONT = new Font(Font.COURIER, 9, Font.NORMAL, PRIMARY_TEXT);
    private static final Font SCORE_FONT = new Font(Font.HELVETICA, 36, Font.BOLD);

    public byte[] generatePdf(ReviewResponse review, String language) {
        try (ByteArrayOutputStream baos = new ByteArrayOutputStream()) {
            Document document = new Document(PageSize.A4, 50, 50, 50, 50);
            PdfWriter writer = PdfWriter.getInstance(document, baos);
            writer.setPageEvent(new FooterPageEvent());
            document.open();

            addHeaderAndSummary(document, review, language);
            addMetricsBar(document, review.getMetrics());
            addIssuesSection(document, review.getIssues());
            addSecurityAuditSection(document, review.getSecurityAudit());

            document.close();
            return baos.toByteArray();
        } catch (Exception e) {
            throw new RuntimeException("Failed to generate PDF report", e);
        }
    }

    private void addHeaderAndSummary(Document document, ReviewResponse review, String language) throws DocumentException {
        // Title
        Paragraph title = new Paragraph("CodeShield AI \u2014 Code Review Report", TITLE_FONT);
        title.setAlignment(Element.ALIGN_LEFT);
        title.setSpacingAfter(4);
        document.add(title);

        // Metadata line
        String dateStr = LocalDate.now().format(DateTimeFormatter.ofPattern("MMMM d, yyyy"));
        Paragraph meta = new Paragraph(
                "Language: " + capitalize(language) + "  |  Date: " + dateStr,
                SUBTITLE_FONT
        );
        meta.setSpacingAfter(16);
        document.add(meta);

        addDivider(document);

        // Score
        Paragraph scoreLabel = new Paragraph("Overall Score", SUBHEADING_FONT);
        scoreLabel.setSpacingBefore(10);
        scoreLabel.setSpacingAfter(4);
        document.add(scoreLabel);

        Font scoreFont = new Font(Font.HELVETICA, 36, Font.BOLD, getScoreColor(review.getScore()));
        Paragraph scoreValue = new Paragraph(review.getScore() + " / 100", scoreFont);
        scoreValue.setSpacingAfter(16);
        document.add(scoreValue);

        // Summary
        if (review.getSummary() != null && !review.getSummary().isBlank()) {
            Paragraph summaryLabel = new Paragraph("Summary", SUBHEADING_FONT);
            summaryLabel.setSpacingAfter(4);
            document.add(summaryLabel);

            Paragraph summaryText = new Paragraph(review.getSummary(), BODY_FONT);
            summaryText.setSpacingAfter(16);
            document.add(summaryText);
        }

        addDivider(document);
    }

    private void addMetricsBar(Document document, ReviewResponse.Metrics metrics) throws DocumentException {
        if (metrics == null) return;

        Paragraph metricsLabel = new Paragraph("Issue Metrics", SUBHEADING_FONT);
        metricsLabel.setSpacingBefore(10);
        metricsLabel.setSpacingAfter(8);
        document.add(metricsLabel);

        PdfPTable table = new PdfPTable(4);
        table.setWidthPercentage(100);
        table.setSpacingAfter(16);

        addMetricCell(table, "CRITICAL", metrics.getCritical(), CRITICAL_COLOR);
        addMetricCell(table, "HIGH", metrics.getHigh(), HIGH_COLOR);
        addMetricCell(table, "MEDIUM", metrics.getMedium(), MEDIUM_COLOR);
        addMetricCell(table, "LOW", metrics.getLow(), LOW_COLOR);

        document.add(table);
        addDivider(document);
    }

    private void addMetricCell(PdfPTable table, String label, int count, Color color) {
        PdfPCell cell = new PdfPCell();
        cell.setBorder(Rectangle.BOX);
        cell.setBorderColor(DIVIDER_COLOR);
        cell.setPadding(10);
        cell.setHorizontalAlignment(Element.ALIGN_CENTER);

        Font countFont = new Font(Font.HELVETICA, 20, Font.BOLD, color);
        Paragraph countP = new Paragraph(String.valueOf(count), countFont);
        countP.setAlignment(Element.ALIGN_CENTER);
        cell.addElement(countP);

        Font labelFont = new Font(Font.HELVETICA, 8, Font.BOLD, color);
        Paragraph labelP = new Paragraph(label, labelFont);
        labelP.setAlignment(Element.ALIGN_CENTER);
        cell.addElement(labelP);

        table.addCell(cell);
    }

    private void addIssuesSection(Document document, List<ReviewResponse.Issue> issues) throws DocumentException {
        if (issues == null || issues.isEmpty()) return;

        Paragraph heading = new Paragraph("Issues (" + issues.size() + ")", HEADING_FONT);
        heading.setSpacingBefore(10);
        heading.setSpacingAfter(12);
        document.add(heading);

        for (int i = 0; i < issues.size(); i++) {
            ReviewResponse.Issue issue = issues.get(i);
            addIssueBlock(document, issue, i + 1);
        }
    }

    private void addIssueBlock(Document document, ReviewResponse.Issue issue, int index) throws DocumentException {
        // Issue header line: severity badge + type + line number
        Phrase headerPhrase = new Phrase();

        // Severity badge
        Color severityColor = getSeverityColor(issue.getSeverity());
        Font severityFont = new Font(Font.HELVETICA, 9, Font.BOLD, severityColor);
        Chunk severityChunk = new Chunk(" " + issue.getSeverity().toUpperCase() + " ", severityFont);
        headerPhrase.add(severityChunk);

        // Type tag
        Font tagFont = new Font(Font.HELVETICA, 9, Font.NORMAL, LIGHT_GRAY);
        headerPhrase.add(new Chunk("  " + issue.getType(), tagFont));

        // Line number
        if (issue.getLine() > 0) {
            headerPhrase.add(new Chunk("  |  Line " + issue.getLine(), tagFont));
        }

        Paragraph headerP = new Paragraph(headerPhrase);
        headerP.setSpacingBefore(8);
        headerP.setSpacingAfter(2);
        document.add(headerP);

        // Title
        Paragraph titleP = new Paragraph(index + ". " + issue.getTitle(), BODY_BOLD);
        titleP.setSpacingAfter(4);
        document.add(titleP);

        // Description
        if (issue.getDescription() != null && !issue.getDescription().isBlank()) {
            Paragraph descP = new Paragraph(issue.getDescription(), BODY_FONT);
            descP.setSpacingAfter(4);
            document.add(descP);
        }

        // Suggestion
        if (issue.getSuggestion() != null && !issue.getSuggestion().isBlank()) {
            Font suggestionFont = new Font(Font.HELVETICA, 10, Font.NORMAL, ACCENT_GREEN);
            Paragraph suggP = new Paragraph("\u2713 " + issue.getSuggestion(), suggestionFont);
            suggP.setSpacingAfter(4);
            document.add(suggP);
        }

        // Fixed code block
        if (issue.getFixedCode() != null && !issue.getFixedCode().isBlank()) {
            PdfPTable codeTable = new PdfPTable(1);
            codeTable.setWidthPercentage(100);
            codeTable.setSpacingBefore(4);
            codeTable.setSpacingAfter(12);

            PdfPCell codeCell = new PdfPCell();
            codeCell.setBackgroundColor(CODE_BG);
            codeCell.setBorderColor(DIVIDER_COLOR);
            codeCell.setPadding(8);

            Font codeLabelFont = new Font(Font.HELVETICA, 8, Font.BOLD, ACCENT_GREEN);
            Paragraph codeLabel = new Paragraph("Suggested Fix:", codeLabelFont);
            codeLabel.setSpacingAfter(4);
            codeCell.addElement(codeLabel);

            Paragraph codeP = new Paragraph(issue.getFixedCode(), CODE_FONT);
            codeCell.addElement(codeP);

            codeTable.addCell(codeCell);
            document.add(codeTable);
        } else {
            // Add some spacing between issues when no code block
            Paragraph spacer = new Paragraph(" ");
            spacer.setSpacingAfter(8);
            document.add(spacer);
        }
    }

    private void addSecurityAuditSection(Document document, ReviewResponse.SecurityAudit audit) throws DocumentException {
        if (audit == null) return;

        addDivider(document);

        Paragraph heading = new Paragraph("Security Audit", HEADING_FONT);
        heading.setSpacingBefore(10);
        heading.setSpacingAfter(8);
        document.add(heading);

        // Risk level
        if (audit.getRiskLevel() != null) {
            Color riskColor = getSeverityColor(audit.getRiskLevel());
            Font riskFont = new Font(Font.HELVETICA, 14, Font.BOLD, riskColor);
            Paragraph riskP = new Paragraph("Risk Level: " + audit.getRiskLevel().toUpperCase(), riskFont);
            riskP.setSpacingAfter(12);
            document.add(riskP);
        }

        // Vulnerabilities
        List<ReviewResponse.Vulnerability> vulns = audit.getVulnerabilities();
        if (vulns != null && !vulns.isEmpty()) {
            Paragraph vulnHeading = new Paragraph("Vulnerabilities", SUBHEADING_FONT);
            vulnHeading.setSpacingAfter(6);
            document.add(vulnHeading);

            for (ReviewResponse.Vulnerability vuln : vulns) {
                addVulnerabilityBlock(document, vuln);
            }
        }

        // Recommendations
        List<String> recs = audit.getRecommendations();
        if (recs != null && !recs.isEmpty()) {
            Paragraph recHeading = new Paragraph("Recommendations", SUBHEADING_FONT);
            recHeading.setSpacingBefore(10);
            recHeading.setSpacingAfter(6);
            document.add(recHeading);

            com.lowagie.text.List recList = new com.lowagie.text.List(false, 10);
            recList.setListSymbol("\u2022  ");
            for (String rec : recs) {
                ListItem item = new ListItem(rec, BODY_FONT);
                item.setSpacingAfter(4);
                recList.add(item);
            }
            document.add(recList);
        }
    }

    private void addVulnerabilityBlock(Document document, ReviewResponse.Vulnerability vuln) throws DocumentException {
        // OWASP tag + severity
        Phrase header = new Phrase();
        Color sevColor = getSeverityColor(vuln.getSeverity());
        Font sevFont = new Font(Font.HELVETICA, 9, Font.BOLD, sevColor);
        header.add(new Chunk(vuln.getSeverity() != null ? vuln.getSeverity().toUpperCase() : "UNKNOWN", sevFont));

        if (vuln.getOwasp() != null) {
            Font owaspFont = new Font(Font.HELVETICA, 9, Font.NORMAL, LIGHT_GRAY);
            header.add(new Chunk("  |  " + vuln.getOwasp(), owaspFont));
        }

        Paragraph headerP = new Paragraph(header);
        headerP.setSpacingBefore(4);
        headerP.setSpacingAfter(2);
        document.add(headerP);

        if (vuln.getDescription() != null) {
            Paragraph desc = new Paragraph(vuln.getDescription(), BODY_FONT);
            desc.setSpacingAfter(2);
            document.add(desc);
        }

        if (vuln.getRemediation() != null) {
            Font remFont = new Font(Font.HELVETICA, 10, Font.NORMAL, ACCENT_GREEN);
            Paragraph rem = new Paragraph("\u2713 " + vuln.getRemediation(), remFont);
            rem.setSpacingAfter(8);
            document.add(rem);
        }
    }

    private void addDivider(Document document) throws DocumentException {
        PdfPTable divider = new PdfPTable(1);
        divider.setWidthPercentage(100);
        divider.setSpacingBefore(4);
        divider.setSpacingAfter(4);
        PdfPCell cell = new PdfPCell();
        cell.setBorder(Rectangle.BOTTOM);
        cell.setBorderColor(DIVIDER_COLOR);
        cell.setBorderWidth(1);
        cell.setFixedHeight(1);
        divider.addCell(cell);
        document.add(divider);
    }

    private Color getSeverityColor(String severity) {
        if (severity == null) return LIGHT_GRAY;
        return switch (severity.toLowerCase()) {
            case "critical" -> CRITICAL_COLOR;
            case "high" -> HIGH_COLOR;
            case "medium" -> MEDIUM_COLOR;
            case "low" -> LOW_COLOR;
            default -> LIGHT_GRAY;
        };
    }

    private Color getScoreColor(int score) {
        if (score >= 80) return ACCENT_GREEN;
        if (score >= 60) return MEDIUM_COLOR;
        if (score >= 40) return HIGH_COLOR;
        return CRITICAL_COLOR;
    }

    private String capitalize(String s) {
        if (s == null || s.isEmpty()) return s;
        return s.substring(0, 1).toUpperCase() + s.substring(1).toLowerCase();
    }

    // Footer event handler
    private static class FooterPageEvent extends PdfPageEventHelper {
        @Override
        public void onEndPage(PdfWriter writer, Document document) {
            PdfContentByte cb = writer.getDirectContent();
            String dateStr = LocalDate.now().format(DateTimeFormatter.ofPattern("MMMM d, yyyy"));
            String footer = "Generated by CodeShield AI \u2014 " + dateStr;
            Font footerFont = new Font(Font.HELVETICA, 8, Font.NORMAL, new Color(0x94, 0xA3, 0xB8));
            Phrase phrase = new Phrase(footer, footerFont);
            ColumnText.showTextAligned(
                    cb,
                    Element.ALIGN_CENTER,
                    phrase,
                    (document.right() - document.left()) / 2 + document.leftMargin(),
                    document.bottom() - 20,
                    0
            );
        }
    }
}
