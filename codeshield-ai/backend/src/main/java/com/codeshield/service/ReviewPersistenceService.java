package com.codeshield.service;

import com.codeshield.dto.ReviewResponse;
import com.codeshield.entity.Review;
import com.codeshield.entity.User;
import com.codeshield.repository.ReviewRepository;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class ReviewPersistenceService {

    private final ReviewRepository reviewRepository;
    private final com.codeshield.repository.UserRepository userRepository;
    private final ObjectMapper objectMapper;

    public Review saveReview(UUID userId, String code, String language, ReviewResponse response) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found. Please sign in again."));

        String issuesJson = serialize(response.getIssues());
        String securityAuditJson = serialize(response.getSecurityAudit());

        ReviewResponse.Metrics metrics = response.getMetrics();

        Review review = Review.builder()
                .user(user)
                .code(code)
                .language(language)
                .summary(response.getSummary())
                .score(response.getScore())
                .issuesJson(issuesJson)
                .securityAuditJson(securityAuditJson)
                .totalIssues(metrics != null ? metrics.getTotalIssues() : 0)
                .critical(metrics != null ? metrics.getCritical() : 0)
                .high(metrics != null ? metrics.getHigh() : 0)
                .medium(metrics != null ? metrics.getMedium() : 0)
                .low(metrics != null ? metrics.getLow() : 0)
                .build();

        return reviewRepository.save(review);
    }

    public List<Review> getUserReviews(UUID userId) {
        return reviewRepository.findByUserIdOrderByCreatedAtDesc(userId);
    }

    @Transactional
    public void deleteReview(UUID userId, UUID reviewId) {
        reviewRepository.deleteByIdAndUserId(reviewId, userId);
    }

    public Optional<Review> getReviewById(UUID userId, UUID reviewId) {
        return reviewRepository.findById(reviewId)
                .filter(review -> review.getUser().getId().equals(userId));
    }

    private String serialize(Object obj) {
        if (obj == null) return null;
        try {
            return objectMapper.writeValueAsString(obj);
        } catch (JsonProcessingException e) {
            log.error("Failed to serialize object to JSON", e);
            return null;
        }
    }
}
