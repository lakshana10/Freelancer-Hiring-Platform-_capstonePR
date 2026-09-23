package com.freelancer.backend.dto;

import com.freelancer.backend.model.Review;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public final class ReviewDto {

    private ReviewDto() {
    }

    public static class ReviewRequest {

        private Long jobId;

        private Long contractId;

        private String clientEmail;

        @NotBlank(message = "Freelancer email is required.")
        private String freelancerEmail;

        private String jobTitle;

        @NotNull(message = "Rating is required.")
        @Min(value = 1, message = "Rating must be between 1 and 5.")
        @Max(value = 5, message = "Rating must be between 1 and 5.")
        private Integer rating;

        @NotBlank(message = "Review comment cannot be empty.")
        private String comment;

        public ReviewRequest() {
        }

        public Long getJobId() {
            return jobId;
        }

        public void setJobId(Long jobId) {
            this.jobId = jobId;
        }

        public Long getContractId() {
            return contractId;
        }

        public void setContractId(Long contractId) {
            this.contractId = contractId;
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

        public String getJobTitle() {
            return jobTitle;
        }

        public void setJobTitle(String jobTitle) {
            this.jobTitle = jobTitle;
        }

        public Integer getRating() {
            return rating;
        }

        public void setRating(Integer rating) {
            this.rating = rating;
        }

        public String getComment() {
            return comment;
        }

        public void setComment(String comment) {
            this.comment = comment;
        }
    }

    public static class ReviewResponse {

        private Long id;
        private Long jobId;
        private Long contractId;
        private String clientEmail;
        private String freelancerEmail;
        private String jobTitle;
        private Integer rating;
        private String comment;

        public ReviewResponse() {
        }

        public static ReviewResponse from(Review review) {
            ReviewResponse response = new ReviewResponse();
            response.setId(review.getId());
            response.setJobId(review.getJobId());
            response.setContractId(review.getContractId());
            response.setClientEmail(review.getClientEmail());
            response.setFreelancerEmail(
                    review.getFreelancerEmail());
            response.setJobTitle(review.getJobTitle());
            response.setRating(review.getRating());
            response.setComment(review.getComment());
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

        public Long getContractId() {
            return contractId;
        }

        public void setContractId(Long contractId) {
            this.contractId = contractId;
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

        public String getJobTitle() {
            return jobTitle;
        }

        public void setJobTitle(String jobTitle) {
            this.jobTitle = jobTitle;
        }

        public Integer getRating() {
            return rating;
        }

        public void setRating(Integer rating) {
            this.rating = rating;
        }

        public String getComment() {
            return comment;
        }

        public void setComment(String comment) {
            this.comment = comment;
        }
    }
}
