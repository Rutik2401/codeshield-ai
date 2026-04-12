package com.codeshield.controller;

import com.codeshield.dto.ConnectRepoRequest;
import com.codeshield.dto.ConnectedRepoResponse;
import com.codeshield.dto.PrReviewResponse;
import com.codeshield.entity.ConnectedRepository;
import com.codeshield.entity.PrReview;
import com.codeshield.repository.ConnectedRepositoryRepository;
import com.codeshield.repository.PrReviewRepository;
import com.codeshield.service.GitHubService;
import com.codeshield.service.PrReviewPipelineService;
import com.fasterxml.jackson.databind.JsonNode;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.*;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;

@Slf4j
@RestController
@RequestMapping("/api/v1/repositories")
@RequiredArgsConstructor
public class RepositoryController {

    private final ConnectedRepositoryRepository repoRepository;
    private final PrReviewRepository prReviewRepository;
    private final GitHubService gitHubService;
    private final PrReviewPipelineService prReviewPipeline;

    @Value("${app.github.webhook-secret:codeshield-webhook-secret}")
    private String webhookSecret;

    @Value("${app.backend.url:http://localhost:8081}")
    private String backendUrl;

    private final ExecutorService executor = Executors.newSingleThreadExecutor();

    // ═══ List user's connected repos ═══

    @GetMapping
    public ResponseEntity<List<ConnectedRepoResponse>> listRepositories() {
        UUID userId = requireUserId();
        List<ConnectedRepoResponse> repos = repoRepository.findByUserIdOrderByCreatedAtDesc(userId).stream()
                .map(this::toResponse)
                .toList();
        return ResponseEntity.ok(repos);
    }

    // ═══ List GitHub repos available to connect ═══

    @GetMapping("/github")
    public ResponseEntity<List<Map<String, Object>>> listGitHubRepos(
            @RequestHeader("X-GitHub-Token") String githubToken,
            @RequestParam(defaultValue = "1") int page) {
        List<JsonNode> repos = gitHubService.listUserRepos(githubToken, page);
        UUID userId = requireUserId();

        List<Map<String, Object>> result = new ArrayList<>();
        for (JsonNode repo : repos) {
            Long ghId = repo.get("id").asLong();
            boolean connected = repoRepository.existsByUserIdAndGithubRepoId(userId, ghId);

            Map<String, Object> item = new LinkedHashMap<>();
            item.put("id", ghId);
            item.put("name", repo.get("name").asText());
            item.put("fullName", repo.get("full_name").asText());
            item.put("owner", repo.get("owner").get("login").asText());
            item.put("defaultBranch", repo.has("default_branch") ? repo.get("default_branch").asText() : "main");
            item.put("isPrivate", repo.get("private").asBoolean());
            item.put("description", repo.has("description") && !repo.get("description").isNull()
                    ? repo.get("description").asText() : "");
            item.put("language", repo.has("language") && !repo.get("language").isNull()
                    ? repo.get("language").asText() : "");
            item.put("updatedAt", repo.get("updated_at").asText());
            item.put("connected", connected);
            result.add(item);
        }
        return ResponseEntity.ok(result);
    }

    // ═══ Connect a repo ═══

    @PostMapping("/connect")
    public ResponseEntity<ConnectedRepoResponse> connectRepository(
            @RequestHeader("X-GitHub-Token") String githubToken,
            @Valid @RequestBody ConnectRepoRequest request) {
        UUID userId = requireUserId();

        if (repoRepository.existsByUserIdAndGithubRepoId(userId, request.getGithubRepoId())) {
            throw new RuntimeException("Repository already connected");
        }

        // Create webhook on GitHub (skip for localhost — GitHub can't reach it)
        Long webhookId = null;
        String webhookUrl = backendUrl + "/api/v1/webhooks/github";
        if (!backendUrl.contains("localhost")) {
            try {
                webhookId = gitHubService.createWebhook(
                        githubToken, request.getOwner(), request.getName(), webhookUrl, webhookSecret);
            } catch (Exception e) {
                log.warn("Webhook creation failed (will work without auto-review): {}", e.getMessage());
            }
        } else {
            log.info("Skipping webhook creation for localhost. Use manual PR review trigger instead.");
        }

        ConnectedRepository repo = ConnectedRepository.builder()
                .user(com.codeshield.entity.User.builder().id(userId).build())
                .githubRepoId(request.getGithubRepoId())
                .name(request.getName())
                .fullName(request.getFullName())
                .owner(request.getOwner())
                .defaultBranch(request.getDefaultBranch())
                .isPrivate(request.isPrivate())
                .webhookId(webhookId)
                .githubAccessToken(githubToken)
                .build();

        repoRepository.save(repo);
        log.info("Connected repo {} for user {}", repo.getFullName(), userId);

        return ResponseEntity.ok(toResponse(repo));
    }

