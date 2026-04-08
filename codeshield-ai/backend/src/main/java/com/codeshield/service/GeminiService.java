package com.codeshield.service;

import com.codeshield.dto.ReviewResponse;
import com.fasterxml.jackson.core.JsonParser;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;

import java.time.Duration;
import java.util.*;
import java.util.concurrent.CompletableFuture;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.stream.Collectors;

import reactor.util.retry.Retry;
import org.springframework.web.reactive.function.client.WebClientResponseException;

@Service
public class GeminiService {

    private static final Logger log = LoggerFactory.getLogger(GeminiService.class);

    private final WebClient webClient;
    private final PromptService promptService;
    private final CodeChunkService chunkService;
    private final ObjectMapper objectMapper;
    private final ExecutorService executor = Executors.newFixedThreadPool(4);

    @Value("${app.gemini.api-key}")
    private String apiKey;

    @Value("${app.gemini.model:gemini-2.5-flash}")
    private String model;

    public GeminiService(WebClient.Builder builder, PromptService promptService,
                         CodeChunkService chunkService, ObjectMapper objectMapper) {
        this.webClient = builder
                .baseUrl("https://generativelanguage.googleapis.com/v1beta")
                .build();
        this.promptService = promptService;
        this.chunkService = chunkService;
        this.objectMapper = objectMapper;
    }

    public ReviewResponse analyzeCode(String code, String language) {
        List<CodeChunkService.CodeChunk> chunks = chunkService.chunkCode(code, language);

        if (chunks.size() == 1) {
            // Small file — single request
            String prompt = promptService.buildReviewPrompt(code, language);
            return callGemini(prompt);
        }

        // Large file — parallel chunk analysis
        log.info("Splitting code into {} chunks for analysis", chunks.size());

        List<CompletableFuture<ReviewResponse>> futures = chunks.stream()
                .map(chunk -> CompletableFuture.supplyAsync(() -> {
                    String prompt = promptService.buildChunkReviewPrompt(
                            chunk.getCode(), language,
                            chunk.getChunkNumber(), chunk.getTotalChunks(),
                            chunk.getStartLine()
                    );
                    return callGemini(prompt);
                }, executor))
                .collect(Collectors.toList());

        List<ReviewResponse> results = futures.stream()
                .map(CompletableFuture::join)
                .collect(Collectors.toList());

        return mergeResults(results);
    }

    private ReviewResponse callGemini(String prompt) {
        try {
            Map<String, Object> requestBody = Map.of(
                    "contents", List.of(Map.of(
                            "parts", List.of(Map.of("text", prompt))
                    )),
                    "generationConfig", Map.of(
                            "temperature", 0.0,
                            "maxOutputTokens", 16384,
                            "responseMimeType", "application/json"
                    )
            );

            String rawResponse = webClient.post()
                    .uri("/models/{model}:generateContent", model)
                    .header("X-goog-api-key", apiKey)
                    .contentType(MediaType.APPLICATION_JSON)
                    .bodyValue(requestBody)
                    .retrieve()
                    .bodyToMono(String.class)
                    .retryWhen(Retry.backoff(3, Duration.ofSeconds(2))
                            .filter(ex -> ex instanceof WebClientResponseException.TooManyRequests)
                            .maxBackoff(Duration.ofSeconds(10)))
                    .timeout(Duration.ofSeconds(90))
                    .block();

            String jsonContent = extractTextFromGeminiResponse(rawResponse);
            jsonContent = jsonContent.replaceAll("^```json\\s*", "").replaceAll("```\\s*$", "").trim();

            ObjectMapper lenientMapper = objectMapper.copy();
            lenientMapper.configure(JsonParser.Feature.ALLOW_BACKSLASH_ESCAPING_ANY_CHARACTER, true);

            return lenientMapper.readValue(jsonContent, ReviewResponse.class);
        } catch (WebClientResponseException e) {
            String body = e.getResponseBodyAsString();
            log.error("Gemini API error [{}]: {}", e.getStatusCode(), body);
            if (body.contains("API_KEY_INVALID")) {
                throw new RuntimeException("Gemini API key is invalid. Check your GEMINI_API_KEY.", e);
            } else if (body.contains("RESOURCE_EXHAUSTED") || e.getStatusCode().value() == 429) {
                throw new RuntimeException("Gemini API quota exceeded. Free tier resets daily — try again later.", e);
            } else if (e.getStatusCode().value() == 400) {
                throw new RuntimeException("Gemini API rejected the request. Model may be unavailable or input too large.", e);
            }
            throw new RuntimeException("Gemini API error: " + e.getStatusCode(), e);
        } catch (Exception e) {
            throw new RuntimeException("Failed to analyze code: " + e.getMessage(), e);
        }
    }

