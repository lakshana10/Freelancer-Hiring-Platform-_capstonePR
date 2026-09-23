package com.freelancer.backend.dto;

import com.freelancer.backend.model.Notification;
import jakarta.validation.constraints.NotBlank;

import java.time.LocalDateTime;

public final class NotificationDto {

    private NotificationDto() {
    }

    public static class NotificationRequest {

        @NotBlank(message = "Email is required.")
        private String email;

        @NotBlank(message = "Message cannot be empty.")
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

    public static class NotificationResponse {

        private Long id;
        private String email;
        private String message;
        private boolean read;
        private LocalDateTime createdAt;

        public NotificationResponse() {
        }

        public static NotificationResponse from(
                Notification notification) {
            NotificationResponse response =
                    new NotificationResponse();
            response.setId(notification.getId());
            response.setEmail(notification.getEmail());
            response.setMessage(notification.getMessage());
            response.setRead(notification.isRead());
            response.setCreatedAt(notification.getCreatedAt());
            return response;
        }

        public Long getId() {
            return id;
        }

        public void setId(Long id) {
            this.id = id;
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

        public boolean isRead() {
            return read;
        }

        public void setRead(boolean read) {
            this.read = read;
        }

        public LocalDateTime getCreatedAt() {
            return createdAt;
        }

        public void setCreatedAt(LocalDateTime createdAt) {
            this.createdAt = createdAt;
        }
    }
}
