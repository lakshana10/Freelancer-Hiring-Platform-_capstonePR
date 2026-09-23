package com.freelancer.backend.service;

import com.freelancer.backend.dto.ApplicationDto.ApplicationRequest;
import com.freelancer.backend.dto.ApplicationDto.ApplicationResponse;
import com.freelancer.backend.exception.ConflictException;
import com.freelancer.backend.exception.ForbiddenException;
import com.freelancer.backend.exception.ResourceNotFoundException;
import com.freelancer.backend.model.Application;
import com.freelancer.backend.model.Job;
import com.freelancer.backend.repository.ApplicationRepository;
import com.freelancer.backend.repository.JobRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class ApplicationServiceTest {

    @Mock
    private ApplicationRepository applicationRepository;

    @Mock
    private JobRepository jobRepository;

    @Mock
    private NotificationService notificationService;

    private ApplicationService applicationService;

    @BeforeEach
    void setUp() {
        applicationService = new ApplicationService(
                applicationRepository, jobRepository,
                notificationService);
    }

    private Job job() {
        Job job = new Job();
        job.setId(7L);
        job.setTitle("Build a website");
        job.setClientEmail("client@test.com");
        return job;
    }

    private ApplicationRequest applyRequest() {
        ApplicationRequest request = new ApplicationRequest();
        request.setJobId(7L);
        request.setJobTitle("Build a website");
        return request;
    }

    @Test
    void createApplicationUsesRequesterEmail() {
        when(jobRepository.findById(7L))
                .thenReturn(Optional.of(job()));
        when(applicationRepository
                .existsByFreelancerEmailAndJobId(
                        "dev@test.com", 7L))
                .thenReturn(false);
        when(applicationRepository.save(any(Application.class)))
                .thenAnswer(invocation ->
                        invocation.getArgument(0));

        ApplicationResponse response = applicationService
                .createApplication(
                        applyRequest(), "dev@test.com");

        assertThat(response.getFreelancerEmail())
                .isEqualTo("dev@test.com");
        assertThat(response.getStatus()).isEqualTo("Pending");
    }

    @Test
    void createApplicationNotifiesJobOwner() {
        when(jobRepository.findById(7L))
                .thenReturn(Optional.of(job()));
        when(applicationRepository
                .existsByFreelancerEmailAndJobId(
                        "dev@test.com", 7L))
                .thenReturn(false);
        when(applicationRepository.save(any(Application.class)))
                .thenAnswer(invocation ->
                        invocation.getArgument(0));

        applicationService.createApplication(
                applyRequest(), "dev@test.com");

        verify(notificationService).notify(
                eq("client@test.com"), anyString());
    }

    @Test
    void statusUpdateNotifiesFreelancer() {
        Application application =
                new Application("dev@test.com", 7L, "Build a website");
        application.setStatus("Pending");

        when(applicationRepository.findById(3L))
                .thenReturn(Optional.of(application));
        when(jobRepository.findById(7L))
                .thenReturn(Optional.of(job()));
        when(applicationRepository.save(any(Application.class)))
                .thenAnswer(invocation ->
                        invocation.getArgument(0));

        applicationService.updateStatus(
                3L, "ACCEPTED", "client@test.com", false);

        verify(notificationService).notify(
                eq("dev@test.com"), anyString());
    }

    @Test
    void createApplicationRejectsDuplicate() {
        when(jobRepository.findById(7L))
                .thenReturn(Optional.of(job()));
        when(applicationRepository
                .existsByFreelancerEmailAndJobId(
                        "dev@test.com", 7L))
                .thenReturn(true);

        assertThatThrownBy(() -> applicationService
                .createApplication(
                        applyRequest(), "dev@test.com"))
                .isInstanceOf(ConflictException.class)
                .hasMessage(
                        "You have already applied for this job.");
    }

    @Test
    void createApplicationRejectsMissingJob() {
        when(jobRepository.findById(7L))
                .thenReturn(Optional.empty());

        assertThatThrownBy(() -> applicationService
                .createApplication(
                        applyRequest(), "dev@test.com"))
                .isInstanceOf(ResourceNotFoundException.class);
    }

    @Test
    void updateStatusByJobOwnerSucceeds() {
        Application application =
                new Application("dev@test.com", 7L, "Build a website");
        application.setStatus("Pending");

        when(applicationRepository.findById(3L))
                .thenReturn(Optional.of(application));
        when(jobRepository.findById(7L))
                .thenReturn(Optional.of(job()));
        when(applicationRepository.save(any(Application.class)))
                .thenAnswer(invocation ->
                        invocation.getArgument(0));

        ApplicationResponse response = applicationService
                .updateStatus(
                        3L, "Accepted", "client@test.com", false);

        assertThat(response.getStatus()).isEqualTo("Accepted");
    }

    @Test
    void updateStatusByOtherClientIsForbidden() {
        Application application =
                new Application("dev@test.com", 7L, "Build a website");

        when(applicationRepository.findById(3L))
                .thenReturn(Optional.of(application));
        when(jobRepository.findById(7L))
                .thenReturn(Optional.of(job()));

        assertThatThrownBy(() -> applicationService
                .updateStatus(
                        3L, "Accepted", "other@test.com", false))
                .isInstanceOf(ForbiddenException.class);
    }
}
