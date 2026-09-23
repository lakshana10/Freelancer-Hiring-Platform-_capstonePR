package com.freelancer.backend.model;

import jakarta.persistence.*;

import java.time.LocalDateTime;

/**
 * A payable chunk of a contract. Lifecycle:
 * PENDING -> SUBMITTED -> APPROVED | REVISION_REQUESTED (-> SUBMITTED ...)
 * A payment may reference a milestone once the client approves it.
 */
@Entity
@Table(name = "milestones")
public class Milestone {

    public static final String PENDING = "PENDING";
    public static final String SUBMITTED = "SUBMITTED";
    public static final String APPROVED = "APPROVED";
    public static final String REVISION_REQUESTED = "REVISION_REQUESTED";

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Long contractId;

    private Long jobId;

    private String jobTitle;

    private String title;

    @Column(columnDefinition = "TEXT")
    private String description;

    private Double amount;

    private String status = PENDING;

    @Column(columnDefinition = "TEXT")
    private String submission;

    private LocalDateTime createdAt;

    public Milestone() {
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getContractId() {
        return contractId;
    }

    public void setContractId(Long contractId) {
        this.contractId = contractId;
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

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public Double getAmount() {
        return amount;
    }

    public void setAmount(Double amount) {
        this.amount = amount;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public String getSubmission() {
        return submission;
    }

    public void setSubmission(String submission) {
        this.submission = submission;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
}
