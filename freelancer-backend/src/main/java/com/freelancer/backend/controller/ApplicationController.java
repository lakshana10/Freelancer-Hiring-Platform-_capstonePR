package com.freelancer.backend.controller;

import com.freelancer.backend.model.Application;
import com.freelancer.backend.service.ApplicationService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/applications")
@CrossOrigin
public class ApplicationController {

    private final ApplicationService applicationService;

    public ApplicationController(ApplicationService applicationService) {
        this.applicationService = applicationService;
    }

    @PostMapping("/apply")
    public ResponseEntity<?> applyJob(@RequestBody Application application) {

        try {

            Application savedApplication =
                    applicationService.createApplication(application);

            return ResponseEntity.ok(savedApplication);

        } catch (RuntimeException e) {

            return ResponseEntity
                    .status(HttpStatus.CONFLICT)
                    .body(e.getMessage());

        }
    }

    @GetMapping
    public List<Application> getAllApplications() {
        return applicationService.getAllApplications();
    }

    @GetMapping("/freelancer/{email}")
    public List<Application> getFreelancerApplications(
            @PathVariable String email) {

        return applicationService.getApplicationsByFreelancer(email);
    }

    @PutMapping("/{id}/status")
    public Application updateStatus(
            @PathVariable Long id,
            @RequestParam String status) {

        return applicationService.updateStatus(id, status);
    }
}