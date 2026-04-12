package com.codeshield.controller;

import com.codeshield.entity.Notification;
import com.codeshield.service.NotificationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.*;

@RestController
@RequestMapping("/api/v1/notifications")
@RequiredArgsConstructor
public class NotificationController {

    private final NotificationService notificationService;

    @GetMapping
    public ResponseEntity<List<Map<String, Object>>> getNotifications() {
        UUID userId = requireUserId();
        List<Notification> notifications = notificationService.getUserNotifications(userId);
        List<Map<String, Object>> result = notifications.stream().map(n -> {
            Map<String, Object> item = new LinkedHashMap<>();
            item.put("id", n.getId().toString());
            item.put("type", n.getType().name());
            item.put("title", n.getTitle());
            item.put("message", n.getMessage());
            item.put("link", n.getLink());
            item.put("isRead", n.isRead());
            item.put("createdAt", n.getCreatedAt());
            return item;
        }).toList();
        return ResponseEntity.ok(result);
    }

    @GetMapping("/unread-count")
    public ResponseEntity<Map<String, Long>> getUnreadCount() {
        UUID userId = requireUserId();
        long count = notificationService.getUnreadCount(userId);
        return ResponseEntity.ok(Map.of("count", count));
    }

    @PostMapping("/mark-all-read")
    public ResponseEntity<Void> markAllAsRead() {
        UUID userId = requireUserId();
        notificationService.markAllAsRead(userId);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/{id}/read")
    public ResponseEntity<Void> markAsRead(@PathVariable UUID id) {
        notificationService.markAsRead(id);
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteNotification(@PathVariable UUID id) {
        UUID userId = requireUserId();
        notificationService.deleteNotification(userId, id);
        return ResponseEntity.noContent().build();
    }

    @DeleteMapping
    public ResponseEntity<Void> clearAll() {
        UUID userId = requireUserId();
        notificationService.clearAll(userId);
        return ResponseEntity.noContent().build();
    }

    private UUID requireUserId() {
        Object principal = SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        if (principal instanceof UUID uuid) return uuid;
        throw new RuntimeException("Authentication required");
    }
}
