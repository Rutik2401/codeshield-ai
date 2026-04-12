package com.codeshield.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import org.springframework.web.reactive.function.client.WebClientResponseException;

import java.util.*;

@Slf4j
@Service
public class GitHubService {

    private final WebClient githubApi;
    private final ObjectMapper objectMapper;

    @Value("${app.github.client-id:}")
    private String clientId;

    @Value("${app.github.client-secret:}")
    private String clientSecret;

    @Value("${app.cors.allowed-origins}")
    private String frontendUrl;

    public GitHubService(WebClient.Builder builder, ObjectMapper objectMapper) {
        this.githubApi = builder.baseUrl("https://api.github.com").build();
        this.objectMapper = objectMapper;
    }

    // ═══ OAuth ═══

    public String getOAuthUrl() {
        return "https://github.com/login/oauth/authorize"
                + "?client_id=" + clientId
                + "&redirect_uri=" + frontendUrl + "/oauth-callback?provider=github"
                + "&scope=repo,read:user,user:email"
                + "&state=" + UUID.randomUUID();
    }

    public String exchangeCodeForToken(String code) {
        try {
            String response = WebClient.create()
                    .post()
                    .uri("https://github.com/login/oauth/access_token")
                    .contentType(MediaType.APPLICATION_JSON)
                    .bodyValue(Map.of(
                            "client_id", clientId,
                            "client_secret", clientSecret,
                            "code", code
                    ))
                    .accept(MediaType.APPLICATION_JSON)
                    .retrieve()
                    .bodyToMono(String.class)
                    .block();

            JsonNode json = objectMapper.readTree(response);
            if (json.has("error")) {
                throw new RuntimeException("GitHub OAuth error: " + json.get("error_description").asText());
            }
            return json.get("access_token").asText();
        } catch (Exception e) {
            throw new RuntimeException("Failed to exchange GitHub code for token: " + e.getMessage(), e);
        }
    }

    public JsonNode getAuthenticatedUser(String accessToken) {
        try {
            String response = githubApi.get()
                    .uri("/user")
                    .header("Authorization", "Bearer " + accessToken)
                    .retrieve()
                    .bodyToMono(String.class)
                    .block();
            return objectMapper.readTree(response);
        } catch (Exception e) {
            throw new RuntimeException("Failed to fetch GitHub user: " + e.getMessage(), e);
        }
    }

    public String getUserEmail(String accessToken) {
        try {
            String response = githubApi.get()
                    .uri("/user/emails")
                    .header("Authorization", "Bearer " + accessToken)
                    .retrieve()
                    .bodyToMono(String.class)
                    .block();
            JsonNode emails = objectMapper.readTree(response);
            for (JsonNode email : emails) {
                if (email.get("primary").asBoolean()) {
                    return email.get("email").asText();
                }
            }
            return emails.get(0).get("email").asText();
        } catch (Exception e) {
            throw new RuntimeException("Failed to fetch GitHub email: " + e.getMessage(), e);
        }
    }

    // ═══ Repositories ═══

    public List<JsonNode> listUserRepos(String accessToken, int page) {
        try {
            String response = githubApi.get()
                    .uri(uri -> uri.path("/user/repos")
                            .queryParam("sort", "updated")
                            .queryParam("per_page", 30)
                            .queryParam("page", page)
                            .queryParam("type", "all")
                            .build())
                    .header("Authorization", "Bearer " + accessToken)
                    .retrieve()
                    .bodyToMono(String.class)
                    .block();
            JsonNode repos = objectMapper.readTree(response);
            List<JsonNode> result = new ArrayList<>();
            repos.forEach(result::add);
            return result;
        } catch (Exception e) {
            throw new RuntimeException("Failed to list repos: " + e.getMessage(), e);
        }
    }

    // ═══ Webhooks ═══

    public Long createWebhook(String accessToken, String owner, String repo, String webhookUrl, String secret) {
        try {
            Map<String, Object> body = Map.of(
                    "name", "web",
                    "active", true,
                    "events", List.of("pull_request"),
                    "config", Map.of(
                            "url", webhookUrl,
                            "content_type", "json",
                            "secret", secret,
                            "insecure_ssl", "0"
                    )
            );

            String response = githubApi.post()
                    .uri("/repos/{owner}/{repo}/hooks", owner, repo)
                    .header("Authorization", "Bearer " + accessToken)
                    .contentType(MediaType.APPLICATION_JSON)
                    .bodyValue(body)
                    .retrieve()
                    .bodyToMono(String.class)
                    .block();

            JsonNode json = objectMapper.readTree(response);
            return json.get("id").asLong();
        } catch (Exception e) {
            throw new RuntimeException("Failed to create webhook: " + e.getMessage(), e);
        }
    }

