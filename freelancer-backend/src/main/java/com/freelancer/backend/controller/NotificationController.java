package com.freelancer.backend.controller;

import com.freelancer.backend.model.Notification;
import com.freelancer.backend.service.NotificationService;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/notifications")
@CrossOrigin(origins = "*")
public class NotificationController {

    private final NotificationService notificationService;

    public NotificationController(
            NotificationService notificationService) {

        this.notificationService =
                notificationService;
    }

    // Create notification
    @PostMapping
    public ResponseEntity<Notification> createNotification(
            @RequestBody NotificationRequest request) {

        Notification notification =
                notificationService.createNotification(
                        request.getEmail(),
                        request.getMessage()
                );

        return ResponseEntity.ok(notification);
    }

    // Get notifications for a user
    @GetMapping("/{email}")
    public ResponseEntity<List<Notification>> getNotifications(
            @PathVariable String email) {

        return ResponseEntity.ok(
                notificationService.getNotifications(email)
        );
    }

    // Mark notification as read
    @PutMapping("/{id}/read")
    public ResponseEntity<Notification> markAsRead(
            @PathVariable Long id) {

        return ResponseEntity.ok(
                notificationService.markAsRead(id)
        );
    }

    // Delete notification
    @DeleteMapping("/{id}")
    public ResponseEntity<String> deleteNotification(
            @PathVariable Long id) {

        notificationService.deleteNotification(id);

        return ResponseEntity.ok(
                "Notification deleted successfully."
        );
    }


    // Request class
    public static class NotificationRequest {

        private String email;

        private String message;

        public NotificationRequest() {
        }

        public String getEmail() {
            return email;
        }

        public void setEmail(String email) {
            this.email = email;
        }

        public String getMessage() {
            return message;
        }

        public void setMessage(String message) {
            this.message = message;
        }
    }
}