    // ═══ Disconnect a repo ═══

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> disconnectRepository(
            @PathVariable UUID id,
            @RequestHeader(value = "X-GitHub-Token", required = false) String githubToken) {
        UUID userId = requireUserId();
        ConnectedRepository repo = repoRepository.findByIdAndUserId(id, userId)
                .orElseThrow(() -> new RuntimeException("Repository not found"));

        // Remove webhook from GitHub
        if (repo.getWebhookId() != null) {
            String token = githubToken != null ? githubToken : repo.getGithubAccessToken();
            if (token != null) {
                try {
                    gitHubService.deleteWebhook(token, repo.getOwner(), repo.getName(), repo.getWebhookId());
                } catch (Exception e) {
                    log.warn("Failed to delete webhook: {}", e.getMessage());
                }
            }
        }

        repoRepository.delete(repo);
        log.info("Disconnected repo {} for user {}", repo.getFullName(), userId);
        return ResponseEntity.noContent().build();
    }

    // ═══ Update repo settings ═══

    @PutMapping("/{id}/settings")
    public ResponseEntity<ConnectedRepoResponse> updateSettings(
            @PathVariable UUID id,
            @RequestBody Map<String, Object> settings) {
        UUID userId = requireUserId();
        ConnectedRepository repo = repoRepository.findByIdAndUserId(id, userId)
                .orElseThrow(() -> new RuntimeException("Repository not found"));

        if (settings.containsKey("autoReview")) {
            repo.setAutoReview((Boolean) settings.get("autoReview"));
        }
        if (settings.containsKey("isActive")) {
            repo.setActive((Boolean) settings.get("isActive"));
        }

        repoRepository.save(repo);
        return ResponseEntity.ok(toResponse(repo));
    }

    // ═══ Get PR reviews for a repo ═══

    @GetMapping("/{id}/pr-reviews")
    public ResponseEntity<List<PrReviewResponse>> getPrReviews(@PathVariable UUID id) {
        UUID userId = requireUserId();
        repoRepository.findByIdAndUserId(id, userId)
                .orElseThrow(() -> new RuntimeException("Repository not found"));

        List<PrReviewResponse> reviews = prReviewRepository.findByRepositoryIdOrderByCreatedAtDesc(id).stream()
                .map(this::toPrResponse)
                .toList();
        return ResponseEntity.ok(reviews);
    }

    // ═══ Get all PR reviews for user ═══

    @GetMapping("/pr-reviews")
    public ResponseEntity<List<PrReviewResponse>> getAllPrReviews() {
        UUID userId = requireUserId();
        List<PrReviewResponse> reviews = prReviewRepository.findByRepositoryUserIdOrderByCreatedAtDesc(userId).stream()
                .map(this::toPrResponse)
                .toList();
        return ResponseEntity.ok(reviews);
    }

    // ═══ Trigger manual PR review ═══

    @PostMapping("/{id}/review-pr/{prNumber}")
    public ResponseEntity<Map<String, String>> triggerPrReview(
            @PathVariable UUID id,
            @PathVariable int prNumber) {
        UUID userId = requireUserId();
        ConnectedRepository repo = repoRepository.findByIdAndUserId(id, userId)
                .orElseThrow(() -> new RuntimeException("Repository not found"));

        String token = repo.getGithubAccessToken();
        JsonNode pr = gitHubService.getPullRequest(token, repo.getOwner(), repo.getName(), prNumber);
        String prTitle = pr.get("title").asText();
        String prAuthor = pr.get("user").get("login").asText();
        String headSha = pr.get("head").get("sha").asText();

        executor.submit(() -> {
            try {
                prReviewPipeline.reviewPullRequest(repo, prNumber, prTitle, prAuthor, headSha);
            } catch (Exception e) {
                log.error("Manual PR review failed: {}", e.getMessage());
            }
        });

        return ResponseEntity.ok(Map.of("message", "Review started for PR #" + prNumber));
    }

