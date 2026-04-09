package com.codeshield.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "pr_reviews")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PrReview {

    public enum Status {
        PENDING, IN_PROGRESS, COMPLETED, FAILED
    }

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "repository_id", nullable = false)
    private ConnectedRepository repository;

    @Column(nullable = false)
    private int prNumber;

    @Column(length = 512)
    private String prTitle;

    private String prAuthor;

    @Column(length = 40)
    private String headSha;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    @Builder.Default
    private Status status = Status.PENDING;

    @Builder.Default
    private int score = 0;

    @Builder.Default
    private int totalIssues = 0;

    @Builder.Default
    private int critical = 0;

    @Builder.Default
    private int high = 0;

    @Builder.Default
    private int medium = 0;

    @Builder.Default
    private int low = 0;

    @Builder.Default
    private int filesReviewed = 0;

    @Column(columnDefinition = "TEXT")
    private String reviewResultJson;

    private Long githubReviewId;

    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    private LocalDateTime completedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }
}
