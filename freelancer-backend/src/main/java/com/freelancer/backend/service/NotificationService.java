package com.freelancer.backend.service;

import com.freelancer.backend.model.Notification;
import com.freelancer.backend.repository.NotificationRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class NotificationService {

    private final NotificationRepository notificationRepository;

    public NotificationService(
            NotificationRepository notificationRepository) {

        this.notificationRepository =
                notificationRepository;
    }

    // Create notification
    public Notification createNotification(
            String email,
            String message) {

        Notification notification =
                new Notification(email, message);

        return notificationRepository.save(notification);
    }

    // Get notifications for a user
    public List<Notification> getNotifications(
            String email) {

        return notificationRepository
                .findByEmailOrderByCreatedAtDesc(email);
    }

    // Mark notification as read
    public Notification markAsRead(Long id) {

        Notification notification =
                notificationRepository
                        .findById(id)
                        .orElseThrow(
                                () -> new RuntimeException(
                                        "Notification not found"
                                )
                        );

        notification.setRead(true);

        return notificationRepository.save(notification);
    }

    // Delete notification
    public void deleteNotification(Long id) {

        notificationRepository.deleteById(id);
    }
}