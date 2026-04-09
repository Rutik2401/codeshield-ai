package com.codeshield.service;

import com.codeshield.entity.ConnectedRepository;
import com.codeshield.repository.ConnectedRepositoryRepository;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.util.HexFormat;
import java.util.Optional;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;

@Slf4j
@Service
@RequiredArgsConstructor
public class WebhookService {

    private final ObjectMapper objectMapper;
    private final ConnectedRepositoryRepository repoRepository;
    private final PrReviewPipelineService prReviewPipeline;

    @Value("${app.github.webhook-secret:codeshield-webhook-secret}")
    private String webhookSecret;

    private final ExecutorService executor = Executors.newFixedThreadPool(2);

    public boolean verifySignature(String payload, String signatureHeader) {
        try {
            String expected = "sha256=" + hmacSha256(webhookSecret, payload);
            return MessageDigest.isEqual(
                    expected.getBytes(StandardCharsets.UTF_8),
                    signatureHeader.getBytes(StandardCharsets.UTF_8)
            );
        } catch (Exception e) {
            log.error("Signature verification failed: {}", e.getMessage());
            return false;
        }
    }

    public void handlePullRequestEvent(String payload) {
        try {
            JsonNode json = objectMapper.readTree(payload);
            String action = json.get("action").asText();

            if (!"opened".equals(action) && !"synchronize".equals(action)) {
                log.info("Ignoring PR action: {}", action);
                return;
            }

            long repoId = json.get("repository").get("id").asLong();
            Optional<ConnectedRepository> connectedRepo = repoRepository.findByGithubRepoId(repoId);

            if (connectedRepo.isEmpty()) {
                log.warn("Webhook for unconnected repo: {}", repoId);
                return;
            }

            ConnectedRepository repo = connectedRepo.get();
            if (!repo.isActive() || !repo.isAutoReview()) {
                log.info("Auto-review disabled for repo: {}", repo.getFullName());
                return;
            }

            JsonNode pr = json.get("pull_request");
            int prNumber = pr.get("number").asInt();
            String prTitle = pr.get("title").asText();
            String prAuthor = pr.get("user").get("login").asText();
            String headSha = pr.get("head").get("sha").asText();

            log.info("Processing PR #{} '{}' on {}", prNumber, prTitle, repo.getFullName());

            // Run review asynchronously
            executor.submit(() -> {
                try {
                    prReviewPipeline.reviewPullRequest(repo, prNumber, prTitle, prAuthor, headSha);
                } catch (Exception e) {
                    log.error("PR review failed for {}#{}: {}", repo.getFullName(), prNumber, e.getMessage());
                }
            });

        } catch (Exception e) {
            log.error("Failed to process webhook payload: {}", e.getMessage());
        }
    }

    private String hmacSha256(String secret, String data) throws Exception {
        Mac mac = Mac.getInstance("HmacSHA256");
        mac.init(new SecretKeySpec(secret.getBytes(StandardCharsets.UTF_8), "HmacSHA256"));
        byte[] hash = mac.doFinal(data.getBytes(StandardCharsets.UTF_8));
        return HexFormat.of().formatHex(hash);
    }
}
