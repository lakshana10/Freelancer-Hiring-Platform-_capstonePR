package com.freelancer.backend.service;

import com.freelancer.backend.dto.JobDto.JobRequest;
import com.freelancer.backend.dto.JobDto.JobResponse;
import com.freelancer.backend.exception.ForbiddenException;
import com.freelancer.backend.exception.ResourceNotFoundException;
import com.freelancer.backend.model.Job;
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
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class JobServiceTest {

    @Mock
    private JobRepository jobRepository;

    private JobService jobService;

    @BeforeEach
    void setUp() {
        jobService = new JobService(jobRepository);
    }

    private JobRequest jobRequest() {
        JobRequest request = new JobRequest();
        request.setTitle("Build a website");
        request.setDescription("Need a portfolio site.");
        request.setBudget(500.0);
        request.setSkills("HTML, CSS");
        request.setClientEmail("spoofed@evil.com");
        return request;
    }

    private Job existingJob() {
        Job job = new Job();
        job.setId(1L);
        job.setTitle("Build a website");
        job.setDescription("Need a portfolio site.");
        job.setBudget(500.0);
        job.setSkills("HTML, CSS");
        job.setClientEmail("client@test.com");
        return job;
    }

    @Test
    void createJobUsesRequesterEmailNotClientSuppliedValue() {
        when(jobRepository.save(any(Job.class)))
                .thenAnswer(invocation ->
                        invocation.getArgument(0));

        JobResponse response = jobService.createJob(
                jobRequest(), "client@test.com");

        assertThat(response.getClientEmail())
                .isEqualTo("client@test.com");
    }

    @Test
    void getJobByIdThrowsWhenMissing() {
        when(jobRepository.findById(99L))
                .thenReturn(Optional.empty());

        assertThatThrownBy(() -> jobService.getJobById(99L))
                .isInstanceOf(ResourceNotFoundException.class)
                .hasMessage("Job not found.");
    }

    @Test
    void updateJobByOwnerSucceeds() {
        when(jobRepository.findById(1L))
                .thenReturn(Optional.of(existingJob()));
        when(jobRepository.save(any(Job.class)))
                .thenAnswer(invocation ->
                        invocation.getArgument(0));

        JobResponse response = jobService.updateJob(
                1L, jobRequest(), "CLIENT@test.com", false);

        assertThat(response.getTitle())
                .isEqualTo("Build a website");
        verify(jobRepository).save(any(Job.class));
    }

    @Test
    void updateJobByStrangerIsForbidden() {
        when(jobRepository.findById(1L))
                .thenReturn(Optional.of(existingJob()));

        assertThatThrownBy(() -> jobService.updateJob(
                1L, jobRequest(), "other@test.com", false))
                .isInstanceOf(ForbiddenException.class);
    }

    @Test
    void updateJobByAdminSucceeds() {
        when(jobRepository.findById(1L))
                .thenReturn(Optional.of(existingJob()));
        when(jobRepository.save(any(Job.class)))
                .thenAnswer(invocation ->
                        invocation.getArgument(0));

        JobResponse response = jobService.updateJob(
                1L, jobRequest(), "admin@test.com", true);

        assertThat(response.getId()).isEqualTo(1L);
    }

    @Test
    void deleteJobByStrangerIsForbidden() {
        when(jobRepository.findById(1L))
                .thenReturn(Optional.of(existingJob()));

        assertThatThrownBy(() -> jobService.deleteJob(
                1L, "other@test.com", false))
                .isInstanceOf(ForbiddenException.class);
    }

    @Test
    void deleteJobByOwnerSucceeds() {
        when(jobRepository.findById(1L))
                .thenReturn(Optional.of(existingJob()));

        jobService.deleteJob(1L, "client@test.com", false);

        verify(jobRepository).delete(any(Job.class));
    }
}
