package com.freelancer.backend.repository;

import com.freelancer.backend.model.Payment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PaymentRepository extends JpaRepository<Payment, Long> {

    List<Payment> findByClientEmail(String clientEmail);

    List<Payment> findByFreelancerEmail(String freelancerEmail);

    List<Payment> findByContractId(Long contractId);
}