package com.freelancer.backend.service;

import com.freelancer.backend.dto.ReviewDto.ReviewRequest;
import com.freelancer.backend.dto.ReviewDto.ReviewResponse;
import com.freelancer.backend.exception.BadRequestException;
import com.freelancer.backend.exception.ConflictException;
import com.freelancer.backend.model.Review;
import com.freelancer.backend.repository.ReviewRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class ReviewServiceTest {

    @Mock
    private ReviewRepository reviewRepository;

    private ReviewService reviewService;

    @BeforeEach
    void setUp() {
        reviewService = new ReviewService(reviewRepository);
    }

    private ReviewRequest reviewRequest() {
        ReviewRequest request = new ReviewRequest();
        request.setJobId(1L);
        request.setContractId(2L);
        request.setFreelancerEmail("dev@test.com");
        request.setJobTitle("Build a website");
        request.setRating(5);
        request.setComment("Great work.");
        return request;
    }

    @Test
    void createReviewSucceeds() {
        when(reviewRepository.existsByContractId(2L))
                .thenReturn(false);
        when(reviewRepository.save(any(Review.class)))
                .thenAnswer(invocation ->
                        invocation.getArgument(0));

        ReviewResponse response = reviewService.createReview(
                reviewRequest(), "client@test.com", false);

        assertThat(response.getRating()).isEqualTo(5);
        assertThat(response.getClientEmail())
                .isEqualTo("client@test.com");
    }

    @Test
    void createReviewRejectsBadRating() {
        ReviewRequest request = reviewRequest();
        request.setRating(0);

        assertThatThrownBy(() -> reviewService.createReview(
                request, "client@test.com", false))
                .isInstanceOf(BadRequestException.class);
    }

    @Test
    void createReviewRejectsEmptyComment() {
        ReviewRequest request = reviewRequest();
        request.setComment("   ");

        assertThatThrownBy(() -> reviewService.createReview(
                request, "client@test.com", false))
                .isInstanceOf(BadRequestException.class);
    }

    @Test
    void createReviewRejectsDuplicateContractReview() {
        when(reviewRepository.existsByContractId(2L))
                .thenReturn(true);

        assertThatThrownBy(() -> reviewService.createReview(
                reviewRequest(), "client@test.com", false))
                .isInstanceOf(ConflictException.class)
                .hasMessage(
                        "This contract has already been reviewed.");
    }
}
