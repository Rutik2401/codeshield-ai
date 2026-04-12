package com.codeshield.service;

import com.codeshield.dto.ReviewResponse;
import com.codeshield.entity.ConnectedRepository;
import com.codeshield.entity.Notification;
import com.codeshield.entity.PrReview;
import com.codeshield.repository.PrReviewRepository;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.*;

@Slf4j
@Service
@RequiredArgsConstructor
public class PrReviewPipelineService {

    private final GitHubService gitHubService;
    private final GeminiService geminiService;
    private final PrReviewRepository prReviewRepository;
    private final NotificationService notificationService;
    private final ObjectMapper objectMapper;

    private static final Set<String> REVIEWABLE_EXTENSIONS = Set.of(
            "java", "js", "ts", "tsx", "jsx", "py", "go", "rs", "rb", "php",
            "c", "cpp", "h", "cs", "kt", "swift", "sql", "html", "css", "scss"
    );

    public void reviewPullRequest(ConnectedRepository repo, int prNumber,
                                   String prTitle, String prAuthor, String headSha) {
        // Skip only if COMPLETED for this exact commit
        var existing = prReviewRepository.findByRepositoryIdAndPrNumberAndHeadSha(repo.getId(), prNumber, headSha);
        if (existing.isPresent() && existing.get().getStatus() == PrReview.Status.COMPLETED) {
            log.info("PR {}#{} sha {} already reviewed, skipping", repo.getFullName(), prNumber, headSha);
            return;
        }

        // Delete stuck/failed reviews for this PR+SHA so we can retry
        existing.ifPresent(prReviewRepository::delete);

        PrReview prReview = PrReview.builder()
                .repository(repo)
                .prNumber(prNumber)
                .prTitle(prTitle)
                .prAuthor(prAuthor)
                .headSha(headSha)
                .status(PrReview.Status.IN_PROGRESS)
                .build();
        prReviewRepository.save(prReview);

        try {
            String token = repo.getGithubAccessToken();
            String owner = repo.getOwner();
            String repoName = repo.getName();

            // 1. Get changed files
            List<JsonNode> files = gitHubService.getPullRequestFiles(token, owner, repoName, prNumber);
            log.info("PR #{} has {} changed files", prNumber, files.size());

            // 2. Filter to reviewable files and fetch content
            List<FileReview> fileReviews = new ArrayList<>();
            int totalIssues = 0, critical = 0, high = 0, medium = 0, low = 0;
            int totalScore = 0, filesReviewed = 0;

            for (JsonNode file : files) {
                String filename = file.get("filename").asText();
                String status = file.get("status").asText();

                if ("removed".equals(status)) continue;
                if (!isReviewable(filename)) continue;

                String content = gitHubService.getFileContent(token, owner, repoName, filename, headSha);
                if (content == null || content.isBlank()) continue;

                String language = detectLanguage(filename);

                try {
                    // Rate limit: wait 4s between files to stay within Gemini free tier (20 req/min)
                    if (filesReviewed > 0) {
                        Thread.sleep(4000);
                    }
                    ReviewResponse review = geminiService.analyzeCode(content, language);
                    filesReviewed++;
                    totalScore += review.getScore();

                    if (review.getMetrics() != null) {
                        totalIssues += review.getMetrics().getTotalIssues();
                        critical += review.getMetrics().getCritical();
                        high += review.getMetrics().getHigh();
                        medium += review.getMetrics().getMedium();
                        low += review.getMetrics().getLow();
                    }

                    fileReviews.add(new FileReview(filename, language, review));
                } catch (Exception e) {
                    log.warn("Failed to review file {}: {}", filename, e.getMessage());
                }
            }

            // 3. Build review summary and post to GitHub
            int avgScore = filesReviewed > 0 ? totalScore / filesReviewed : 100;
            String reviewBody = buildReviewSummary(prTitle, fileReviews, avgScore, totalIssues, critical, high, medium, low);
            List<Map<String, Object>> inlineComments = buildInlineComments(fileReviews, headSha);

            String event = critical > 0 ? "REQUEST_CHANGES" : "COMMENT";
            Long githubReviewId = gitHubService.createPullRequestReview(
                    token, owner, repoName, prNumber, reviewBody, event, inlineComments);

            // 4. Update PR review record
            prReview.setStatus(PrReview.Status.COMPLETED);
            prReview.setScore(avgScore);
            prReview.setTotalIssues(totalIssues);
            prReview.setCritical(critical);
            prReview.setHigh(high);
            prReview.setMedium(medium);
            prReview.setLow(low);
            prReview.setFilesReviewed(filesReviewed);
            prReview.setGithubReviewId(githubReviewId);
            prReview.setCompletedAt(LocalDateTime.now());
            prReview.setReviewResultJson(objectMapper.writeValueAsString(
                    fileReviews.stream().map(fr -> Map.of(
                            "filename", fr.filename,
                            "language", fr.language,
                            "score", fr.review.getScore(),
                            "issues", fr.review.getIssues() != null ? fr.review.getIssues() : List.of()
                    )).toList()
            ));
            prReviewRepository.save(prReview);

            log.info("PR review completed for {}#{}: score={}, issues={}", repo.getFullName(), prNumber, avgScore, totalIssues);

            // Notify user
            UUID userId = repo.getUser().getId();
            String scoreEmoji = avgScore >= 80 ? "Pass" : avgScore >= 60 ? "Warning" : "Fail";
            notificationService.createNotification(
                    userId,
                    Notification.Type.REVIEW_COMPLETED,
                    "PR #" + prNumber + " Review Complete — " + scoreEmoji,
                    "Score: " + avgScore + "/100 | " + filesReviewed + " files | " + totalIssues + " issues (" + critical + " critical)",
                    "https://github.com/" + repo.getFullName() + "/pull/" + prNumber
            );

        } catch (Exception e) {
            log.error("PR review pipeline failed for {}#{}: {}", repo.getFullName(), prNumber, e.getMessage());
            prReview.setStatus(PrReview.Status.FAILED);
            prReviewRepository.save(prReview);

            // Notify user about failure
            try {
                notificationService.createNotification(
                        repo.getUser().getId(),
                        Notification.Type.REVIEW_FAILED,
                        "PR #" + prNumber + " Review Failed",
                        "Could not complete review for " + repo.getFullName() + ". Please try again.",
                        "https://github.com/" + repo.getFullName() + "/pull/" + prNumber
                );
            } catch (Exception ignored) {}
        }
    }

