package com.codeshield.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class ReviewRequest {

    @NotBlank(message = "Code cannot be empty")
    @Size(max = 100000, message = "Code must be under 100,000 characters")
    private String code;

    @NotBlank(message = "Language is required")
    private String language;
}
