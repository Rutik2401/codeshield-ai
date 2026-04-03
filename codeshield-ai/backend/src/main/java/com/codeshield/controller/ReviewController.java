package com.codeshield.controller;

import com.codeshield.dto.ReviewRequest;
import com.codeshield.dto.ReviewResponse;
import com.codeshield.service.GeminiService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1")
public class ReviewController {

    private final GeminiService geminiService;

    public ReviewController(GeminiService geminiService) {
        this.geminiService = geminiService;
    }

    @PostMapping("/review")
    public ResponseEntity<ReviewResponse> reviewCode(@Valid @RequestBody ReviewRequest request) {
        ReviewResponse review = geminiService.analyzeCode(request.getCode(), request.getLanguage());
        return ResponseEntity.ok(review);
    }

    @GetMapping("/health")
    public ResponseEntity<String> health() {
        return ResponseEntity.ok("CodeShield AI API is running");
    }
}
