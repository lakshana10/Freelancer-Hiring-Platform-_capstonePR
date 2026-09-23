package com.freelancer.backend.controller;

import com.freelancer.backend.dto.MilestoneDto.MilestoneRequest;
import com.freelancer.backend.dto.MilestoneDto.MilestoneResponse;
import com.freelancer.backend.dto.MilestoneDto.MilestoneSubmitRequest;
import com.freelancer.backend.security.SecurityUtils;
import com.freelancer.backend.service.MilestoneService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/milestones")
public class MilestoneController {

    private final MilestoneService milestoneService;

    public MilestoneController(MilestoneService milestoneService) {
        this.milestoneService = milestoneService;
    }

    // Split a contract into payable work (client, admin).
    @PostMapping
    @PreAuthorize("hasAnyRole('CLIENT', 'ADMIN')")
    public ResponseEntity<MilestoneResponse> createMilestone(
            @Valid @RequestBody MilestoneRequest request) {

        MilestoneResponse created = milestoneService.createMilestone(
                request,
                SecurityUtils.currentEmail(),
                SecurityUtils.isAdmin());

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(created);
    }

    // Milestones of one contract (participants read via service
    // ownership; admins see all).
    @GetMapping("/contract/{contractId}")
    public ResponseEntity<List<MilestoneResponse>> getByContract(
            @PathVariable Long contractId) {

        return ResponseEntity.ok(
                milestoneService.getByContract(contractId));
    }

    // Submit completed work (hired freelancer, admin).
    @PutMapping("/{id}/submit")
    @PreAuthorize("hasAnyRole('FREELANCER', 'ADMIN')")
    public ResponseEntity<MilestoneResponse> submitWork(
            @PathVariable Long id,
            @Valid @RequestBody MilestoneSubmitRequest request) {

        return ResponseEntity.ok(milestoneService.submitWork(
                id, request,
                SecurityUtils.currentEmail(),
                SecurityUtils.isAdmin()));
    }

    // Approve or request revision (client, admin).
    @PutMapping("/{id}/review")
    @PreAuthorize("hasAnyRole('CLIENT', 'ADMIN')")
    public ResponseEntity<MilestoneResponse> review(
            @PathVariable Long id,
            @RequestParam String status) {

        return ResponseEntity.ok(milestoneService.review(
                id, status,
                SecurityUtils.currentEmail(),
                SecurityUtils.isAdmin()));
    }
}
