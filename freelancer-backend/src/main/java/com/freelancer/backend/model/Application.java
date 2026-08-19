package com.freelancer.backend.model;

import jakarta.persistence.*;

@Entity
@Table(name = "applications")
public class Application {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String freelancerEmail;

    private Long jobId;

    private String jobTitle;

    public Application() {
    }

    public Application(String freelancerEmail, Long jobId, String jobTitle) {
        this.freelancerEmail = freelancerEmail;
        this.jobId = jobId;
        this.jobTitle = jobTitle;
    }

    public Long getId() {
        return id;
    }

    public String getFreelancerEmail() {
        return freelancerEmail;
    }

    public void setFreelancerEmail(String freelancerEmail) {
        this.freelancerEmail = freelancerEmail;
    }

    public Long getJobId() {
        return jobId;
    }

    public void setJobId(Long jobId) {
        this.jobId = jobId;
    }

    public String getJobTitle() {
        return jobTitle;
    }

    public void setJobTitle(String jobTitle) {
        this.jobTitle = jobTitle;
    }
}