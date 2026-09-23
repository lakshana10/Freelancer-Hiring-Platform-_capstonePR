package com.freelancer.backend.dto;

import com.freelancer.backend.model.Payment;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

public final class PaymentDto {

    private PaymentDto() {
    }

    public static class PaymentRequest {

        @NotNull(message = "Contract id is required.")
        private Long contractId;

        private Long jobId;

        /**
         * Optional: the approved milestone this payment settles.
         */
        private Long milestoneId;

        private String jobTitle;

        private String clientEmail;

        @NotBlank(message = "Freelancer email is required.")
        private String freelancerEmail;

        @NotNull(message = "Amount is required.")
        @Positive(message = "Amount must be positive.")
        private Double amount;

        private String status;

        public PaymentRequest() {
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

        public Long getMilestoneId() {
            return milestoneId;
        }

        public void setMilestoneId(Long milestoneId) {
            this.milestoneId = milestoneId;
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
    }

    public static class PaymentResponse {

        private Long id;
        private Long contractId;
        private Long jobId;
        private Long milestoneId;
        private String jobTitle;
        private String clientEmail;
        private String freelancerEmail;
        private Double amount;
        private String status;

        public PaymentResponse() {
        }

        public static PaymentResponse from(Payment payment) {
            PaymentResponse response = new PaymentResponse();
            response.setId(payment.getId());
            response.setContractId(payment.getContractId());
            response.setJobId(payment.getJobId());
            response.setMilestoneId(payment.getMilestoneId());
            response.setJobTitle(payment.getJobTitle());
            response.setClientEmail(payment.getClientEmail());
            response.setFreelancerEmail(
                    payment.getFreelancerEmail());
            response.setAmount(payment.getAmount());
            response.setStatus(payment.getStatus());
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

        public Long getMilestoneId() {
            return milestoneId;
        }

        public void setMilestoneId(Long milestoneId) {
            this.milestoneId = milestoneId;
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
    }
}
