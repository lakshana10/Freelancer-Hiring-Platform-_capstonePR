package com.freelancer.backend.service;

import com.freelancer.backend.dto.PaymentDto.PaymentRequest;
import com.freelancer.backend.dto.PaymentDto.PaymentResponse;
import com.freelancer.backend.exception.BadRequestException;
import com.freelancer.backend.exception.ForbiddenException;
import com.freelancer.backend.exception.ResourceNotFoundException;
import com.freelancer.backend.model.Contract;
import com.freelancer.backend.model.Payment;
import com.freelancer.backend.repository.ContractRepository;
import com.freelancer.backend.repository.PaymentRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class PaymentService {

    private final PaymentRepository paymentRepository;

    private final ContractRepository contractRepository;

    public PaymentService(
            PaymentRepository paymentRepository,
            ContractRepository contractRepository) {
        this.paymentRepository = paymentRepository;
        this.contractRepository = contractRepository;
    }

    public PaymentResponse createPayment(
            PaymentRequest request,
            String requesterEmail, boolean admin) {

        Contract contract = contractRepository
                .findById(request.getContractId())
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Contract not found."));

        if (!admin
                && (requesterEmail == null
                    || contract.getClientEmail() == null
                    || !contract.getClientEmail()
                            .equalsIgnoreCase(requesterEmail))) {
            throw new ForbiddenException(
                    "Only the contract client can create "
                    + "a payment for it.");
        }

        Payment payment = new Payment();
        payment.setContractId(request.getContractId());
        payment.setJobId(request.getJobId());
        payment.setJobTitle(request.getJobTitle());
        payment.setClientEmail(
                admin && request.getClientEmail() != null
                        ? request.getClientEmail()
                        : requesterEmail);
        payment.setFreelancerEmail(request.getFreelancerEmail());
        payment.setAmount(request.getAmount());
        payment.setStatus(request.getStatus() == null
                || request.getStatus().isEmpty()
                        ? "PENDING"
                        : request.getStatus());

        return PaymentResponse.from(
                paymentRepository.save(payment));
    }

    public List<PaymentResponse> getAllPayments() {
        return paymentRepository.findAll()
                .stream()
                .map(PaymentResponse::from)
                .toList();
    }

    public List<PaymentResponse> getPaymentsByClient(
            String clientEmail) {
        return paymentRepository
                .findByClientEmail(clientEmail)
                .stream()
                .map(PaymentResponse::from)
                .toList();
    }

    public List<PaymentResponse> getPaymentsByFreelancer(
            String freelancerEmail) {
        return paymentRepository
                .findByFreelancerEmail(freelancerEmail)
                .stream()
                .map(PaymentResponse::from)
                .toList();
    }

    public List<PaymentResponse> getPaymentsByContract(
            Long contractId) {
        return paymentRepository
                .findByContractId(contractId)
                .stream()
                .map(PaymentResponse::from)
                .toList();
    }

    public PaymentResponse updatePaymentStatus(
            Long id, String status,
            String requesterEmail, boolean admin) {

        if (status == null || status.isBlank()) {
            throw new BadRequestException("Status is required.");
        }

        Payment payment = paymentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Payment not found."));

        if (!admin
                && (requesterEmail == null
                    || payment.getClientEmail() == null
                    || !payment.getClientEmail()
                            .equalsIgnoreCase(requesterEmail))) {
            throw new ForbiddenException(
                    "Only the payment client can update "
                    + "payment status.");
        }

        payment.setStatus(status);

        return PaymentResponse.from(
                paymentRepository.save(payment));
    }
}
