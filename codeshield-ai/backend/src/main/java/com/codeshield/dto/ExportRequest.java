package com.codeshield.dto;

import lombok.Data;

@Data
public class ExportRequest {
    private ReviewResponse review;
    private String language;
}
