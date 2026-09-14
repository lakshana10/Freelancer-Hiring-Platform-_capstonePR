package com.freelancer.backend.service;

import com.freelancer.backend.model.Application;
import com.freelancer.backend.repository.ApplicationRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ApplicationService {

    private final ApplicationRepository applicationRepository;

    public ApplicationService(ApplicationRepository applicationRepository) {
        this.applicationRepository = applicationRepository;
    }

    public Application createApplication(Application application) {

        boolean alreadyApplied =
                applicationRepository.existsByFreelancerEmailAndJobId(
                        application.getFreelancerEmail(),
                        application.getJobId()
                );

        if (alreadyApplied) {
            throw new RuntimeException("You have already applied for this job.");
        }

        return applicationRepository.save(application);
    }

    public List<Application> getAllApplications() {
        return applicationRepository.findAll();
    }

    public List<Application> getApplicationsByFreelancer(String email) {
        return applicationRepository.findByFreelancerEmail(email);
    }

    public Application updateStatus(Long id, String status) {

        Application application =
                applicationRepository.findById(id)
                        .orElseThrow(() ->
                                new RuntimeException("Application not found"));

        application.setStatus(status);

        return applicationRepository.save(application);
    }
}