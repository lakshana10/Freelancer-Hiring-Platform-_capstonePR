package com.freelancer.backend.dto;

import com.freelancer.backend.model.Message;
import jakarta.validation.constraints.NotBlank;

import java.time.LocalDateTime;

public final class MessageDto {

    private MessageDto() {
    }

    public static class MessageRequest {

        private String senderEmail;

        @NotBlank(message = "Receiver email is required.")
        private String receiverEmail;

        @NotBlank(message = "Message cannot be empty.")
        private String message;

        /**
         * Optional project room. When present the sender must be a
         * participant of that job (owner client, accepted freelancer
         * or admin).
         */
        private Long jobId;

        public MessageRequest() {
        }

        public String getSenderEmail() {
            return senderEmail;
        }

        public void setSenderEmail(String senderEmail) {
            this.senderEmail = senderEmail;
        }

        public String getReceiverEmail() {
            return receiverEmail;
        }

        public void setReceiverEmail(String receiverEmail) {
            this.receiverEmail = receiverEmail;
        }

        public String getMessage() {
            return message;
        }

        public void setMessage(String message) {
            this.message = message;
        }

        public Long getJobId() {
            return jobId;
        }

        public void setJobId(Long jobId) {
            this.jobId = jobId;
        }
    }

    public static class MessageResponse {

        private Long id;
        private String senderEmail;
        private String receiverEmail;
        private String message;
        private boolean read;
        private LocalDateTime createdAt;
        private Long jobId;

        public MessageResponse() {
        }

        public static MessageResponse from(Message message) {
            MessageResponse response = new MessageResponse();
            response.setId(message.getId());
            response.setSenderEmail(message.getSenderEmail());
            response.setReceiverEmail(message.getReceiverEmail());
            response.setMessage(message.getMessage());
            response.setRead(message.isRead());
            response.setCreatedAt(message.getCreatedAt());
            response.setJobId(message.getJobId());
            return response;
        }

        public Long getId() {
            return id;
        }

        public void setId(Long id) {
            this.id = id;
        }

        public String getSenderEmail() {
            return senderEmail;
        }

        public void setSenderEmail(String senderEmail) {
            this.senderEmail = senderEmail;
        }

        public String getReceiverEmail() {
            return receiverEmail;
        }

        public void setReceiverEmail(String receiverEmail) {
            this.receiverEmail = receiverEmail;
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

        public Long getJobId() {
            return jobId;
        }

        public void setJobId(Long jobId) {
            this.jobId = jobId;
        }
    }
}
