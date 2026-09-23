package com.freelancer.backend.controller;

import com.freelancer.backend.dto.NotificationDto.NotificationRequest;
import com.freelancer.backend.dto.NotificationDto.NotificationResponse;
import com.freelancer.backend.security.SecurityUtils;
import com.freelancer.backend.service.NotificationService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/notifications")
public class NotificationController {

    private final NotificationService notificationService;

    public NotificationController(
            NotificationService notificationService) {
        this.notificationService = notificationService;
    }

    // Create notification
    @PostMapping
    public ResponseEntity<NotificationResponse> createNotification(
            @Valid @RequestBody NotificationRequest request) {

        return ResponseEntity.ok(notificationService
                .createNotification(request));
    }

    // Get notifications for a user (self or admin)
    @GetMapping("/{email}")
    @PreAuthorize(
        "#email == authentication.name or hasRole('ADMIN')")
    public ResponseEntity<List<NotificationResponse>> getNotifications(
            @PathVariable String email) {

        return ResponseEntity.ok(notificationService
                .getNotifications(email));
    }

    // Mark notification as read (owner or admin)
    @PutMapping("/{id}/read")
    public ResponseEntity<NotificationResponse> markAsRead(
            @PathVariable Long id) {

        return ResponseEntity.ok(notificationService.markAsRead(
                id,
                SecurityUtils.currentEmail(),
                SecurityUtils.isAdmin()));
    }

    // Delete notification (owner or admin)
    @DeleteMapping("/{id}")
    public ResponseEntity<String> deleteNotification(
            @PathVariable Long id) {

        notificationService.deleteNotification(
                id,
                SecurityUtils.currentEmail(),
                SecurityUtils.isAdmin());

        return ResponseEntity.ok(
                "Notification deleted successfully.");
    }
}
