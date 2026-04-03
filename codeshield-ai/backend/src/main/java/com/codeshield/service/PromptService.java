package com.codeshield.service;

import org.springframework.stereotype.Service;

@Service
public class PromptService {

    public String buildReviewPrompt(String code, String language) {
        return """
            You are CodeShield AI, a senior code reviewer and security auditor.
            Analyze this %s code. Return ONLY valid JSON (no markdown, no extra text):

            {"summary":"1-2 sentence overview","score":0-100,"issues":[{"id":"ISS-001","type":"bug|security|performance|style|best-practice","severity":"critical|high|medium|low","line":15,"title":"Short title","description":"What's wrong","suggestion":"How to fix","fixedCode":"corrected code"}],"securityAudit":{"vulnerabilities":[{"owasp":"A03:2021 Injection","description":"desc","severity":"critical|high|medium|low","remediation":"fix"}],"riskLevel":"critical|high|medium|low|safe","recommendations":["rec1"]},"metrics":{"totalIssues":1,"critical":0,"high":0,"medium":0,"low":1}}

            Rules: Be specific with line numbers. Check OWASP Top 10. Provide working fixedCode. Keep descriptions and suggestions concise (1-2 sentences max). If no issues found, return empty arrays and score 95-100. Ensure the JSON is complete and valid.

            ```%s
            %s
            ```
            """.formatted(language, language, code);
    }
}