    private boolean isReviewable(String filename) {
        int dot = filename.lastIndexOf('.');
        if (dot < 0) return false;
        return REVIEWABLE_EXTENSIONS.contains(filename.substring(dot + 1).toLowerCase());
    }

    private String detectLanguage(String filename) {
        int dot = filename.lastIndexOf('.');
        if (dot < 0) return "text";
        String ext = filename.substring(dot + 1).toLowerCase();
        return switch (ext) {
            case "js", "jsx" -> "javascript";
            case "ts", "tsx" -> "typescript";
            case "py" -> "python";
            case "rb" -> "ruby";
            case "rs" -> "rust";
            case "kt" -> "kotlin";
            case "cs" -> "csharp";
            case "cpp", "c", "h" -> "cpp";
            case "scss" -> "css";
            default -> ext;
        };
    }

    private String buildReviewSummary(String prTitle, List<FileReview> reviews, int score,
                                       int totalIssues, int critical, int high, int medium, int low) {
        StringBuilder sb = new StringBuilder();

        // Header
        sb.append("# :shield: Pull Request Review\n\n");
        String verdict = critical > 0 || high > 2 ? ":x: Request Changes" : totalIssues == 0 ? ":white_check_mark: Approved" : ":warning: Requires Attention";
        sb.append(String.format("**Overall Assessment:** %s\n", verdict));
        sb.append(String.format("**Quality Score:** `%d/100`\n", score));
        sb.append(String.format("**Files Reviewed:** %d\n\n", reviews.size()));

        // Issue summary table
        if (totalIssues > 0) {
            sb.append("### :bar_chart: Issue Summary\n\n");
            sb.append("| :red_circle: Critical | :orange_circle: High | :yellow_circle: Medium | :green_circle: Low | **Total** |\n");
            sb.append("|:---:|:---:|:---:|:---:|:---:|\n");
            sb.append(String.format("| %d | %d | %d | %d | **%d** |\n\n", critical, high, medium, low, totalIssues));

            // Security concerns count
            long securityCount = reviews.stream()
                    .filter(fr -> fr.review.getIssues() != null)
                    .flatMap(fr -> fr.review.getIssues().stream())
                    .filter(i -> i.getType() != null && i.getType().toLowerCase().contains("security"))
                    .count();
            if (securityCount > 0) {
                sb.append(String.format(":lock: **Security Concerns:** %d\n\n", securityCount));
            }
        } else {
            sb.append(":white_check_mark: **No issues found.** Code looks clean and ready to merge!\n\n");
        }

        // File-wise breakdown
        sb.append("---\n\n### :file_folder: File-wise Review\n\n");

        for (FileReview fr : reviews) {
            List<ReviewResponse.Issue> issues = fr.review.getIssues();
            int issueCount = issues != null ? issues.size() : 0;
            String fileIcon = issueCount == 0 ? ":white_check_mark:" : ":warning:";

            sb.append(String.format("<details>\n<summary>%s <code>%s</code> — Score: %d/100, Issues: %d</summary>\n\n",
                    fileIcon, fr.filename, fr.review.getScore(), issueCount));

            if (fr.review.getSummary() != null && !fr.review.getSummary().isBlank()) {
                sb.append(String.format("> %s\n\n", fr.review.getSummary()));
            }

            if (issues != null && !issues.isEmpty()) {
                for (ReviewResponse.Issue issue : issues) {
                    String icon = severityIcon(issue.getSeverity());
                    String lineRef = issue.getLine() > 0 ? "Line " + issue.getLine() : "General";

                    sb.append(String.format("**%s — %s %s — %s**\n\n",
                            lineRef, icon, capitalize(issue.getSeverity()),
                            issue.getType() != null ? issue.getType() : "Code Quality"));

                    sb.append(String.format("**Issue:** %s\n", issue.getTitle()));

                    if (issue.getDescription() != null && !issue.getDescription().isBlank()) {
                        sb.append(String.format("**Impact:** %s\n", issue.getDescription()));
                    }

                    if (issue.getSuggestion() != null && !issue.getSuggestion().isBlank()) {
                        sb.append(String.format("**Suggestion:** %s\n", issue.getSuggestion()));
                    }

                    if (issue.getFixedCode() != null && !issue.getFixedCode().isBlank()) {
                        sb.append(String.format("\n```%s\n%s\n```\n", fr.language, issue.getFixedCode()));
                    }
                    sb.append("\n---\n\n");
                }
            } else {
                sb.append(":white_check_mark: No issues found in this file.\n\n");
            }

            sb.append("</details>\n\n");
        }

        // Final verdict
        sb.append("---\n\n### :memo: Final Decision\n\n");
        sb.append(String.format("**Verdict:** %s\n", verdict));
        if (critical > 0) {
            sb.append(String.format("**Reason:** %d critical issue(s) must be resolved before merging.\n", critical));
        } else if (high > 2) {
            sb.append(String.format("**Reason:** %d high severity issue(s) require attention.\n", high));
        } else if (totalIssues == 0) {
            sb.append("**Reason:** Code is clean and follows best practices.\n");
        } else {
            sb.append("**Reason:** Minor issues found — safe to merge after review.\n");
        }
        sb.append("**Reviewed By:** CodeShield AI — Senior Code Review Engine\n\n");
        sb.append("---\n*Powered by [CodeShield AI](https://revidex.vercel.app) :shield:*\n");
        return sb.toString();
    }

