package com.freelancer.backend.controller;

import com.freelancer.backend.dto.PaymentDto.PaymentRequest;
import com.freelancer.backend.dto.PaymentDto.PaymentResponse;
import com.freelancer.backend.security.SecurityUtils;
import com.freelancer.backend.service.PaymentService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/payments")
public class PaymentController {

    private final PaymentService paymentService;

    public PaymentController(PaymentService paymentService) {
        this.paymentService = paymentService;
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('CLIENT', 'ADMIN')")
    public ResponseEntity<PaymentResponse> createPayment(
            @Valid @RequestBody PaymentRequest request) {

        PaymentResponse created = paymentService.createPayment(
                request,
                SecurityUtils.currentEmail(),
                SecurityUtils.isAdmin());

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(created);
    }

    @GetMapping
    public ResponseEntity<List<PaymentResponse>> getAllPayments() {
        return ResponseEntity.ok(
                paymentService.getAllPayments());
    }

    @GetMapping("/client/{email}")
    @PreAuthorize(
        "#email == authentication.name or hasRole('ADMIN')")
    public ResponseEntity<List<PaymentResponse>> getPaymentsByClient(
            @PathVariable String email) {

        return ResponseEntity.ok(
                paymentService.getPaymentsByClient(email));
    }

    @GetMapping("/freelancer/{email}")
    @PreAuthorize(
        "#email == authentication.name or hasRole('ADMIN')")
    public ResponseEntity<List<PaymentResponse>> getPaymentsByFreelancer(
            @PathVariable String email) {

        return ResponseEntity.ok(paymentService
                .getPaymentsByFreelancer(email));
    }

    @GetMapping("/contract/{contractId}")
    public ResponseEntity<List<PaymentResponse>> getPaymentsByContract(
            @PathVariable Long contractId) {

        return ResponseEntity.ok(paymentService
                .getPaymentsByContract(contractId));
    }

    // Update payment status (paying client or admin)
    @PutMapping("/{id}/status")
    @PreAuthorize("hasAnyRole('CLIENT', 'ADMIN')")
    public ResponseEntity<PaymentResponse> updatePaymentStatus(
            @PathVariable Long id,
            @RequestParam String status) {

        return ResponseEntity.ok(paymentService.updatePaymentStatus(
                id, status,
                SecurityUtils.currentEmail(),
                SecurityUtils.isAdmin()));
    }
}
