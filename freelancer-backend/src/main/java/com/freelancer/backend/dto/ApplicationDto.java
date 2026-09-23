package com.freelancer.backend.dto;

import com.freelancer.backend.model.Application;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public final class ApplicationDto {

    private ApplicationDto() {
    }

    public static class ApplicationRequest {

        private String freelancerEmail;

        @NotNull(message = "Job id is required.")
        private Long jobId;

        @NotBlank(message = "Job title is required.")
        private String jobTitle;

        public ApplicationRequest() {
        }

        public String getFreelancerEmail() {
            return freelancerEmail;
        }

        public void setFreelancerEmail(String freelancerEmail) {
            this.freelancerEmail = freelancerEmail;
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
    }

    public static class ApplicationResponse {

        private Long id;
        private String freelancerEmail;
        private Long jobId;
        private String jobTitle;
        private String status;

        public ApplicationResponse() {
        }

        public static ApplicationResponse from(Application application) {
            ApplicationResponse response = new ApplicationResponse();
            response.setId(application.getId());
            response.setFreelancerEmail(
                    application.getFreelancerEmail());
            response.setJobId(application.getJobId());
            response.setJobTitle(application.getJobTitle());
            response.setStatus(application.getStatus());
            return response;
        }

        public Long getId() {
            return id;
        }

        public void setId(Long id) {
            this.id = id;
        }

        public String getFreelancerEmail() {
            return freelancerEmail;
        }

        public void setFreelancerEmail(String freelancerEmail) {
            this.freelancerEmail = freelancerEmail;
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

        public String getStatus() {
            return status;
        }

        public void setStatus(String status) {
            this.status = status;
        }
    }
}
