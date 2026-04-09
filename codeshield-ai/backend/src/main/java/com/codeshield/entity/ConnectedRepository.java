package com.codeshield.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "connected_repositories")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ConnectedRepository {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(nullable = false)
    private Long githubRepoId;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false, length = 512)
    private String fullName;

    @Column(nullable = false)
    private String owner;

    @Column(length = 100)
    @Builder.Default
    private String defaultBranch = "main";

    @Builder.Default
    private boolean isPrivate = false;

    @Builder.Default
    private boolean isActive = true;

    @Builder.Default
    private boolean autoReview = true;

    private Long webhookId;

    @Column(columnDefinition = "TEXT")
    private String githubAccessToken;

    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(nullable = false)
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}
