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

    // Brand palette
    private static final Color BRAND = new Color(0x1D, 0x4E, 0xD8);       // Deep blue
    private static final Color BRAND_LIGHT = new Color(0xDB, 0xEA, 0xFE); // Light blue bg
    private static final Color DARK = new Color(0x0F, 0x17, 0x2A);        // Near black
    private static final Color BODY = new Color(0x37, 0x41, 0x51);        // Dark gray
    private static final Color MUTED = new Color(0x6B, 0x72, 0x80);       // Medium gray
    private static final Color LIGHT = new Color(0x9C, 0xA3, 0xAF);       // Light gray
    private static final Color SURFACE = new Color(0xF9, 0xFA, 0xFB);     // Off-white bg
    private static final Color BORDER = new Color(0xE5, 0xE7, 0xEB);      // Subtle border
    private static final Color WHITE = new Color(0xFF, 0xFF, 0xFF);

    // Severity
    private static final Color CRIT = new Color(0xDC, 0x26, 0x26);
    private static final Color CRIT_BG = new Color(0xFE, 0xF2, 0xF2);
    private static final Color HIGH_C = new Color(0xEA, 0x58, 0x0C);
    private static final Color HIGH_BG = new Color(0xFF, 0xF7, 0xED);
    private static final Color MED_C = new Color(0xCA, 0x8A, 0x04);
    private static final Color MED_BG = new Color(0xFE, 0xFB, 0xE8);
    private static final Color LOW_C = new Color(0x25, 0x63, 0xEB);
    private static final Color LOW_BG = new Color(0xEF, 0xF6, 0xFF);
    private static final Color GREEN = new Color(0x05, 0x96, 0x69);
    private static final Color GREEN_BG = new Color(0xEC, 0xFD, 0xF5);
    private static final Color CODE_BG = new Color(0xF3, 0xF4, 0xF6);

    public byte[] generatePdf(ReviewResponse review, String language) {
        try (ByteArrayOutputStream baos = new ByteArrayOutputStream()) {
            Document doc = new Document(PageSize.A4, 40, 40, 40, 55);
            PdfWriter writer = PdfWriter.getInstance(doc, baos);
            writer.setPageEvent(new PageEvents(language));
            doc.open();

            buildCoverBanner(doc, writer, review, language);
            buildMetrics(doc, review.getMetrics());
            buildIssues(doc, review.getIssues());
            buildSecurityAudit(doc, review.getSecurityAudit());

            doc.close();
            return baos.toByteArray();
        } catch (Exception e) {
            throw new RuntimeException("PDF generation failed", e);
        }
    }

    // ── Cover Banner ──

    private void buildCoverBanner(Document doc, PdfWriter writer, ReviewResponse review, String language)
            throws DocumentException {
        // Blue banner rectangle drawn directly on the page
        PdfContentByte canvas = writer.getDirectContentUnder();
        float pageW = doc.getPageSize().getWidth();
        canvas.setColorFill(BRAND);
        canvas.rectangle(0, doc.getPageSize().getHeight() - 160, pageW, 160);
        canvas.fill();

        // Brand name on banner
        Font brandFont = new Font(Font.HELVETICA, 12, Font.BOLD, WHITE);
        Paragraph brand = new Paragraph("CODESHIELD AI", brandFont);
        brand.setSpacingAfter(4);
        doc.add(brand);

        // Title on banner
        Font titleFont = new Font(Font.HELVETICA, 26, Font.BOLD, WHITE);
        Paragraph title = new Paragraph("Code Review Report", titleFont);
        title.setSpacingAfter(8);
        doc.add(title);

        // Meta line on banner
        String date = LocalDate.now().format(DateTimeFormatter.ofPattern("MMMM d, yyyy"));
        Font metaFont = new Font(Font.HELVETICA, 10, Font.NORMAL, new Color(0xBF, 0xDB, 0xFE));
        Paragraph meta = new Paragraph(cap(language) + "  \u2022  " + date + "  \u2022  " +
                review.getMetrics().getTotalIssues() + " issues found", metaFont);
        meta.setSpacingAfter(30);
        doc.add(meta);

        // Score card — floating card effect
        PdfPTable card = new PdfPTable(new float[]{1.2f, 3f});
        card.setWidthPercentage(100);
        card.setSpacingAfter(20);

        // Left: Score circle
        PdfPCell scoreCell = cell(WHITE, 20);
        scoreCell.setBorderColor(BORDER);
        scoreCell.setBorderWidth(1);
        scoreCell.setHorizontalAlignment(Element.ALIGN_CENTER);
        scoreCell.setVerticalAlignment(Element.ALIGN_MIDDLE);

        Color sc = scoreColor(review.getScore());
        Paragraph scoreNum = new Paragraph(String.valueOf(review.getScore()),
                new Font(Font.HELVETICA, 44, Font.BOLD, sc));
        scoreNum.setAlignment(Element.ALIGN_CENTER);
        scoreCell.addElement(scoreNum);

        Paragraph scoreLabel = new Paragraph("/ 100",
                new Font(Font.HELVETICA, 14, Font.NORMAL, LIGHT));
        scoreLabel.setAlignment(Element.ALIGN_CENTER);
        scoreCell.addElement(scoreLabel);

        String grade = review.getScore() >= 80 ? "Excellent" : review.getScore() >= 60 ? "Good" :
                review.getScore() >= 40 ? "Needs Work" : "Poor";
        Paragraph gradeP = new Paragraph(grade,
                new Font(Font.HELVETICA, 10, Font.BOLD, sc));
        gradeP.setAlignment(Element.ALIGN_CENTER);
        gradeP.setSpacingBefore(4);
        scoreCell.addElement(gradeP);

        card.addCell(scoreCell);

        // Right: Summary
        PdfPCell sumCell = cell(WHITE, 20);
        sumCell.setBorderColor(BORDER);
        sumCell.setBorderWidth(1);

        Paragraph sumH = new Paragraph("Summary", new Font(Font.HELVETICA, 13, Font.BOLD, DARK));
        sumH.setSpacingAfter(8);
        sumCell.addElement(sumH);

        if (review.getSummary() != null) {
            Paragraph sumBody = new Paragraph(review.getSummary(),
                    new Font(Font.HELVETICA, 10, Font.NORMAL, BODY));
            sumBody.setLeading(16);
            sumCell.addElement(sumBody);
        }
        card.addCell(sumCell);

        doc.add(card);
    }

    // ── Metrics Bar ──

    private void buildMetrics(Document doc, ReviewResponse.Metrics m) throws DocumentException {
        if (m == null) return;

        PdfPTable table = new PdfPTable(4);
        table.setWidthPercentage(100);
        table.setSpacingAfter(10);

        metricCell(table, m.getCritical(), "CRITICAL", CRIT, CRIT_BG);
        metricCell(table, m.getHigh(), "HIGH", HIGH_C, HIGH_BG);
        metricCell(table, m.getMedium(), "MEDIUM", MED_C, MED_BG);
        metricCell(table, m.getLow(), "LOW", LOW_C, LOW_BG);

        doc.add(table);
    }

    private void metricCell(PdfPTable t, int count, String label, Color color, Color bg) {
        PdfPCell c = cell(bg, 14);
        c.setBorder(Rectangle.NO_BORDER);
        c.setHorizontalAlignment(Element.ALIGN_CENTER);

        Paragraph num = new Paragraph(String.valueOf(count),
                new Font(Font.HELVETICA, 24, Font.BOLD, color));
        num.setAlignment(Element.ALIGN_CENTER);
        c.addElement(num);

        Paragraph lab = new Paragraph(label,
                new Font(Font.HELVETICA, 7, Font.BOLD, color));
        lab.setAlignment(Element.ALIGN_CENTER);
        lab.setSpacingBefore(2);
        c.addElement(lab);

        t.addCell(c);
    }

    // ── Issues Section ──

    private void buildIssues(Document doc, List<ReviewResponse.Issue> issues) throws DocumentException {
        if (issues == null || issues.isEmpty()) return;

        sectionHeader(doc, "Issues", String.valueOf(issues.size()));

        for (int i = 0; i < issues.size(); i++) {
            buildIssueCard(doc, issues.get(i), i + 1);
        }
    }

    private void buildIssueCard(Document doc, ReviewResponse.Issue issue, int idx) throws DocumentException {
        Color sc = sevColor(issue.getSeverity());

        // Card wrapper
        PdfPTable card = new PdfPTable(1);
        card.setWidthPercentage(100);
        card.setSpacingBefore(idx > 1 ? 12 : 0);
        card.setSpacingAfter(4);
        card.setKeepTogether(true);

        PdfPCell cardCell = cell(WHITE, 0);
        cardCell.setBorderColor(BORDER);
        cardCell.setBorderWidth(0.75f);
        cardCell.setBorderColorLeft(sc);
        cardCell.setBorderWidthLeft(3.5f);

        // Top colored strip: severity + type + line
        PdfPTable headerBar = new PdfPTable(new float[]{3, 7});
        headerBar.setWidthPercentage(100);

        // Left: severity pill
        PdfPCell sevPill = cell(sevBg(issue.getSeverity()), 8);
        sevPill.setBorder(Rectangle.NO_BORDER);
        sevPill.setPaddingLeft(14);
        Paragraph sevP = new Paragraph(issue.getSeverity().toUpperCase(),
                new Font(Font.HELVETICA, 8, Font.BOLD, sc));
        sevPill.addElement(sevP);
        headerBar.addCell(sevPill);

        // Right: type + line
        PdfPCell metaCell = cell(sevBg(issue.getSeverity()), 8);
        metaCell.setBorder(Rectangle.NO_BORDER);
        metaCell.setHorizontalAlignment(Element.ALIGN_RIGHT);
        Paragraph metaP = new Paragraph(issue.getType() + "   \u2022   Line " + issue.getLine(),
                new Font(Font.HELVETICA, 8, Font.NORMAL, MUTED));
        metaP.setAlignment(Element.ALIGN_RIGHT);
        metaCell.addElement(metaP);
        headerBar.addCell(metaCell);

        cardCell.addElement(headerBar);

        // Body padding wrapper
        PdfPTable bodyWrap = new PdfPTable(1);
        bodyWrap.setWidthPercentage(100);
        PdfPCell bodyCell = cell(null, 14);
        bodyCell.setBorder(Rectangle.NO_BORDER);
        bodyCell.setPaddingTop(10);

        // Title
        Paragraph titleP = new Paragraph(idx + ".  " + issue.getTitle(),
                new Font(Font.HELVETICA, 11, Font.BOLD, DARK));
        titleP.setSpacingAfter(6);
        bodyCell.addElement(titleP);

        // Description
        if (issue.getDescription() != null && !issue.getDescription().isBlank()) {
            Paragraph descP = new Paragraph(issue.getDescription(),
                    new Font(Font.HELVETICA, 9.5f, Font.NORMAL, BODY));
            descP.setLeading(15);
            descP.setSpacingAfter(8);
            bodyCell.addElement(descP);
        }

        // Suggestion box
        if (issue.getSuggestion() != null && !issue.getSuggestion().isBlank()) {
            PdfPTable sugBox = new PdfPTable(new float[]{0.3f, 9.7f});
            sugBox.setWidthPercentage(100);

            // Green icon cell
            PdfPCell iconC = cell(GREEN_BG, 8);
            iconC.setBorder(Rectangle.NO_BORDER);
            iconC.setHorizontalAlignment(Element.ALIGN_CENTER);
            iconC.setVerticalAlignment(Element.ALIGN_TOP);
            Paragraph icon = new Paragraph("\u2713",
                    new Font(Font.HELVETICA, 10, Font.BOLD, GREEN));
            icon.setAlignment(Element.ALIGN_CENTER);
            iconC.addElement(icon);
            sugBox.addCell(iconC);

            // Suggestion text cell
            PdfPCell sugTextC = cell(GREEN_BG, 8);
            sugTextC.setBorder(Rectangle.NO_BORDER);
            sugTextC.setPaddingLeft(4);
            Paragraph sugP = new Paragraph(issue.getSuggestion(),
                    new Font(Font.HELVETICA, 9, Font.NORMAL, GREEN));
            sugP.setLeading(14);
            sugTextC.addElement(sugP);
            sugBox.addCell(sugTextC);

            bodyCell.addElement(sugBox);
        }

        bodyWrap.addCell(bodyCell);
        cardCell.addElement(bodyWrap);

        card.addCell(cardCell);
        doc.add(card);

        // Code block (separate, allows page splitting)
        if (issue.getFixedCode() != null && !issue.getFixedCode().isBlank()) {
            buildCodeBlock(doc, issue.getFixedCode());
        }
    }

    private void buildCodeBlock(Document doc, String code) throws DocumentException {
        Color editorBg = new Color(0x1E, 0x1E, 0x2E);     // VS Code dark bg
        Color titleBarBg = new Color(0x2D, 0x2D, 0x3F);    // Title bar
        Color gutterBg = new Color(0x1E, 0x1E, 0x2E);      // Gutter
        Color codeTextCol = new Color(0xCD, 0xD6, 0xF4);   // Code text
        Color lineNumCol = new Color(0x58, 0x5B, 0x70);    // Line numbers
        Color dotRed = new Color(0xFF, 0x56, 0x55);
        Color dotYellow = new Color(0xFE, 0xBC, 0x2E);
        Color dotGreen = new Color(0x27, 0xCA, 0x40);
        Color tabTextCol = new Color(0x94, 0xA3, 0xB8);

        String[] lines = code.split("\n");

        // === Title bar (traffic lights + tab name) — added directly to doc ===
        PdfPTable titleBar = new PdfPTable(1);
        titleBar.setWidthPercentage(94);
        titleBar.setHorizontalAlignment(Element.ALIGN_CENTER);
        titleBar.setSpacingBefore(6);
        titleBar.setSpacingAfter(0);

        PdfPCell titleCell = new PdfPCell();
        titleCell.setBackgroundColor(titleBarBg);
        titleCell.setBorder(Rectangle.NO_BORDER);
        titleCell.setPadding(8);
        titleCell.setPaddingLeft(12);

        Phrase titlePhrase = new Phrase();
        // Traffic light dots
        titlePhrase.add(new Chunk("\u25CF ", new Font(Font.HELVETICA, 9, Font.BOLD, dotRed)));
        titlePhrase.add(new Chunk("\u25CF ", new Font(Font.HELVETICA, 9, Font.BOLD, dotYellow)));
        titlePhrase.add(new Chunk("\u25CF", new Font(Font.HELVETICA, 9, Font.BOLD, dotGreen)));
        titlePhrase.add(new Chunk("       suggested-fix",
                new Font(Font.HELVETICA, 8, Font.NORMAL, tabTextCol)));
        Paragraph titleP = new Paragraph(titlePhrase);
        titleCell.addElement(titleP);
        titleBar.addCell(titleCell);
        doc.add(titleBar);

        // === Code body (line numbers + code) — flat table, no nesting ===
        PdfPTable codeTable = new PdfPTable(new float[]{0.8f, 9.2f});
        codeTable.setWidthPercentage(94);
        codeTable.setHorizontalAlignment(Element.ALIGN_CENTER);
        codeTable.setSpacingBefore(0);
        codeTable.setSpacingAfter(12);
        codeTable.setSplitLate(false);
        codeTable.setSplitRows(true);

        Font numFont = new Font(Font.COURIER, 7.5f, Font.NORMAL, lineNumCol);
        Font codeFont = new Font(Font.COURIER, 8, Font.NORMAL, codeTextCol);

        for (int i = 0; i < lines.length; i++) {
            // Line number cell
            PdfPCell numCell = new PdfPCell(new Phrase(String.valueOf(i + 1), numFont));
            numCell.setBackgroundColor(gutterBg);
            numCell.setBorder(Rectangle.NO_BORDER);
            numCell.setPaddingLeft(10);
            numCell.setPaddingRight(8);
            numCell.setPaddingTop(1.5f);
            numCell.setPaddingBottom(1.5f);
            numCell.setHorizontalAlignment(Element.ALIGN_RIGHT);
            numCell.setVerticalAlignment(Element.ALIGN_MIDDLE);
            codeTable.addCell(numCell);

            // Code line cell
            String lineText = lines[i].isEmpty() ? " " : lines[i];
            PdfPCell lineCell = new PdfPCell(new Phrase(lineText, codeFont));
            lineCell.setBackgroundColor(editorBg);
            lineCell.setBorder(Rectangle.NO_BORDER);
            lineCell.setPaddingLeft(10);
            lineCell.setPaddingTop(1.5f);
            lineCell.setPaddingBottom(1.5f);
            lineCell.setVerticalAlignment(Element.ALIGN_MIDDLE);
            codeTable.addCell(lineCell);
        }

        doc.add(codeTable);
    }

    // ── Security Audit ──

    private void buildSecurityAudit(Document doc, ReviewResponse.SecurityAudit audit) throws DocumentException {
        if (audit == null) return;

        sectionHeader(doc, "Security Audit", null);

        // Risk level badge
        if (audit.getRiskLevel() != null) {
            Color rc = sevColor(audit.getRiskLevel());
            PdfPTable riskTable = new PdfPTable(1);
            riskTable.setWidthPercentage(30);
            riskTable.setHorizontalAlignment(Element.ALIGN_LEFT);
            riskTable.setSpacingAfter(14);

            PdfPCell riskCell = cell(sevBg(audit.getRiskLevel()), 10);
            riskCell.setBorder(Rectangle.NO_BORDER);
            riskCell.setHorizontalAlignment(Element.ALIGN_CENTER);
            Paragraph riskP = new Paragraph("RISK LEVEL:  " + audit.getRiskLevel().toUpperCase(),
                    new Font(Font.HELVETICA, 10, Font.BOLD, rc));
            riskP.setAlignment(Element.ALIGN_CENTER);
            riskCell.addElement(riskP);
            riskTable.addCell(riskCell);
            doc.add(riskTable);
        }

        // Vulnerabilities
        List<ReviewResponse.Vulnerability> vulns = audit.getVulnerabilities();
        if (vulns != null && !vulns.isEmpty()) {
            Paragraph vulnH = new Paragraph("Vulnerabilities",
                    new Font(Font.HELVETICA, 13, Font.BOLD, DARK));
            vulnH.setSpacingAfter(10);
            doc.add(vulnH);

            for (ReviewResponse.Vulnerability v : vulns) {
                PdfPTable vCard = new PdfPTable(1);
                vCard.setWidthPercentage(100);
                vCard.setSpacingAfter(8);
                vCard.setKeepTogether(true);

                PdfPCell vc = cell(SURFACE, 12);
                vc.setBorderColor(BORDER);
                vc.setBorderWidth(0.5f);
                vc.setBorderColorLeft(sevColor(v.getSeverity()));
                vc.setBorderWidthLeft(3f);

                // Header
                Phrase vh = new Phrase();
                vh.add(badge(v.getSeverity() != null ? v.getSeverity().toUpperCase() : "", sevColor(v.getSeverity())));
                if (v.getOwasp() != null) {
                    vh.add(new Chunk("   " + v.getOwasp(),
                            new Font(Font.HELVETICA, 9, Font.BOLD, MUTED)));
                }
                Paragraph vhp = new Paragraph(vh);
                vhp.setSpacingAfter(6);
                vc.addElement(vhp);

                if (v.getDescription() != null) {
                    Paragraph dp = new Paragraph(v.getDescription(),
                            new Font(Font.HELVETICA, 9.5f, Font.NORMAL, BODY));
                    dp.setLeading(14);
                    dp.setSpacingAfter(5);
                    vc.addElement(dp);
                }

                if (v.getRemediation() != null) {
                    Paragraph rp = new Paragraph("\u2713  " + v.getRemediation(),
                            new Font(Font.HELVETICA, 9, Font.NORMAL, GREEN));
                    rp.setLeading(13);
                    vc.addElement(rp);
                }

                vCard.addCell(vc);
                doc.add(vCard);
            }
        }

        // Recommendations
        List<String> recs = audit.getRecommendations();
        if (recs != null && !recs.isEmpty()) {
            Paragraph recH = new Paragraph("Recommendations",
                    new Font(Font.HELVETICA, 13, Font.BOLD, DARK));
            recH.setSpacingBefore(14);
            recH.setSpacingAfter(10);
            doc.add(recH);

            for (int i = 0; i < recs.size(); i++) {
                PdfPTable row = new PdfPTable(new float[]{0.4f, 9.6f});
                row.setWidthPercentage(100);
                row.setKeepTogether(true);
                row.setSpacingAfter(4);

                // Number circle
                PdfPCell numC = cell(BRAND_LIGHT, 6);
                numC.setBorder(Rectangle.NO_BORDER);
                numC.setHorizontalAlignment(Element.ALIGN_CENTER);
                numC.setVerticalAlignment(Element.ALIGN_MIDDLE);
                Paragraph numP = new Paragraph(String.valueOf(i + 1),
                        new Font(Font.HELVETICA, 8, Font.BOLD, BRAND));
                numP.setAlignment(Element.ALIGN_CENTER);
                numC.addElement(numP);
                row.addCell(numC);

                // Text
                PdfPCell txtC = cell(null, 6);
                txtC.setBorder(Rectangle.NO_BORDER);
                Paragraph txtP = new Paragraph(recs.get(i),
                        new Font(Font.HELVETICA, 9.5f, Font.NORMAL, BODY));
                txtP.setLeading(14);
                txtC.addElement(txtP);
                row.addCell(txtC);

                doc.add(row);
            }
        }
    }

    // ── Helpers ──

    private void sectionHeader(Document doc, String title, String count) throws DocumentException {
        // Gradient-like section header bar
        PdfPTable bar = new PdfPTable(1);
        bar.setWidthPercentage(100);
        bar.setSpacingBefore(20);
        bar.setSpacingAfter(14);

        PdfPCell c = cell(SURFACE, 12);
        c.setBorder(Rectangle.NO_BORDER);
        c.setBorderColorBottom(BRAND);
        c.setBorderWidthBottom(2f);

        String text = count != null ? title + "  (" + count + ")" : title;
        Paragraph p = new Paragraph(text,
                new Font(Font.HELVETICA, 16, Font.BOLD, DARK));
        c.addElement(p);
        bar.addCell(c);

        doc.add(bar);
    }

    private Chunk badge(String text, Color color) {
        Font f = new Font(Font.HELVETICA, 8, Font.BOLD, color);
        Chunk ch = new Chunk(" " + text + " ", f);
        ch.setBackground(sevBg(text.toLowerCase()), 3, 2, 3, 2);
        return ch;
    }

    private PdfPCell cell(Color bg, int padding) {
        PdfPCell c = new PdfPCell();
        if (bg != null) c.setBackgroundColor(bg);
        c.setPadding(padding);
        c.setBorder(Rectangle.BOX);
        return c;
    }

    private Color sevColor(String s) {
        if (s == null) return MUTED;
        return switch (s.toLowerCase()) {
            case "critical" -> CRIT;
            case "high" -> HIGH_C;
            case "medium" -> MED_C;
            case "low" -> LOW_C;
            case "safe" -> GREEN;
            default -> MUTED;
        };
    }

    private Color sevBg(String s) {
        if (s == null) return SURFACE;
        return switch (s.toLowerCase()) {
            case "critical" -> CRIT_BG;
            case "high" -> HIGH_BG;
            case "medium" -> MED_BG;
            case "low" -> LOW_BG;
            case "safe" -> GREEN_BG;
            default -> SURFACE;
        };
    }

    private Color scoreColor(int score) {
        if (score >= 80) return GREEN;
        if (score >= 60) return MED_C;
        if (score >= 40) return HIGH_C;
        return CRIT;
    }

    private String cap(String s) {
        return (s == null || s.isEmpty()) ? s : s.substring(0, 1).toUpperCase() + s.substring(1);
    }

    // ── Page Events: Header + Footer + Page Number ──

    private static class PageEvents extends PdfPageEventHelper {
        private final String language;
        private final String date;
        private static final Font HF = new Font(Font.HELVETICA, 7.5f, Font.NORMAL, new Color(0x9C, 0xA3, 0xAF));
        private static final Font PG = new Font(Font.HELVETICA, 7.5f, Font.BOLD, new Color(0x6B, 0x72, 0x80));

        PageEvents(String lang) {
            this.language = lang;
            this.date = LocalDate.now().format(DateTimeFormatter.ofPattern("MMM d, yyyy"));
        }

        @Override
        public void onStartPage(PdfWriter writer, Document doc) {
            if (writer.getPageNumber() > 1) {
                PdfContentByte cb = writer.getDirectContent();
                float y = doc.top() + 18;

                ColumnText.showTextAligned(cb, Element.ALIGN_LEFT,
                        new Phrase("CodeShield AI  \u2022  Code Review Report", HF),
                        doc.leftMargin(), y, 0);

                ColumnText.showTextAligned(cb, Element.ALIGN_RIGHT,
                        new Phrase(cap(language) + "  \u2022  " + date, HF),
                        doc.right(), y, 0);

                // Thin line under header
                cb.setColorStroke(new Color(0xE5, 0xE7, 0xEB));
                cb.setLineWidth(0.5f);
                cb.moveTo(doc.leftMargin(), y - 6);
                cb.lineTo(doc.right(), y - 6);
                cb.stroke();
            }
        }

        @Override
        public void onEndPage(PdfWriter writer, Document doc) {
            PdfContentByte cb = writer.getDirectContent();
            float y = doc.bottom() - 22;
            float center = (doc.right() + doc.left()) / 2;

            // Thin line above footer
            cb.setColorStroke(new Color(0xE5, 0xE7, 0xEB));
            cb.setLineWidth(0.5f);
            cb.moveTo(doc.leftMargin(), y + 10);
            cb.lineTo(doc.right(), y + 10);
            cb.stroke();

            ColumnText.showTextAligned(cb, Element.ALIGN_LEFT,
                    new Phrase("Generated by CodeShield AI", HF),
                    doc.leftMargin(), y, 0);

            ColumnText.showTextAligned(cb, Element.ALIGN_CENTER,
                    new Phrase(date, HF),
                    center, y, 0);

            ColumnText.showTextAligned(cb, Element.ALIGN_RIGHT,
                    new Phrase("Page " + writer.getPageNumber(), PG),
                    doc.right(), y, 0);
        }

        private String cap(String s) {
            return (s == null || s.isEmpty()) ? s : s.substring(0, 1).toUpperCase() + s.substring(1);
        }
    }
}
