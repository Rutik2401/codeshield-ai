package com.codeshield.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import lombok.Data;
import java.util.List;

@Data
@JsonIgnoreProperties(ignoreUnknown = true)
public class ReviewResponse {
    private String summary;
    private int score;
    private List<Issue> issues;
    private SecurityAudit securityAudit;
    private Metrics metrics;

    @Data
    @JsonIgnoreProperties(ignoreUnknown = true)
    public static class Issue {
        private String id;
        private String type;
        private String severity;
        private int line;
        private String title;
        private String description;
        private String suggestion;
        private String fixedCode;
    }

    @Data
    @JsonIgnoreProperties(ignoreUnknown = true)
    public static class SecurityAudit {
        private List<Vulnerability> vulnerabilities;
        private String riskLevel;
        private List<String> recommendations;
    }

    @Data
    @JsonIgnoreProperties(ignoreUnknown = true)
    public static class Vulnerability {
        private String owasp;
        private String description;
        private String severity;
        private String remediation;
    }

    @Data
    @JsonIgnoreProperties(ignoreUnknown = true)
    public static class Metrics {
        private int totalIssues;
        private int critical;
        private int high;
        private int medium;
        private int low;
    }
}
