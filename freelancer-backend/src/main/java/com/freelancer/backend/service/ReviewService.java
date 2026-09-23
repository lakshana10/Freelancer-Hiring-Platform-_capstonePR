package com.freelancer.backend.service;

import com.freelancer.backend.dto.ReviewDto.ReviewRequest;
import com.freelancer.backend.dto.ReviewDto.ReviewResponse;
import com.freelancer.backend.exception.BadRequestException;
import com.freelancer.backend.exception.ConflictException;
import com.freelancer.backend.model.Review;
import com.freelancer.backend.repository.ReviewRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ReviewService {

    private final ReviewRepository reviewRepository;

    private final NotificationService notificationService;

    public ReviewService(
            ReviewRepository reviewRepository,
            NotificationService notificationService) {
        this.reviewRepository = reviewRepository;
        this.notificationService = notificationService;
    }

    public ReviewResponse createReview(
            ReviewRequest request,
            String requesterEmail, boolean admin) {

        if (request.getRating() == null
                || request.getRating() < 1
                || request.getRating() > 5) {
            throw new BadRequestException(
                    "Rating must be between 1 and 5.");
        }

        if (request.getComment() == null
                || request.getComment().trim().isEmpty()) {
            throw new BadRequestException(
                    "Review comment cannot be empty.");
        }

        if (request.getContractId() != null
                && reviewRepository.existsByContractId(
                        request.getContractId())) {
            throw new ConflictException(
                    "This contract has already been reviewed.");
        }

        Review review = new Review();
        review.setJobId(request.getJobId());
        review.setContractId(request.getContractId());
        review.setClientEmail(
                admin && request.getClientEmail() != null
                        ? request.getClientEmail()
                        : requesterEmail);
        review.setFreelancerEmail(request.getFreelancerEmail());
        review.setJobTitle(request.getJobTitle());
        review.setRating(request.getRating());
        review.setComment(request.getComment().trim());

        ReviewResponse saved = ReviewResponse.from(
                reviewRepository.save(review));

        notificationService.notify(
                saved.getFreelancerEmail(),
                "You received a " + saved.getRating() + "-star review"
                + (saved.getJobTitle() != null
                        ? " for '" + saved.getJobTitle() + "'."
                        : "."));

        return saved;
    }

    public List<ReviewResponse> getAllReviews() {
        return reviewRepository.findAll()
                .stream()
                .map(ReviewResponse::from)
                .toList();
    }

    public List<ReviewResponse> getReviewsByFreelancer(
            String freelancerEmail) {
        return reviewRepository
                .findByFreelancerEmail(freelancerEmail)
                .stream()
                .map(ReviewResponse::from)
                .toList();
    }

    public List<ReviewResponse> getReviewsByClient(
            String clientEmail) {
        return reviewRepository
                .findByClientEmail(clientEmail)
                .stream()
                .map(ReviewResponse::from)
                .toList();
    }

    public List<ReviewResponse> getReviewsByJob(Long jobId) {
        return reviewRepository.findByJobId(jobId)
                .stream()
                .map(ReviewResponse::from)
                .toList();
    }
}
