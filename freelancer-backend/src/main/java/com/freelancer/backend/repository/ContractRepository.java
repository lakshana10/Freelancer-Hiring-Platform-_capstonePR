package com.freelancer.backend.repository;

import com.freelancer.backend.model.Contract;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ContractRepository extends JpaRepository<Contract, Long> {

    List<Contract> findByClientEmail(String clientEmail);

    List<Contract> findByFreelancerEmail(String freelancerEmail);
}