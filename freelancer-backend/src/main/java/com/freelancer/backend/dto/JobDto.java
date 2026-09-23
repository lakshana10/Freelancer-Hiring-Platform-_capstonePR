package com.freelancer.backend.dto;

import com.freelancer.backend.model.Job;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

public final class JobDto {

    private JobDto() {
    }

    public static class JobRequest {

        @NotBlank(message = "Title is required.")
        private String title;

        @NotBlank(message = "Description is required.")
        private String description;

        @NotNull(message = "Budget is required.")
        @Positive(message = "Budget must be positive.")
        private Double budget;

        private String skills;

        private String clientEmail;

        public JobRequest() {
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

        public Double getBudget() {
            return budget;
        }

        public void setBudget(Double budget) {
            this.budget = budget;
        }

        public String getSkills() {
            return skills;
        }

        public void setSkills(String skills) {
            this.skills = skills;
        }

        public String getClientEmail() {
            return clientEmail;
        }

        public void setClientEmail(String clientEmail) {
            this.clientEmail = clientEmail;
        }
    }

    public static class JobResponse {

        private Long id;
        private String title;
        private String description;
        private Double budget;
        private String skills;
        private String clientEmail;

        public JobResponse() {
        }

        public static JobResponse from(Job job) {
            JobResponse response = new JobResponse();
            response.setId(job.getId());
            response.setTitle(job.getTitle());
            response.setDescription(job.getDescription());
            response.setBudget(job.getBudget());
            response.setSkills(job.getSkills());
            response.setClientEmail(job.getClientEmail());
            return response;
        }

        public Long getId() {
            return id;
        }

        public void setId(Long id) {
            this.id = id;
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

        public Double getBudget() {
            return budget;
        }

        public void setBudget(Double budget) {
            this.budget = budget;
        }

        public String getSkills() {
            return skills;
        }

        public void setSkills(String skills) {
            this.skills = skills;
        }

        public String getClientEmail() {
            return clientEmail;
        }

        public void setClientEmail(String clientEmail) {
            this.clientEmail = clientEmail;
        }
    }
}
