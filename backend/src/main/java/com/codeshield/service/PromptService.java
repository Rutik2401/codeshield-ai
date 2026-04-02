package com.codeshield.service;

import org.springframework.stereotype.Service;

@Service
public class PromptService {

    public String buildReviewPrompt(String code, String language) {
        return """
            You are CodeShield AI, an expert code reviewer and security auditor.
            You analyze code with the same rigor as a senior developer doing a thorough code review.

            Analyze the following %s code and return ONLY a valid JSON response (no markdown, no explanation outside JSON) with this exact structure:

            {
              "summary": "Brief 1-2 sentence overview of what this code does",
              "score": 72,
              "issues": [
                {
                  "id": "ISS-001",
                  "type": "security",
                  "severity": "critical",
                  "line": 15,
                  "title": "SQL Injection Risk",
                  "description": "User input is directly concatenated into SQL query without sanitization.",
                  "suggestion": "Use parameterized queries or prepared statements.",
                  "fixedCode": "db.query('SELECT * FROM users WHERE id = ?', [userId])"
                }
              ],
              "securityAudit": {
                "vulnerabilities": [
                  {
                    "owasp": "A03:2021 Injection",
                    "description": "SQL injection via unsanitized user input",
                    "severity": "critical",
                    "remediation": "Use parameterized queries"
                  }
                ],
                "riskLevel": "high",
                "recommendations": [
                  "Implement input validation on all user inputs"
                ]
              },
              "metrics": {
                "totalIssues": 5,
                "critical": 1,
                "high": 2,
                "medium": 1,
                "low": 1
              }
            }

            Rules:
            - Return ONLY valid JSON. No markdown code blocks. No text before or after.
            - If the code has no issues, return an empty issues array and score of 95-100.
            - Always check for OWASP Top 10 vulnerabilities.
            - Be specific about line numbers.
            - Provide working fixedCode that can directly replace the buggy code.
            - type must be one of: "bug", "security", "performance", "style", "best-practice"
            - severity must be one of: "critical", "high", "medium", "low"

            Here is the code to review:

            ```%s
            %s
            ```
            """.formatted(language, language, code);
    }
}
