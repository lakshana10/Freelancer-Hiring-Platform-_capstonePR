package com.freelancer.backend.controller;

import com.freelancer.backend.dto.ReviewDto.ReviewRequest;
import com.freelancer.backend.dto.ReviewDto.ReviewResponse;
import com.freelancer.backend.security.SecurityUtils;
import com.freelancer.backend.service.ReviewService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/reviews")
public class ReviewController {

    private final ReviewService reviewService;

    public ReviewController(ReviewService reviewService) {
        this.reviewService = reviewService;
    }

    @PostMapping
    public ResponseEntity<ReviewResponse> createReview(
            @Valid @RequestBody ReviewRequest request) {

        ReviewResponse created = reviewService.createReview(
                request,
                SecurityUtils.currentEmail(),
                SecurityUtils.isAdmin());

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(created);
    }

    @GetMapping
    public ResponseEntity<List<ReviewResponse>> getAllReviews() {
        return ResponseEntity.ok(
                reviewService.getAllReviews());
    }

    @GetMapping("/freelancer/{email}")
    public ResponseEntity<List<ReviewResponse>> getReviewsByFreelancer(
            @PathVariable String email) {

        return ResponseEntity.ok(reviewService
                .getReviewsByFreelancer(email));
    }

    @GetMapping("/client/{email}")
    public ResponseEntity<List<ReviewResponse>> getReviewsByClient(
            @PathVariable String email) {

        return ResponseEntity.ok(
                reviewService.getReviewsByClient(email));
    }

    @GetMapping("/job/{jobId}")
    public ResponseEntity<List<ReviewResponse>> getReviewsByJob(
            @PathVariable Long jobId) {

        return ResponseEntity.ok(
                reviewService.getReviewsByJob(jobId));
    }
}
