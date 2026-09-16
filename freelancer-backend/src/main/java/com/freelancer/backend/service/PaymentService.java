package com.freelancer.backend.service;

import com.freelancer.backend.model.Payment;
import com.freelancer.backend.repository.PaymentRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class PaymentService {

    private final PaymentRepository paymentRepository;

    public PaymentService(PaymentRepository paymentRepository) {
        this.paymentRepository = paymentRepository;
    }

    public Payment createPayment(Payment payment) {

        if (payment.getStatus() == null ||
                payment.getStatus().isEmpty()) {

            payment.setStatus("PENDING");
        }

        return paymentRepository.save(payment);
    }

    public List<Payment> getAllPayments() {
        return paymentRepository.findAll();
    }

    public List<Payment> getPaymentsByClient(String clientEmail) {
        return paymentRepository.findByClientEmail(clientEmail);
    }

    public List<Payment> getPaymentsByFreelancer(String freelancerEmail) {
        return paymentRepository.findByFreelancerEmail(freelancerEmail);
    }

    public List<Payment> getPaymentsByContract(Long contractId) {
        return paymentRepository.findByContractId(contractId);
    }


    // Update payment status
    public Payment updatePaymentStatus(Long id, String status) {

        Payment payment =
                paymentRepository.findById(id)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Payment not found"
                                )
                        );

        payment.setStatus(status);

        return paymentRepository.save(payment);
    }
}