    private ReviewResponse mergeResults(List<ReviewResponse> results) {
        ReviewResponse merged = new ReviewResponse();

        // Merge all issues with unique IDs
        List<ReviewResponse.Issue> allIssues = new ArrayList<>();
        Set<String> seenTitles = new HashSet<>();
        int issueCounter = 1;

        for (ReviewResponse result : results) {
            if (result.getIssues() != null) {
                for (ReviewResponse.Issue issue : result.getIssues()) {
                    // Deduplicate by title (overlap regions may produce duplicates)
                    if (seenTitles.add(issue.getTitle())) {
                        issue.setId("ISS-" + String.format("%03d", issueCounter++));
                        allIssues.add(issue);
                    }
                }
            }
        }
        merged.setIssues(allIssues);

        // Merge security audit
        ReviewResponse.SecurityAudit mergedAudit = new ReviewResponse.SecurityAudit();
        List<ReviewResponse.Vulnerability> allVulns = new ArrayList<>();
        Set<String> seenOwasp = new HashSet<>();
        Set<String> allRecs = new LinkedHashSet<>();
        String worstRisk = "safe";

        for (ReviewResponse result : results) {
            if (result.getSecurityAudit() != null) {
                ReviewResponse.SecurityAudit audit = result.getSecurityAudit();
                if (audit.getVulnerabilities() != null) {
                    for (ReviewResponse.Vulnerability vuln : audit.getVulnerabilities()) {
                        if (seenOwasp.add(vuln.getOwasp())) {
                            allVulns.add(vuln);
                        }
                    }
                }
                if (audit.getRecommendations() != null) {
                    allRecs.addAll(audit.getRecommendations());
                }
                worstRisk = worstSeverity(worstRisk, audit.getRiskLevel());
            }
        }
        mergedAudit.setVulnerabilities(allVulns);
        mergedAudit.setRecommendations(new ArrayList<>(allRecs));
        mergedAudit.setRiskLevel(worstRisk);
        merged.setSecurityAudit(mergedAudit);

        // Calculate merged metrics
        ReviewResponse.Metrics mergedMetrics = new ReviewResponse.Metrics();
        int critical = 0, high = 0, medium = 0, low = 0;
        for (ReviewResponse.Issue issue : allIssues) {
            switch (issue.getSeverity()) {
                case "critical" -> critical++;
                case "high" -> high++;
                case "medium" -> medium++;
                case "low" -> low++;
            }
        }
        mergedMetrics.setTotalIssues(allIssues.size());
        mergedMetrics.setCritical(critical);
        mergedMetrics.setHigh(high);
        mergedMetrics.setMedium(medium);
        mergedMetrics.setLow(low);
        merged.setMetrics(mergedMetrics);

        // Average score across chunks
        int avgScore = (int) results.stream()
                .mapToInt(ReviewResponse::getScore)
                .average()
                .orElse(50);
        merged.setScore(avgScore);

        // Combined summary
        merged.setSummary("Analyzed in " + results.size() + " chunks. Found " +
                allIssues.size() + " issue(s). " +
                results.get(0).getSummary());

        return merged;
    }

    private String worstSeverity(String a, String b) {
        Map<String, Integer> rank = Map.of(
                "safe", 0, "low", 1, "medium", 2, "high", 3, "critical", 4
        );
        int rankA = rank.getOrDefault(a, 0);
        int rankB = rank.getOrDefault(b, 0);
        return rankA >= rankB ? a : b;
    }

    private String extractTextFromGeminiResponse(String rawResponse) {
        try {
            JsonNode root = objectMapper.readTree(rawResponse);
            return root.at("/candidates/0/content/parts/0/text").asText();
        } catch (Exception e) {
            throw new RuntimeException("Failed to parse Gemini response", e);
        }
    }
}
