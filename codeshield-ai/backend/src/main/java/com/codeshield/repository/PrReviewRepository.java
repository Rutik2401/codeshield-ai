package com.codeshield.repository;

import com.codeshield.entity.PrReview;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface PrReviewRepository extends JpaRepository<PrReview, UUID> {
    List<PrReview> findByRepositoryIdOrderByCreatedAtDesc(UUID repositoryId);
    List<PrReview> findByRepositoryUserIdOrderByCreatedAtDesc(UUID userId);
    boolean existsByRepositoryIdAndPrNumberAndHeadSha(UUID repositoryId, int prNumber, String headSha);
}
