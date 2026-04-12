package com.codeshield.service;

import com.codeshield.entity.Notification;
import com.codeshield.entity.User;
import com.codeshield.repository.NotificationRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class NotificationService {

    private final NotificationRepository notificationRepository;

    public void createNotification(UUID userId, Notification.Type type, String title, String message, String link) {
        Notification notification = Notification.builder()
                .user(User.builder().id(userId).build())
                .type(type)
                .title(title)
                .message(message)
                .link(link)
                .build();
        notificationRepository.save(notification);
        log.info("Notification created for user {}: {}", userId, title);
    }

    public List<Notification> getUserNotifications(UUID userId) {
        return notificationRepository.findByUserIdOrderByCreatedAtDesc(userId);
    }

    public long getUnreadCount(UUID userId) {
        return notificationRepository.countByUserIdAndIsReadFalse(userId);
    }

    @Transactional
    public void markAllAsRead(UUID userId) {
        notificationRepository.markAllAsRead(userId);
    }

    @Transactional
    public void markAsRead(UUID notificationId) {
        notificationRepository.findById(notificationId).ifPresent(n -> {
            n.setRead(true);
            notificationRepository.save(n);
        });
    }

    public void deleteNotification(UUID userId, UUID notificationId) {
        notificationRepository.findById(notificationId)
                .filter(n -> n.getUser().getId().equals(userId))
                .ifPresent(notificationRepository::delete);
    }

    @Transactional
    public void clearAll(UUID userId) {
        notificationRepository.deleteAllByUserId(userId);
    }
}