    public void deleteWebhook(String accessToken, String owner, String repo, Long hookId) {
        try {
            githubApi.delete()
                    .uri("/repos/{owner}/{repo}/hooks/{hookId}", owner, repo, hookId)
                    .header("Authorization", "Bearer " + accessToken)
                    .retrieve()
                    .bodyToMono(Void.class)
                    .block();
        } catch (WebClientResponseException.NotFound e) {
            log.warn("Webhook {} already deleted from {}/{}", hookId, owner, repo);
        } catch (Exception e) {
            throw new RuntimeException("Failed to delete webhook: " + e.getMessage(), e);
        }
    }

    // ═══ Pull Request ═══

    public JsonNode getPullRequest(String accessToken, String owner, String repo, int prNumber) {
        try {
            String response = githubApi.get()
                    .uri("/repos/{owner}/{repo}/pulls/{pr}", owner, repo, prNumber)
                    .header("Authorization", "Bearer " + accessToken)
                    .retrieve()
                    .bodyToMono(String.class)
                    .block();
            return objectMapper.readTree(response);
        } catch (Exception e) {
            throw new RuntimeException("Failed to get PR: " + e.getMessage(), e);
        }
    }

    public List<JsonNode> getPullRequestFiles(String accessToken, String owner, String repo, int prNumber) {
        try {
            String response = githubApi.get()
                    .uri("/repos/{owner}/{repo}/pulls/{pr}/files?per_page=100", owner, repo, prNumber)
                    .header("Authorization", "Bearer " + accessToken)
                    .retrieve()
                    .bodyToMono(String.class)
                    .block();
            JsonNode files = objectMapper.readTree(response);
            List<JsonNode> result = new ArrayList<>();
            files.forEach(result::add);
            return result;
        } catch (Exception e) {
            throw new RuntimeException("Failed to get PR files: " + e.getMessage(), e);
        }
    }

    public String getFileContent(String accessToken, String owner, String repo, String path, String ref) {
        try {
            String response = githubApi.get()
                    .uri("/repos/{owner}/{repo}/contents/{path}?ref={ref}", owner, repo, path, ref)
                    .header("Authorization", "Bearer " + accessToken)
                    .header("Accept", "application/vnd.github.raw+json")
                    .retrieve()
                    .bodyToMono(String.class)
                    .block();
            return response;
        } catch (WebClientResponseException.NotFound e) {
            return null; // File deleted in this PR
        } catch (Exception e) {
            throw new RuntimeException("Failed to get file content: " + e.getMessage(), e);
        }
    }

    // ═══ Commit Status ═══

    public void createCommitStatus(String accessToken, String owner, String repo, String sha,
                                    String state, String description, String targetUrl) {
        try {
            Map<String, Object> body = new LinkedHashMap<>();
            body.put("state", state); // "success", "failure", "pending", "error"
            body.put("description", description);
            body.put("context", "CodeShield AI");
            if (targetUrl != null) {
                body.put("target_url", targetUrl);
            }

            githubApi.post()
                    .uri("/repos/{owner}/{repo}/statuses/{sha}", owner, repo, sha)
                    .header("Authorization", "Bearer " + accessToken)
                    .contentType(MediaType.APPLICATION_JSON)
                    .bodyValue(body)
                    .retrieve()
                    .bodyToMono(String.class)
                    .block();

            log.info("Commit status '{}' set for {}/{}@{}", state, owner, repo, sha.substring(0, 7));
        } catch (Exception e) {
            log.warn("Failed to set commit status: {}", e.getMessage());
        }
    }

    // ═══ Labels ═══

    public void addLabels(String accessToken, String owner, String repo, int issueNumber, List<String> labels) {
        try {
            // Ensure labels exist (create if not)
            for (String label : labels) {
                ensureLabelExists(accessToken, owner, repo, label);
            }

            githubApi.post()
                    .uri("/repos/{owner}/{repo}/issues/{issue}/labels", owner, repo, issueNumber)
                    .header("Authorization", "Bearer " + accessToken)
                    .contentType(MediaType.APPLICATION_JSON)
                    .bodyValue(Map.of("labels", labels))
                    .retrieve()
                    .bodyToMono(String.class)
                    .block();

            log.info("Labels {} added to {}/{}#{}", labels, owner, repo, issueNumber);
        } catch (Exception e) {
            log.warn("Failed to add labels: {}", e.getMessage());
        }
    }

