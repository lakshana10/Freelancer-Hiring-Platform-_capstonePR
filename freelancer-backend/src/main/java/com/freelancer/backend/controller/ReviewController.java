package com.freelancer.backend.controller;

import com.freelancer.backend.model.Review;
import com.freelancer.backend.service.ReviewService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/reviews")
@CrossOrigin
public class ReviewController {

    private final ReviewService reviewService;

    public ReviewController(ReviewService reviewService) {
        this.reviewService = reviewService;
    }

    @PostMapping
    public Review createReview(
            @RequestBody Review review) {

        return reviewService.createReview(review);
    }

    @GetMapping
    public List<Review> getAllReviews() {

        return reviewService.getAllReviews();
    }

    @GetMapping("/freelancer/{email}")
    public List<Review> getReviewsByFreelancer(
            @PathVariable String email) {

        return reviewService.getReviewsByFreelancer(
                email
        );
    }

    @GetMapping("/client/{email}")
    public List<Review> getReviewsByClient(
            @PathVariable String email) {

        return reviewService.getReviewsByClient(
                email
        );
    }

    @GetMapping("/job/{jobId}")
    public List<Review> getReviewsByJob(
            @PathVariable Long jobId) {

        return reviewService.getReviewsByJob(
                jobId
        );
    }
}