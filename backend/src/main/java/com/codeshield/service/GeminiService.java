package com.codeshield.service;

import com.codeshield.dto.ReviewResponse;
import com.fasterxml.jackson.core.JsonParser;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;

import java.util.List;
import java.util.Map;

@Service
public class GeminiService {

    private final WebClient webClient;
    private final PromptService promptService;
    private final ObjectMapper objectMapper;

    @Value("${app.gemini.api-key}")
    private String apiKey;

    @Value("${app.gemini.model:gemini-2.0-flash}")
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

            String rawResponse = webClient.post()
                    .uri("/models/{model}:generateContent", model)
                    .header("X-goog-api-key", apiKey)
                    .contentType(MediaType.APPLICATION_JSON)
                    .bodyValue(Map.of(
                            "contents", List.of(Map.of(
                                    "parts", List.of(Map.of("text", prompt))
                            ))
                    ))
                    .retrieve()
                    .bodyToMono(String.class)
                    .block();

            String jsonContent = extractTextFromGeminiResponse(rawResponse);
            // Clean markdown code fences if Gemini wraps them
            jsonContent = jsonContent.replaceAll("^```json\\s*", "").replaceAll("```\\s*$", "").trim();

            // Configure ObjectMapper to handle lenient parsing
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
