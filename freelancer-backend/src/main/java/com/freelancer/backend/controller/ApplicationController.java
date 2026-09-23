package com.freelancer.backend.controller;

import com.freelancer.backend.dto.ApplicationDto.ApplicationRequest;
import com.freelancer.backend.dto.ApplicationDto.ApplicationResponse;
import com.freelancer.backend.security.SecurityUtils;
import com.freelancer.backend.service.ApplicationService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/applications")
public class ApplicationController {

    private final ApplicationService applicationService;

    public ApplicationController(
            ApplicationService applicationService) {
        this.applicationService = applicationService;
    }

    @PostMapping("/apply")
    @PreAuthorize("hasAnyRole('FREELANCER', 'ADMIN')")
    public ResponseEntity<ApplicationResponse> applyJob(
            @Valid @RequestBody ApplicationRequest request) {

        ApplicationResponse saved = applicationService
                .createApplication(
                        request,
                        SecurityUtils.currentEmail());

        return ResponseEntity.ok(saved);
    }

    @GetMapping
    public ResponseEntity<List<ApplicationResponse>> getAllApplications() {
        return ResponseEntity.ok(
                applicationService.getAllApplications());
    }

    @GetMapping("/freelancer/{email}")
    @PreAuthorize(
        "#email == authentication.name or hasRole('ADMIN')")
    public ResponseEntity<List<ApplicationResponse>> getFreelancerApplications(
            @PathVariable String email) {

        return ResponseEntity.ok(applicationService
                .getApplicationsByFreelancer(email));
    }

    @PutMapping("/{id}/status")
    @PreAuthorize("hasAnyRole('CLIENT', 'ADMIN')")
    public ResponseEntity<ApplicationResponse> updateStatus(
            @PathVariable Long id,
            @RequestParam String status) {

        return ResponseEntity.ok(applicationService.updateStatus(
                id, status,
                SecurityUtils.currentEmail(),
                SecurityUtils.isAdmin()));
    }
}
