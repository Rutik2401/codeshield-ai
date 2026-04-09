package com.codeshield.controller;

import com.codeshield.service.WebhookService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@Slf4j
@RestController
@RequestMapping("/api/v1/webhooks")
@RequiredArgsConstructor
public class WebhookController {

    private final WebhookService webhookService;

    @PostMapping("/github")
    public ResponseEntity<String> handleGitHubWebhook(
            @RequestHeader("X-GitHub-Event") String event,
            @RequestHeader("X-Hub-Signature-256") String signature,
            @RequestBody String payload) {

        if (!webhookService.verifySignature(payload, signature)) {
            log.warn("Invalid webhook signature");
            return ResponseEntity.status(401).body("Invalid signature");
        }

        if ("ping".equals(event)) {
            log.info("GitHub webhook ping received");
            return ResponseEntity.ok("pong");
        }

        if ("pull_request".equals(event)) {
            webhookService.handlePullRequestEvent(payload);
            return ResponseEntity.ok("Processing");
        }

        log.info("Ignoring GitHub event: {}", event);
        return ResponseEntity.ok("Ignored");
    }
}
