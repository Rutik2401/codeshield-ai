package com.codeshield.service;

import com.codeshield.dto.*;
import com.codeshield.model.CodeChunk;
import com.fasterxml.jackson.core.JsonParser;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import org.springframework.web.reactive.function.client.WebClientResponseException;

import java.time.Duration;
import java.util.*;
import java.util.concurrent.CompletableFuture;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.stream.Collectors;

@Service
public class GeminiService {

    private static final Logger log = LoggerFactory.getLogger(GeminiService.class);

    private final WebClient geminiClient;
    private final WebClient groqClient;
    private final WebClient cerebrasClient;
    private final PromptService promptService;
    private final CodeChunkService chunkService;
    private final ObjectMapper objectMapper;
    private final ExecutorService executor = Executors.newFixedThreadPool(4);

    @Value("${app.gemini.api-key}")
    private String geminiApiKey;

    @Value("${app.gemini.model:gemini-2.5-flash}")
    private String geminiModel;

    @Value("${app.groq.api-key:}")
    private String groqApiKey;

    @Value("${app.cerebras.api-key:}")
    private String cerebrasApiKey;

    // Provider configs: name, models to try
    private static final String[][] GEMINI_MODELS = {
        {"gemini-2.5-flash"}, {"gemini-2.5-flash-lite"}, {"gemini-flash-latest"}
    };
    private static final String GROQ_MODEL = "llama-3.3-70b-versatile";
    private static final int GROQ_MAX_TOKENS = 4096;
    private static final String CEREBRAS_MODEL = "llama3.3-70b";

    public GeminiService(WebClient.Builder builder, PromptService promptService,
                         CodeChunkService chunkService, ObjectMapper objectMapper) {
        this.geminiClient = builder.clone()
                .baseUrl("https://generativelanguage.googleapis.com/v1beta")
                .build();
        this.groqClient = builder.clone()
                .baseUrl("https://api.groq.com/openai/v1")
                .build();
        this.cerebrasClient = builder.clone()
                .baseUrl("https://api.cerebras.ai/v1")
                .build();
        this.promptService = promptService;
        this.chunkService = chunkService;
        this.objectMapper = objectMapper;
    }

    public ReviewResponse analyzeCode(String code, String language) {
        List<CodeChunk> chunks = chunkService.chunkCode(code, language);

        if (chunks.size() == 1) {
            String prompt = promptService.buildReviewPrompt(code, language);
            return callAI(prompt);
        }

        log.info("Splitting code into {} chunks for analysis", chunks.size());

        List<CompletableFuture<ReviewResponse>> futures = chunks.stream()
                .map(chunk -> CompletableFuture.supplyAsync(() -> {
                    String prompt = promptService.buildChunkReviewPrompt(
                            chunk.getCode(), language,
                            chunk.getChunkNumber(), chunk.getTotalChunks(),
                            chunk.getStartLine()
                    );
                    return callAI(prompt);
                }, executor))
                .collect(Collectors.toList());

        List<ReviewResponse> results = futures.stream()
                .map(CompletableFuture::join)
                .collect(Collectors.toList());

        return mergeResults(results);
    }

    /**
     * Tries all providers in order: Gemini models → Groq → Cerebras
     */
    private ReviewResponse callAI(String prompt) {
        List<Exception> errors = new ArrayList<>();

        // 1. Try all Gemini models
        for (String[] modelArr : GEMINI_MODELS) {
            String modelName = modelArr[0];
            try {
                String raw = callGemini(modelName, prompt);
                return parseResponse(extractGeminiText(raw));
            } catch (Exception e) {
                log.warn("Gemini {} failed: {}", modelName, summarizeError(e));
                errors.add(e);
            }
        }

        // 2. Try Groq
        if (groqApiKey != null && !groqApiKey.isBlank()) {
            try {
                String raw = callOpenAICompatible(groqClient, groqApiKey, GROQ_MODEL, prompt, GROQ_MAX_TOKENS);
                return parseResponse(extractOpenAIText(raw));
            } catch (Exception e) {
                log.warn("Groq failed: {}", summarizeError(e));
                errors.add(e);
            }
        }

        // 3. Try Cerebras
        if (cerebrasApiKey != null && !cerebrasApiKey.isBlank()) {
            try {
                String raw = callOpenAICompatible(cerebrasClient, cerebrasApiKey, CEREBRAS_MODEL, prompt, 16384);
                return parseResponse(extractOpenAIText(raw));
            } catch (Exception e) {
                log.warn("Cerebras failed: {}", summarizeError(e));
                errors.add(e);
            }
        }

        String details = errors.stream()
                .map(e -> summarizeError(e))
                .collect(Collectors.joining(" | "));
        throw new RuntimeException("All AI providers failed. Tried " + errors.size() +
                " options. Details: " + details);
    }

    // ═══ Gemini API ═══
    private String callGemini(String modelName, String prompt) {
        log.info("Trying Gemini: {}", modelName);
        Map<String, Object> body = Map.of(
                "contents", List.of(Map.of("parts", List.of(Map.of("text", prompt)))),
                "generationConfig", Map.of(
                        "temperature", 0.0,
                        "maxOutputTokens", 16384,
                        "responseMimeType", "application/json"
                )
        );

        return geminiClient.post()
                .uri("/models/{model}:generateContent", modelName)
                .header("X-goog-api-key", geminiApiKey)
                .contentType(MediaType.APPLICATION_JSON)
                .bodyValue(body)
                .retrieve()
                .bodyToMono(String.class)
                .timeout(Duration.ofSeconds(60))
                .block();
    }

