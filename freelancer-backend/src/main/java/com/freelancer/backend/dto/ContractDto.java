package com.freelancer.backend.dto;

import com.freelancer.backend.model.Contract;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public final class ContractDto {

    private ContractDto() {
    }

    public static class ContractRequest {

        @NotNull(message = "Job id is required.")
        private Long jobId;

        private String jobTitle;

        private String clientEmail;

        @NotBlank(message = "Freelancer email is required.")
        private String freelancerEmail;

        private String status;

        public ContractRequest() {
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

        public String getClientEmail() {
            return clientEmail;
        }

        public void setClientEmail(String clientEmail) {
            this.clientEmail = clientEmail;
        }

        public String getFreelancerEmail() {
            return freelancerEmail;
        }

        public void setFreelancerEmail(String freelancerEmail) {
            this.freelancerEmail = freelancerEmail;
        }

        public String getStatus() {
            return status;
        }

        public void setStatus(String status) {
            this.status = status;
        }
    }

    public static class ContractResponse {

        private Long id;
        private Long jobId;
        private String jobTitle;
        private String clientEmail;
        private String freelancerEmail;
        private String status;

        public ContractResponse() {
        }

        public static ContractResponse from(Contract contract) {
            ContractResponse response = new ContractResponse();
            response.setId(contract.getId());
            response.setJobId(contract.getJobId());
            response.setJobTitle(contract.getJobTitle());
            response.setClientEmail(contract.getClientEmail());
            response.setFreelancerEmail(
                    contract.getFreelancerEmail());
            response.setStatus(contract.getStatus());
            return response;
        }

        public Long getId() {
            return id;
        }

        public void setId(Long id) {
            this.id = id;
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

        public String getClientEmail() {
            return clientEmail;
        }

        public void setClientEmail(String clientEmail) {
            this.clientEmail = clientEmail;
        }

        public String getFreelancerEmail() {
            return freelancerEmail;
        }

        public void setFreelancerEmail(String freelancerEmail) {
            this.freelancerEmail = freelancerEmail;
        }

        public String getStatus() {
            return status;
        }

        public void setStatus(String status) {
            this.status = status;
        }
    }
}
