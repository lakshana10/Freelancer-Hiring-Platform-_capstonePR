package com.freelancer.backend.controller;

import com.freelancer.backend.dto.JobDto.JobRequest;
import com.freelancer.backend.dto.JobDto.JobResponse;
import com.freelancer.backend.security.SecurityUtils;
import com.freelancer.backend.service.JobService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/jobs")
public class JobController {

    private final JobService jobService;

    public JobController(JobService jobService) {
        this.jobService = jobService;
    }

    // Create a new job (clients and admins)
    @PostMapping
    @PreAuthorize("hasAnyRole('CLIENT', 'ADMIN')")
    public ResponseEntity<JobResponse> createJob(
            @Valid @RequestBody JobRequest request) {

        JobResponse created = jobService.createJob(
                request, SecurityUtils.currentEmail());

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(created);
    }

    // Get all jobs (public job board)
    @GetMapping
    public ResponseEntity<List<JobResponse>> getAllJobs() {
        return ResponseEntity.ok(jobService.getAllJobs());
    }

    // Get job by ID (public)
    @GetMapping("/{id}")
    public ResponseEntity<JobResponse> getJobById(
            @PathVariable Long id) {
        return ResponseEntity.ok(jobService.getJobById(id));
    }

    // Update job (owning client or admin)
    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('CLIENT', 'ADMIN')")
    public ResponseEntity<JobResponse> updateJob(
            @PathVariable Long id,
            @Valid @RequestBody JobRequest request) {

        return ResponseEntity.ok(jobService.updateJob(
                id, request,
                SecurityUtils.currentEmail(),
                SecurityUtils.isAdmin()));
    }

    // Delete job (owning client or admin)
    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('CLIENT', 'ADMIN')")
    public ResponseEntity<String> deleteJob(
            @PathVariable Long id) {

        jobService.deleteJob(
                id,
                SecurityUtils.currentEmail(),
                SecurityUtils.isAdmin());

        return ResponseEntity.ok("Job deleted successfully.");
    }
}
