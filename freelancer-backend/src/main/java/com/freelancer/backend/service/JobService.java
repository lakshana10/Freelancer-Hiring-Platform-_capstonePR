package com.freelancer.backend.service;

import com.freelancer.backend.dto.JobDto.JobRequest;
import com.freelancer.backend.dto.JobDto.JobResponse;
import com.freelancer.backend.exception.ForbiddenException;
import com.freelancer.backend.exception.ResourceNotFoundException;
import com.freelancer.backend.model.Job;
import com.freelancer.backend.repository.JobRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class JobService {

    private final JobRepository jobRepository;

    public JobService(JobRepository jobRepository) {
        this.jobRepository = jobRepository;
    }

    public JobResponse createJob(
            JobRequest request, String requesterEmail) {

        Job job = new Job();
        job.setTitle(request.getTitle().trim());
        job.setDescription(request.getDescription().trim());
        job.setBudget(request.getBudget());
        job.setSkills(request.getSkills());
        job.setClientEmail(requesterEmail);

        return JobResponse.from(jobRepository.save(job));
    }

    public List<JobResponse> getAllJobs() {
        return jobRepository.findAll()
                .stream()
                .map(JobResponse::from)
                .toList();
    }

    public JobResponse getJobById(Long id) {
        return JobResponse.from(loadJob(id));
    }

    public JobResponse updateJob(
            Long id, JobRequest request,
            String requesterEmail, boolean admin) {

        Job job = loadJob(id);
        requireOwnerOrAdmin(job, requesterEmail, admin, "update");

        job.setTitle(request.getTitle().trim());
        job.setDescription(request.getDescription().trim());
        job.setBudget(request.getBudget());
        job.setSkills(request.getSkills());

        return JobResponse.from(jobRepository.save(job));
    }

    public void deleteJob(
            Long id, String requesterEmail, boolean admin) {

        Job job = loadJob(id);
        requireOwnerOrAdmin(job, requesterEmail, admin, "delete");

        jobRepository.delete(job);
    }

    private Job loadJob(Long id) {
        return jobRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Job not found."));
    }

    private void requireOwnerOrAdmin(
            Job job, String requesterEmail,
            boolean admin, String action) {

        if (admin) {
            return;
        }

        if (requesterEmail == null
                || job.getClientEmail() == null
                || !job.getClientEmail()
                        .equalsIgnoreCase(requesterEmail)) {
            throw new ForbiddenException(
                    "You can only " + action + " your own jobs.");
        }
    }
}
