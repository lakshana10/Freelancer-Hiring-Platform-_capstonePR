package com.freelancer.backend.controller;

import com.freelancer.backend.model.Payment;
import com.freelancer.backend.service.PaymentService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/payments")
@CrossOrigin
public class PaymentController {

    private final PaymentService paymentService;

    public PaymentController(PaymentService paymentService) {
        this.paymentService = paymentService;
    }

    @PostMapping
    public Payment createPayment(@RequestBody Payment payment) {
        return paymentService.createPayment(payment);
    }

    @GetMapping
    public List<Payment> getAllPayments() {
        return paymentService.getAllPayments();
    }

    @GetMapping("/client/{email}")
    public List<Payment> getPaymentsByClient(
            @PathVariable String email) {

        return paymentService.getPaymentsByClient(email);
    }

    @GetMapping("/freelancer/{email}")
    public List<Payment> getPaymentsByFreelancer(
            @PathVariable String email) {

        return paymentService.getPaymentsByFreelancer(email);
    }

    @GetMapping("/contract/{contractId}")
    public List<Payment> getPaymentsByContract(
            @PathVariable Long contractId) {

        return paymentService.getPaymentsByContract(contractId);
    }


    // Update payment status
    @PutMapping("/{id}/status")
    public Payment updatePaymentStatus(
            @PathVariable Long id,
            @RequestParam String status) {

        return paymentService.updatePaymentStatus(
                id,
                status
        );
    }
}