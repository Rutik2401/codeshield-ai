package com.codeshield.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import lombok.Data;

@Data
@JsonIgnoreProperties(ignoreUnknown = true)
public class Metrics {
    private int totalIssues;
    private int critical;
    private int high;
    private int medium;
    private int low;
}