    private void ensureLabelExists(String accessToken, String owner, String repo, String labelName) {
        try {
            githubApi.get()
                    .uri("/repos/{owner}/{repo}/labels/{name}", owner, repo, labelName)
                    .header("Authorization", "Bearer " + accessToken)
                    .retrieve()
                    .bodyToMono(String.class)
                    .block();
        } catch (WebClientResponseException.NotFound e) {
            // Create the label
            String color = switch (labelName) {
                case "security-critical" -> "d73a4a";
                case "security-high" -> "e99695";
                case "needs-review" -> "fbca04";
                case "codeshield-clean" -> "0e8a16";
                case "codeshield-reviewed" -> "1d76db";
                default -> "ededed";
            };
            try {
                githubApi.post()
                        .uri("/repos/{owner}/{repo}/labels", owner, repo)
                        .header("Authorization", "Bearer " + accessToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .bodyValue(Map.of("name", labelName, "color", color))
                        .retrieve()
                        .bodyToMono(String.class)
                        .block();
            } catch (Exception createEx) {
                log.debug("Label '{}' may already exist: {}", labelName, createEx.getMessage());
            }
        } catch (Exception e) {
            // Ignore — label check failed but we'll try adding anyway
        }
    }

    // ═══ List Open PRs ═══

    public List<JsonNode> listOpenPullRequests(String accessToken, String owner, String repo) {
        try {
            String response = githubApi.get()
                    .uri(uri -> uri.path("/repos/{owner}/{repo}/pulls")
                            .queryParam("state", "open")
                            .queryParam("sort", "updated")
                            .queryParam("direction", "desc")
                            .queryParam("per_page", 30)
                            .build(owner, repo))
                    .header("Authorization", "Bearer " + accessToken)
                    .retrieve()
                    .bodyToMono(String.class)
                    .block();
            JsonNode prs = objectMapper.readTree(response);
            List<JsonNode> result = new ArrayList<>();
            prs.forEach(result::add);
            return result;
        } catch (Exception e) {
            log.warn("Failed to list open PRs for {}/{}: {}", owner, repo, e.getMessage());
            return List.of();
        }
    }

    // ═══ Post Review ═══

    public Long createPullRequestReview(String accessToken, String owner, String repo, int prNumber,
                                         String body, String event, List<Map<String, Object>> comments) {
        try {
            Map<String, Object> requestBody = new HashMap<>();
            requestBody.put("body", body);
            requestBody.put("event", event); // "COMMENT" or "REQUEST_CHANGES" or "APPROVE"
            if (comments != null && !comments.isEmpty()) {
                requestBody.put("comments", comments);
            }

            String response = githubApi.post()
                    .uri("/repos/{owner}/{repo}/pulls/{pr}/reviews", owner, repo, prNumber)
                    .header("Authorization", "Bearer " + accessToken)
                    .contentType(MediaType.APPLICATION_JSON)
                    .bodyValue(requestBody)
                    .retrieve()
                    .bodyToMono(String.class)
                    .block();

            JsonNode json = objectMapper.readTree(response);
            return json.get("id").asLong();
        } catch (WebClientResponseException e) {
            log.warn("PR review with inline comments failed ({}), retrying without comments...", e.getStatusCode());

            // Retry without inline comments — line numbers may not match the diff
            try {
                Map<String, Object> fallback = new HashMap<>();
                fallback.put("body", body);
                fallback.put("event", "COMMENT");

                String response = githubApi.post()
                        .uri("/repos/{owner}/{repo}/pulls/{pr}/reviews", owner, repo, prNumber)
                        .header("Authorization", "Bearer " + accessToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .bodyValue(fallback)
                        .retrieve()
                        .bodyToMono(String.class)
                        .block();

                JsonNode json = objectMapper.readTree(response);
                return json.get("id").asLong();
            } catch (Exception retryEx) {
                log.error("PR review fallback also failed: {}", retryEx.getMessage());
                throw new RuntimeException("Failed to post PR review: " + retryEx.getMessage(), retryEx);
            }
        } catch (Exception e) {
            log.error("Failed to post PR review: {}", e.getMessage());
            throw new RuntimeException("Failed to post PR review: " + e.getMessage(), e);
        }
    }
}
