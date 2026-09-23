package com.freelancer.backend.repository;

import com.freelancer.backend.model.Milestone;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface MilestoneRepository extends JpaRepository<Milestone, Long> {

    List<Milestone> findByContractIdOrderByIdAsc(Long contractId);
}
