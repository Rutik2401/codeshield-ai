package com.codeshield.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import lombok.Data;

@Data
@JsonIgnoreProperties(ignoreUnknown = true)
public class Issue {
    private String id;
    private String type;
    private String severity;
    private int line;
    private String title;
    private String description;
    private String suggestion;
    private String fixedCode;
}
