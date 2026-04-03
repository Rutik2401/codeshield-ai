package com.codeshield.repository;

import com.codeshield.entity.Review;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.UUID;

public interface ReviewRepository extends JpaRepository<Review, UUID> {
    List<Review> findByUserIdOrderByCreatedAtDesc(UUID userId);
    long countByUserId(UUID userId);
    void deleteByIdAndUserId(UUID id, UUID userId);
}
