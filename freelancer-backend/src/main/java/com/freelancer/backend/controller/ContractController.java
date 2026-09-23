package com.freelancer.backend.controller;

import com.freelancer.backend.dto.ContractDto.ContractRequest;
import com.freelancer.backend.dto.ContractDto.ContractResponse;
import com.freelancer.backend.security.SecurityUtils;
import com.freelancer.backend.service.ContractService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/contracts")
public class ContractController {

    private final ContractService contractService;

    public ContractController(ContractService contractService) {
        this.contractService = contractService;
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('CLIENT', 'ADMIN')")
    public ResponseEntity<ContractResponse> createContract(
            @Valid @RequestBody ContractRequest request) {

        ContractResponse created = contractService.createContract(
                request,
                SecurityUtils.currentEmail(),
                SecurityUtils.isAdmin());

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(created);
    }

    @GetMapping
    public ResponseEntity<List<ContractResponse>> getAllContracts() {
        return ResponseEntity.ok(
                contractService.getAllContracts());
    }

    @GetMapping("/client/{email}")
    @PreAuthorize(
        "#email == authentication.name or hasRole('ADMIN')")
    public ResponseEntity<List<ContractResponse>> getContractsByClient(
            @PathVariable String email) {
        return ResponseEntity.ok(
                contractService.getContractsByClient(email));
    }

    @GetMapping("/freelancer/{email}")
    @PreAuthorize(
        "#email == authentication.name or hasRole('ADMIN')")
    public ResponseEntity<List<ContractResponse>> getContractsByFreelancer(
            @PathVariable String email) {
        return ResponseEntity.ok(contractService
                .getContractsByFreelancer(email));
    }
}
