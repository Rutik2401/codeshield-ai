package com.codeshield.controller;

import com.codeshield.dto.ExportRequest;
import com.codeshield.dto.ReviewHistoryItem;
import com.codeshield.dto.ReviewRequest;
import com.codeshield.dto.ReviewResponse;
import com.codeshield.service.GeminiService;
import com.codeshield.service.PdfExportService;
import com.codeshield.service.ReviewPersistenceService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1")
@RequiredArgsConstructor
public class ReviewController {

    private final GeminiService geminiService;
    private final PdfExportService pdfExportService;
    private final ReviewPersistenceService reviewPersistenceService;

    @PostMapping("/review")
    public ResponseEntity<ReviewResponse> reviewCode(@Valid @RequestBody ReviewRequest request) {
        ReviewResponse review = geminiService.analyzeCode(request.getCode(), request.getLanguage());
        UUID userId = getCurrentUserId();
        if (userId != null) {
            reviewPersistenceService.saveReview(userId, request.getCode(), request.getLanguage(), review);
        }
        return ResponseEntity.ok(review);
    }

    @GetMapping("/reviews")
    public ResponseEntity<List<ReviewHistoryItem>> getUserReviews() {
        UUID userId = requireUserId();
        return ResponseEntity.ok(reviewPersistenceService.getUserReviewHistory(userId));
    }

    @GetMapping("/reviews/{id}")
    public ResponseEntity<ReviewHistoryItem> getReview(@PathVariable UUID id) {
        UUID userId = requireUserId();
        return reviewPersistenceService.getReviewHistoryItem(userId, id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/reviews/{id}")
    public ResponseEntity<Void> deleteReview(@PathVariable UUID id) {
        UUID userId = requireUserId();
        reviewPersistenceService.deleteReview(userId, id);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/export/pdf")
    public ResponseEntity<byte[]> exportPdf(@RequestBody ExportRequest request) {
        byte[] pdf = pdfExportService.generatePdf(request.getReview(), request.getLanguage());

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_PDF);
        headers.setContentDispositionFormData("attachment", "codeshield-review.pdf");

        return ResponseEntity.ok().headers(headers).body(pdf);
    }

    @GetMapping("/health")
    public ResponseEntity<String> health() {
        return ResponseEntity.ok("CodeShield AI API is running");
    }

    private UUID getCurrentUserId() {
        Object principal = SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        return principal instanceof UUID ? (UUID) principal : null;
    }

    private UUID requireUserId() {
        UUID userId = getCurrentUserId();
        if (userId == null) {
            throw new RuntimeException("Authentication required");
        }
        return userId;
    }
}
