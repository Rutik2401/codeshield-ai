package com.codeshield.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "reviews")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Review {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(columnDefinition = "TEXT", nullable = false)
    private String code;

    @Column(length = 50, nullable = false)
    private String language;

    @Column(columnDefinition = "TEXT")
    private String summary;

    @Column(nullable = false)
    @Builder.Default
    private int score = 0;

    @Column(columnDefinition = "TEXT")
    private String issuesJson;

    @Column(columnDefinition = "TEXT")
    private String securityAuditJson;

    @Column(nullable = false)
    @Builder.Default
    private int totalIssues = 0;

    @Column(nullable = false)
    @Builder.Default
    private int critical = 0;

    @Column(nullable = false)
    @Builder.Default
    private int high = 0;

    @Column(nullable = false)
    @Builder.Default
    private int medium = 0;

    @Column(nullable = false)
    @Builder.Default
    private int low = 0;

    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }
}