    private String severityIcon(String severity) {
        if (severity == null) return ":yellow_circle:";
        return switch (severity.toLowerCase()) {
            case "critical" -> ":red_circle:";
            case "high" -> ":orange_circle:";
            case "medium" -> ":yellow_circle:";
            case "low" -> ":green_circle:";
            default -> ":blue_circle:";
        };
    }

    private String capitalize(String s) {
        if (s == null || s.isEmpty()) return "";
        return s.substring(0, 1).toUpperCase() + s.substring(1).toLowerCase();
    }

    private List<Map<String, Object>> buildInlineComments(List<FileReview> reviews, String commitId) {
        List<Map<String, Object>> comments = new ArrayList<>();

        for (FileReview fr : reviews) {
            if (fr.review.getIssues() == null) continue;

            for (ReviewResponse.Issue issue : fr.review.getIssues()) {
                if (issue.getLine() <= 0) continue;

                String icon = severityIcon(issue.getSeverity());
                StringBuilder body = new StringBuilder();
                body.append(String.format("### %s %s — %s\n\n",
                        icon, capitalize(issue.getSeverity()),
                        issue.getType() != null ? issue.getType() : "Code Quality"));
                body.append(String.format("**Issue:** %s\n\n", issue.getTitle()));

                if (issue.getDescription() != null && !issue.getDescription().isBlank()) {
                    body.append(String.format("**Impact:** %s\n\n", issue.getDescription()));
                }
                if (issue.getSuggestion() != null && !issue.getSuggestion().isBlank()) {
                    body.append(String.format("**Suggestion:** %s\n", issue.getSuggestion()));
                }
                if (issue.getFixedCode() != null && !issue.getFixedCode().isBlank()) {
                    body.append(String.format("\n```suggestion\n%s\n```", issue.getFixedCode()));
                }

                Map<String, Object> comment = new HashMap<>();
                comment.put("path", fr.filename);
                comment.put("line", issue.getLine());
                comment.put("body", body.toString());
                comments.add(comment);
            }
        }

        if (comments.size() > 50) {
            return comments.subList(0, 50);
        }
        return comments;
    }

    private record FileReview(String filename, String language, ReviewResponse review) {}
}