    private String extractGeminiText(String raw) {
        try {
            return objectMapper.readTree(raw).at("/candidates/0/content/parts/0/text").asText();
        } catch (Exception e) {
            throw new RuntimeException("Failed to parse Gemini response", e);
        }
    }

    // ═══ OpenAI-compatible API (Groq & Cerebras) ═══
    private String callOpenAICompatible(WebClient client, String apiKey, String model, String prompt, int maxTokens) {
        log.info("Trying OpenAI-compatible: {} ({})", model, client.toString());

        String systemPrompt = "You are a code reviewer. Return ONLY valid JSON, no markdown, no extra text.";

        Map<String, Object> body = Map.of(
                "model", model,
                "messages", List.of(
                        Map.of("role", "system", "content", systemPrompt),
                        Map.of("role", "user", "content", prompt)
                ),
                "temperature", 0.0,
                "max_tokens", maxTokens,
                "response_format", Map.of("type", "json_object")
        );

        return client.post()
                .uri("/chat/completions")
                .header("Authorization", "Bearer " + apiKey)
                .contentType(MediaType.APPLICATION_JSON)
                .bodyValue(body)
                .retrieve()
                .bodyToMono(String.class)
                .timeout(Duration.ofSeconds(60))
                .block();
    }

    private String extractOpenAIText(String raw) {
        try {
            return objectMapper.readTree(raw).at("/choices/0/message/content").asText();
        } catch (Exception e) {
            throw new RuntimeException("Failed to parse OpenAI-compatible response", e);
        }
    }

    // ═══ Common ═══
    private ReviewResponse parseResponse(String jsonContent) {
        try {
            jsonContent = jsonContent.replaceAll("^```json\\s*", "").replaceAll("```\\s*$", "").trim();
            ObjectMapper lenient = objectMapper.copy();
            lenient.configure(JsonParser.Feature.ALLOW_BACKSLASH_ESCAPING_ANY_CHARACTER, true);
            return lenient.readValue(jsonContent, ReviewResponse.class);
        } catch (Exception e) {
            throw new RuntimeException("Failed to parse AI response: " + e.getMessage(), e);
        }
    }

    private String summarizeError(Exception e) {
        if (e instanceof WebClientResponseException wce) {
            return wce.getStatusCode() + ": " + wce.getResponseBodyAsString().substring(0, Math.min(500, wce.getResponseBodyAsString().length()));
        }
        return e.getMessage();
    }

    // ═══ Merge chunk results ═══
    private ReviewResponse mergeResults(List<ReviewResponse> results) {
        ReviewResponse merged = new ReviewResponse();

        List<Issue> allIssues = new ArrayList<>();
        Set<String> seenTitles = new HashSet<>();
        int issueCounter = 1;

        for (ReviewResponse result : results) {
            if (result.getIssues() != null) {
                for (Issue issue : result.getIssues()) {
                    if (seenTitles.add(issue.getTitle())) {
                        issue.setId("ISS-" + String.format("%03d", issueCounter++));
                        allIssues.add(issue);
                    }
                }
            }
        }
        merged.setIssues(allIssues);

        SecurityAudit mergedAudit = new SecurityAudit();
        List<Vulnerability> allVulns = new ArrayList<>();
        Set<String> seenOwasp = new HashSet<>();
        Set<String> allRecs = new LinkedHashSet<>();
        String worstRisk = "safe";

        for (ReviewResponse result : results) {
            if (result.getSecurityAudit() != null) {
                SecurityAudit audit = result.getSecurityAudit();
                if (audit.getVulnerabilities() != null) {
                    for (Vulnerability vuln : audit.getVulnerabilities()) {
                        if (seenOwasp.add(vuln.getOwasp())) allVulns.add(vuln);
                    }
                }
                if (audit.getRecommendations() != null) allRecs.addAll(audit.getRecommendations());
                worstRisk = worstSeverity(worstRisk, audit.getRiskLevel());
            }
        }
        mergedAudit.setVulnerabilities(allVulns);
        mergedAudit.setRecommendations(new ArrayList<>(allRecs));
        mergedAudit.setRiskLevel(worstRisk);
        merged.setSecurityAudit(mergedAudit);

        Metrics mergedMetrics = new Metrics();
        int critical = 0, high = 0, medium = 0, low = 0;
        for (Issue issue : allIssues) {
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

        int avgScore = (int) results.stream().mapToInt(ReviewResponse::getScore).average().orElse(50);
        merged.setScore(avgScore);
        merged.setSummary("Analyzed in " + results.size() + " chunks. Found " +
                allIssues.size() + " issue(s). " + results.get(0).getSummary());

        return merged;
    }

    private String worstSeverity(String a, String b) {
        Map<String, Integer> rank = Map.of("safe", 0, "low", 1, "medium", 2, "high", 3, "critical", 4);
        return rank.getOrDefault(a, 0) >= rank.getOrDefault(b, 0) ? a : b;
    }
}