    // ═══ List open PRs for a connected repo ═══

    @GetMapping("/{id}/open-prs")
    public ResponseEntity<List<Map<String, Object>>> listOpenPrs(@PathVariable UUID id) {
        UUID userId = requireUserId();
        ConnectedRepository repo = repoRepository.findByIdAndUserId(id, userId)
                .orElseThrow(() -> new RuntimeException("Repository not found"));

        String token = repo.getGithubAccessToken();
        List<JsonNode> prs = gitHubService.listOpenPullRequests(token, repo.getOwner(), repo.getName());

        // Check which PRs already have reviews
        Set<Integer> reviewedPrNumbers = prReviewRepository.findByRepositoryIdOrderByCreatedAtDesc(repo.getId())
                .stream()
                .filter(r -> r.getStatus() == PrReview.Status.COMPLETED)
                .map(PrReview::getPrNumber)
                .collect(java.util.stream.Collectors.toSet());

        List<Map<String, Object>> result = new ArrayList<>();
        for (JsonNode pr : prs) {
            int prNumber = pr.get("number").asInt();

            // Fetch individual PR to get additions/deletions/changed_files
            int additions = 0, deletions = 0, changedFiles = 0;
            try {
                JsonNode prDetail = gitHubService.getPullRequest(token, repo.getOwner(), repo.getName(), prNumber);
                additions = prDetail.has("additions") ? prDetail.get("additions").asInt() : 0;
                deletions = prDetail.has("deletions") ? prDetail.get("deletions").asInt() : 0;
                changedFiles = prDetail.has("changed_files") ? prDetail.get("changed_files").asInt() : 0;
            } catch (Exception e) {
                log.debug("Could not fetch PR #{} details: {}", prNumber, e.getMessage());
            }

            Map<String, Object> item = new LinkedHashMap<>();
            item.put("number", prNumber);
            item.put("title", pr.get("title").asText());
            item.put("author", pr.get("user").get("login").asText());
            item.put("authorAvatar", pr.get("user").get("avatar_url").asText());
            item.put("headSha", pr.get("head").get("sha").asText());
            item.put("branch", pr.get("head").get("ref").asText());
            item.put("baseBranch", pr.get("base").get("ref").asText());
            item.put("createdAt", pr.get("created_at").asText());
            item.put("updatedAt", pr.get("updated_at").asText());
            item.put("draft", pr.get("draft").asBoolean());
            item.put("reviewed", reviewedPrNumbers.contains(prNumber));
            item.put("additions", additions);
            item.put("deletions", deletions);
            item.put("changedFiles", changedFiles);
            result.add(item);
        }
        return ResponseEntity.ok(result);
    }

    // ═══ Helpers ═══

    private ConnectedRepoResponse toResponse(ConnectedRepository repo) {
        return ConnectedRepoResponse.builder()
                .id(repo.getId().toString())
                .githubRepoId(repo.getGithubRepoId())
                .name(repo.getName())
                .fullName(repo.getFullName())
                .owner(repo.getOwner())
                .defaultBranch(repo.getDefaultBranch())
                .isPrivate(repo.isPrivate())
                .isActive(repo.isActive())
                .autoReview(repo.isAutoReview())
                .createdAt(repo.getCreatedAt())
                .build();
    }

    private PrReviewResponse toPrResponse(PrReview pr) {
        return PrReviewResponse.builder()
                .id(pr.getId().toString())
                .repositoryFullName(pr.getRepository().getFullName())
                .prNumber(pr.getPrNumber())
                .prTitle(pr.getPrTitle())
                .prAuthor(pr.getPrAuthor())
                .headSha(pr.getHeadSha())
                .status(pr.getStatus().name())
                .score(pr.getScore())
                .totalIssues(pr.getTotalIssues())
                .critical(pr.getCritical())
                .high(pr.getHigh())
                .medium(pr.getMedium())
                .low(pr.getLow())
                .filesReviewed(pr.getFilesReviewed())
                .githubReviewId(pr.getGithubReviewId())
                .createdAt(pr.getCreatedAt())
                .completedAt(pr.getCompletedAt())
                .build();
    }

    private UUID requireUserId() {
        Object principal = SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        if (principal instanceof UUID uuid) return uuid;
        throw new RuntimeException("Authentication required");
    }
}
