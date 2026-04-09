package com.codeshield.repository;

import com.codeshield.entity.ConnectedRepository;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface ConnectedRepositoryRepository extends JpaRepository<ConnectedRepository, UUID> {
    List<ConnectedRepository> findByUserIdOrderByCreatedAtDesc(UUID userId);
    Optional<ConnectedRepository> findByGithubRepoId(Long githubRepoId);
    Optional<ConnectedRepository> findByIdAndUserId(UUID id, UUID userId);
    boolean existsByUserIdAndGithubRepoId(UUID userId, Long githubRepoId);
    void deleteByIdAndUserId(UUID id, UUID userId);
}
