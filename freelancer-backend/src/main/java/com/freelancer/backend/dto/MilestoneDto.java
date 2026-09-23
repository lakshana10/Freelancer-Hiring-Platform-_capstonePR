package com.freelancer.backend.dto;

import com.freelancer.backend.model.Milestone;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

import java.time.LocalDateTime;

public final class MilestoneDto {

    private MilestoneDto() {
    }

    public static class MilestoneRequest {

        @NotNull(message = "Contract id is required.")
        private Long contractId;

        @NotBlank(message = "Title is required.")
        private String title;

        private String description;

        @NotNull(message = "Amount is required.")
        @Positive(message = "Amount must be positive.")
        private Double amount;

        public MilestoneRequest() {
        }

        public Long getContractId() {
            return contractId;
        }

        public void setContractId(Long contractId) {
            this.contractId = contractId;
        }

        public String getTitle() {
            return title;
        }

        public void setTitle(String title) {
            this.title = title;
        }

        public String getDescription() {
            return description;
        }

        public void setDescription(String description) {
            this.description = description;
        }

        public Double getAmount() {
            return amount;
        }

        public void setAmount(Double amount) {
            this.amount = amount;
        }
    }

    public static class MilestoneSubmitRequest {

        @NotBlank(message = "Submission cannot be empty.")
        private String submission;

        public MilestoneSubmitRequest() {
        }

        public String getSubmission() {
            return submission;
        }

        public void setSubmission(String submission) {
            this.submission = submission;
        }
    }

    public static class MilestoneResponse {

        private Long id;
        private Long contractId;
        private Long jobId;
        private String jobTitle;
        private String title;
        private String description;
        private Double amount;
        private String status;
        private String submission;
        private LocalDateTime createdAt;

        public MilestoneResponse() {
        }

        public static MilestoneResponse from(Milestone milestone) {
            MilestoneResponse response = new MilestoneResponse();
            response.setId(milestone.getId());
            response.setContractId(milestone.getContractId());
            response.setJobId(milestone.getJobId());
            response.setJobTitle(milestone.getJobTitle());
            response.setTitle(milestone.getTitle());
            response.setDescription(milestone.getDescription());
            response.setAmount(milestone.getAmount());
            response.setStatus(milestone.getStatus());
            response.setSubmission(milestone.getSubmission());
            response.setCreatedAt(milestone.getCreatedAt());
            return response;
        }

        public Long getId() {
            return id;
        }

        public void setId(Long id) {
            this.id = id;
        }

        public Long getContractId() {
            return contractId;
        }

        public void setContractId(Long contractId) {
            this.contractId = contractId;
        }

        public Long getJobId() {
            return jobId;
        }

        public void setJobId(Long jobId) {
            this.jobId = jobId;
        }

        public String getJobTitle() {
            return jobTitle;
        }

        public void setJobTitle(String jobTitle) {
            this.jobTitle = jobTitle;
        }

        public String getTitle() {
            return title;
        }

        public void setTitle(String title) {
            this.title = title;
        }

        public String getDescription() {
            return description;
        }

        public void setDescription(String description) {
            this.description = description;
        }

        public Double getAmount() {
            return amount;
        }

        public void setAmount(Double amount) {
            this.amount = amount;
        }

        public String getStatus() {
            return status;
        }

        public void setStatus(String status) {
            this.status = status;
        }

        public String getSubmission() {
            return submission;
        }

        public void setSubmission(String submission) {
            this.submission = submission;
        }

        public LocalDateTime getCreatedAt() {
            return createdAt;
        }

        public void setCreatedAt(LocalDateTime createdAt) {
            this.createdAt = createdAt;
        }
    }
}
