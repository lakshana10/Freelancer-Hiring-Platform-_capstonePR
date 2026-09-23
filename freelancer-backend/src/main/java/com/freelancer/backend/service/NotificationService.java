package com.freelancer.backend.service;

import com.freelancer.backend.dto.NotificationDto.NotificationRequest;
import com.freelancer.backend.dto.NotificationDto.NotificationResponse;
import com.freelancer.backend.exception.ForbiddenException;
import com.freelancer.backend.exception.ResourceNotFoundException;
import com.freelancer.backend.model.Notification;
import com.freelancer.backend.repository.NotificationRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class NotificationService {

    private final NotificationRepository notificationRepository;

    public NotificationService(
            NotificationRepository notificationRepository) {
        this.notificationRepository = notificationRepository;
    }

    public NotificationResponse createNotification(
            NotificationRequest request) {

        Notification notification = new Notification(
                request.getEmail().trim(),
                request.getMessage().trim());

        return NotificationResponse.from(
                notificationRepository.save(notification));
    }

    public List<NotificationResponse> getNotifications(
            String email) {
        return notificationRepository
                .findByEmailOrderByCreatedAtDesc(email)
                .stream()
                .map(NotificationResponse::from)
                .toList();
    }

    public NotificationResponse markAsRead(
            Long id, String requesterEmail, boolean admin) {

        Notification notification = loadOwned(
                id, requesterEmail, admin);

        notification.setRead(true);

        return NotificationResponse.from(
                notificationRepository.save(notification));
    }

    public void deleteNotification(
            Long id, String requesterEmail, boolean admin) {

        Notification notification = loadOwned(
                id, requesterEmail, admin);

        notificationRepository.delete(notification);
    }

    private Notification loadOwned(
            Long id, String requesterEmail, boolean admin) {

        Notification notification = notificationRepository
                .findById(id)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Notification not found."));

        if (!admin
                && (requesterEmail == null
                    || !requesterEmail.equalsIgnoreCase(
                            notification.getEmail()))) {
            throw new ForbiddenException(
                    "You can only manage your own notifications.");
        }

        return notification;
    }
}
