package com.codeshield.service;

import com.codeshield.dto.ReviewHistoryItem;
import com.codeshield.dto.ReviewResponse;
import com.codeshield.entity.Review;
import com.codeshield.entity.User;
import com.codeshield.repository.ReviewRepository;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.core.type.TypeReference;
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

    public List<ReviewHistoryItem> getUserReviewHistory(UUID userId) {
        return reviewRepository.findByUserIdOrderByCreatedAtDesc(userId).stream()
                .map(this::toHistoryItem)
                .toList();
    }

    public Optional<ReviewHistoryItem> getReviewHistoryItem(UUID userId, UUID reviewId) {
        return reviewRepository.findById(reviewId)
                .filter(r -> r.getUser().getId().equals(userId))
                .map(this::toHistoryItem);
    }

    private ReviewHistoryItem toHistoryItem(Review r) {
        ReviewResponse review = new ReviewResponse();
        review.setSummary(r.getSummary());
        review.setScore(r.getScore());
        review.setIssues(deserialize(r.getIssuesJson(), new TypeReference<>() {}));
        review.setSecurityAudit(deserialize(r.getSecurityAuditJson(), new TypeReference<>() {}));

        ReviewResponse.Metrics metrics = new ReviewResponse.Metrics();
        metrics.setTotalIssues(r.getTotalIssues());
        metrics.setCritical(r.getCritical());
        metrics.setHigh(r.getHigh());
        metrics.setMedium(r.getMedium());
        metrics.setLow(r.getLow());
        review.setMetrics(metrics);

        return ReviewHistoryItem.builder()
                .id(r.getId().toString())
                .code(r.getCode())
                .language(r.getLanguage())
                .review(review)
                .createdAt(r.getCreatedAt())
                .build();
    }

    private <T> T deserialize(String json, TypeReference<T> type) {
        if (json == null) return null;
        try {
            return objectMapper.readValue(json, type);
        } catch (JsonProcessingException e) {
            log.error("Failed to deserialize JSON", e);
            return null;
        }
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
