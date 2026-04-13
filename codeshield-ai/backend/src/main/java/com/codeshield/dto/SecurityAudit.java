package com.codeshield.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import lombok.Data;

import java.util.List;

@Data
@JsonIgnoreProperties(ignoreUnknown = true)
public class SecurityAudit {
    private List<Vulnerability> vulnerabilities;
    private String riskLevel;
    private List<String> recommendations;
}
