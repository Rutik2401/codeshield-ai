package com.codeshield.service;

import com.codeshield.dto.ReviewResponse;
import com.fasterxml.jackson.core.JsonParser;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;

import java.time.Duration;
import java.util.List;
import java.util.Map;

import reactor.util.retry.Retry;
import org.springframework.web.reactive.function.client.WebClientResponseException;

@Service
public class GeminiService {

    private final WebClient webClient;
    private final PromptService promptService;
    private final ObjectMapper objectMapper;

    @Value("${app.gemini.api-key}")
    private String apiKey;

    @Value("${app.gemini.model:gemini-2.5-flash}")
    private String model;

    public GeminiService(WebClient.Builder builder, PromptService promptService, ObjectMapper objectMapper) {
        this.webClient = builder
                .baseUrl("https://generativelanguage.googleapis.com/v1beta")
                .build();
        this.promptService = promptService;
        this.objectMapper = objectMapper;
    }

    public ReviewResponse analyzeCode(String code, String language) {
        try {
            String prompt = promptService.buildReviewPrompt(code, language);

            Map<String, Object> requestBody = Map.of(
                    "contents", List.of(Map.of(
                            "parts", List.of(Map.of("text", prompt))
                    )),
                    "generationConfig", Map.of(
                            "temperature", 0.1,
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
                    .timeout(Duration.ofSeconds(60))
                    .block();

            String jsonContent = extractTextFromGeminiResponse(rawResponse);
            jsonContent = jsonContent.replaceAll("^```json\\s*", "").replaceAll("```\\s*$", "").trim();

            ObjectMapper lenientMapper = objectMapper.copy();
            lenientMapper.configure(JsonParser.Feature.ALLOW_BACKSLASH_ESCAPING_ANY_CHARACTER, true);

            return lenientMapper.readValue(jsonContent, ReviewResponse.class);
        } catch (Exception e) {
            throw new RuntimeException("Failed to analyze code: " + e.getMessage(), e);
        }
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
