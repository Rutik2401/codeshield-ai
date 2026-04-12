package com.codeshield.repository;

import com.codeshield.entity.PrReview;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface PrReviewRepository extends JpaRepository<PrReview, UUID> {
    @Query("SELECT pr FROM PrReview pr JOIN FETCH pr.repository WHERE pr.repository.id = :repositoryId ORDER BY pr.createdAt DESC")
    List<PrReview> findByRepositoryIdOrderByCreatedAtDesc(UUID repositoryId);

    @Query("SELECT pr FROM PrReview pr JOIN FETCH pr.repository r WHERE r.user.id = :userId ORDER BY pr.createdAt DESC")
    List<PrReview> findByRepositoryUserIdOrderByCreatedAtDesc(UUID userId);

    Optional<PrReview> findByRepositoryIdAndPrNumberAndHeadSha(UUID repositoryId, int prNumber, String headSha);
}
