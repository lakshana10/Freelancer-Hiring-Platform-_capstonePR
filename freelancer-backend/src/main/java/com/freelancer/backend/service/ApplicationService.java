package com.freelancer.backend.service;

import com.freelancer.backend.dto.ApplicationDto.ApplicationRequest;
import com.freelancer.backend.dto.ApplicationDto.ApplicationResponse;
import com.freelancer.backend.exception.BadRequestException;
import com.freelancer.backend.exception.ConflictException;
import com.freelancer.backend.exception.ForbiddenException;
import com.freelancer.backend.exception.ResourceNotFoundException;
import com.freelancer.backend.model.Application;
import com.freelancer.backend.model.Job;
import com.freelancer.backend.repository.ApplicationRepository;
import com.freelancer.backend.repository.JobRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ApplicationService {

    private final ApplicationRepository applicationRepository;

    private final JobRepository jobRepository;

    private final NotificationService notificationService;

    public ApplicationService(
            ApplicationRepository applicationRepository,
            JobRepository jobRepository,
            NotificationService notificationService) {
        this.applicationRepository = applicationRepository;
        this.jobRepository = jobRepository;
        this.notificationService = notificationService;
    }

    public ApplicationResponse createApplication(
            ApplicationRequest request, String requesterEmail) {

        Job job = jobRepository.findById(request.getJobId())
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Job not found."));

        boolean alreadyApplied = applicationRepository
                .existsByFreelancerEmailAndJobId(
                        requesterEmail, request.getJobId());

        if (alreadyApplied) {
            throw new ConflictException(
                    "You have already applied for this job.");
        }

        Application application = new Application(
                requesterEmail,
                request.getJobId(),
                request.getJobTitle() != null
                        ? request.getJobTitle()
                        : job.getTitle());

        ApplicationResponse saved = ApplicationResponse.from(
                applicationRepository.save(application));

        if (job.getClientEmail() != null) {
            notificationService.notify(
                    job.getClientEmail(),
                    "New proposal from " + requesterEmail
                    + " for '" + saved.getJobTitle() + "'.");
        }

        return saved;
    }

    public List<ApplicationResponse> getAllApplications() {
        return applicationRepository.findAll()
                .stream()
                .map(ApplicationResponse::from)
                .toList();
    }

    public List<ApplicationResponse> getApplicationsByFreelancer(
            String email) {
        return applicationRepository
                .findByFreelancerEmail(email)
                .stream()
                .map(ApplicationResponse::from)
                .toList();
    }

    public ApplicationResponse updateStatus(
            Long id, String status,
            String requesterEmail, boolean admin) {

        if (status == null || status.isBlank()) {
            throw new BadRequestException("Status is required.");
        }

        Application application = applicationRepository
                .findById(id)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Application not found."));

        Job job = jobRepository.findById(application.getJobId())
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Job not found."));

        if (!admin
                && (requesterEmail == null
                    || job.getClientEmail() == null
                    || !job.getClientEmail()
                            .equalsIgnoreCase(requesterEmail))) {
            throw new ForbiddenException(
                    "Only the client who posted this job can "
                    + "update application status.");
        }

        application.setStatus(status);

        ApplicationResponse saved = ApplicationResponse.from(
                applicationRepository.save(application));

        notificationService.notify(
                application.getFreelancerEmail(),
                "Your proposal for '" + saved.getJobTitle()
                + "' was " + status.toUpperCase() + ".");

        return saved;
    }
}
