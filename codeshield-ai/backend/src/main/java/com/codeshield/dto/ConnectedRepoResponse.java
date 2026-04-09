package com.codeshield.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data @Builder @AllArgsConstructor
public class ConnectedRepoResponse {
    private String id;
    private Long githubRepoId;
    private String name;
    private String fullName;
    private String owner;
    private String defaultBranch;
    private boolean isPrivate;
    private boolean isActive;
    private boolean autoReview;
    private LocalDateTime createdAt;
}
