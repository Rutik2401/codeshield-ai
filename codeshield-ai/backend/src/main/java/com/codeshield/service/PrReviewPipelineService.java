package com.codeshield.service;

import com.codeshield.dto.ReviewResponse;
import com.codeshield.entity.ConnectedRepository;
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

        } catch (Exception e) {
            log.error("PR review pipeline failed for {}#{}: {}", repo.getFullName(), prNumber, e.getMessage());
            prReview.setStatus(PrReview.Status.FAILED);
            prReviewRepository.save(prReview);
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
        sb.append("## CodeShield AI Review\n\n");
        sb.append(String.format("**Score: %d/100** | ", score));
        sb.append(String.format("**Files Reviewed: %d**\n\n", reviews.size()));

        if (totalIssues > 0) {
            sb.append("### Issues Found\n");
            sb.append(String.format("| Critical | High | Medium | Low |\n"));
            sb.append(String.format("|:---:|:---:|:---:|:---:|\n"));
            sb.append(String.format("| %d | %d | %d | %d |\n\n", critical, high, medium, low));
        } else {
            sb.append("No issues found. Code looks clean!\n\n");
        }

        for (FileReview fr : reviews) {
            int issueCount = fr.review.getIssues() != null ? fr.review.getIssues().size() : 0;
            String icon = issueCount == 0 ? "white_check_mark" : "warning";
            sb.append(String.format("- :%s: `%s` — Score: %d, Issues: %d\n",
                    icon, fr.filename, fr.review.getScore(), issueCount));
        }

        sb.append("\n---\n*Powered by [CodeShield AI](https://codeshield-pro.vercel.app)*");
        return sb.toString();
    }

    private List<Map<String, Object>> buildInlineComments(List<FileReview> reviews, String commitId) {
        List<Map<String, Object>> comments = new ArrayList<>();

        for (FileReview fr : reviews) {
            if (fr.review.getIssues() == null) continue;

            for (ReviewResponse.Issue issue : fr.review.getIssues()) {
                if (issue.getLine() <= 0) continue;

                String body = String.format("**%s** — %s\n\n%s\n\n**Suggestion:** %s",
                        issue.getSeverity().toUpperCase(),
                        issue.getTitle(),
                        issue.getDescription(),
                        issue.getSuggestion());

                if (issue.getFixedCode() != null && !issue.getFixedCode().isBlank()) {
                    body += String.format("\n\n```suggestion\n%s\n```", issue.getFixedCode());
                }

                Map<String, Object> comment = new HashMap<>();
                comment.put("path", fr.filename);
                comment.put("line", issue.getLine());
                comment.put("body", body);
                comments.add(comment);
            }
        }

        // GitHub limits inline comments to 50 per review
        if (comments.size() > 50) {
            return comments.subList(0, 50);
        }
        return comments;
    }

    private record FileReview(String filename, String language, ReviewResponse review) {}
}
