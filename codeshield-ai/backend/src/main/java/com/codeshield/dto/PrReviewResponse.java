package com.codeshield.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data @Builder @AllArgsConstructor
public class PrReviewResponse {
    private String id;
    private String repositoryFullName;
    private int prNumber;
    private String prTitle;
    private String prAuthor;
    private String headSha;
    private String status;
    private int score;
    private int totalIssues;
    private int critical;
    private int high;
    private int medium;
    private int low;
    private int filesReviewed;
    private Long githubReviewId;
    private LocalDateTime createdAt;
    private LocalDateTime completedAt;
}
