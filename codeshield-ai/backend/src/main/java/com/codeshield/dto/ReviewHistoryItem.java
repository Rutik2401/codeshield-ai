package com.codeshield.dto;

import lombok.Builder;
import lombok.Data;
import java.time.LocalDateTime;

@Data
@Builder
public class ReviewHistoryItem {
    private String id;
    private String code;
    private String language;
    private ReviewResponse review;
    private LocalDateTime createdAt;
}
