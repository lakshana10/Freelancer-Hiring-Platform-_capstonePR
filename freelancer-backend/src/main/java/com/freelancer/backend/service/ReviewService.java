package com.freelancer.backend.service;

import com.freelancer.backend.model.Review;
import com.freelancer.backend.repository.ReviewRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ReviewService {

    private final ReviewRepository reviewRepository;

    public ReviewService(ReviewRepository reviewRepository) {
        this.reviewRepository = reviewRepository;
    }

    public Review createReview(Review review) {

        if (review.getRating() == null ||
                review.getRating() < 1 ||
                review.getRating() > 5) {

            throw new RuntimeException(
                    "Rating must be between 1 and 5"
            );
        }

        if (review.getComment() == null ||
                review.getComment().trim().isEmpty()) {

            throw new RuntimeException(
                    "Review comment cannot be empty"
            );
        }

        if (review.getContractId() != null &&
                reviewRepository.existsByContractId(
                        review.getContractId())) {

            throw new RuntimeException(
                    "This contract has already been reviewed"
            );
        }

        return reviewRepository.save(review);
    }

    public List<Review> getAllReviews() {
        return reviewRepository.findAll();
    }

    public List<Review> getReviewsByFreelancer(
            String freelancerEmail) {

        return reviewRepository.findByFreelancerEmail(
                freelancerEmail
        );
    }

    public List<Review> getReviewsByClient(
            String clientEmail) {

        return reviewRepository.findByClientEmail(
                clientEmail
        );
    }

    public List<Review> getReviewsByJob(Long jobId) {

        return reviewRepository.findByJobId(jobId);
    }
}