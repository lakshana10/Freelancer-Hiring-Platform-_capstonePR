package com.freelancer.backend.repository;

import com.freelancer.backend.model.Application;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ApplicationRepository extends JpaRepository<Application, Long> {

    boolean existsByFreelancerEmailAndJobId(String freelancerEmail, Long jobId);

    List<Application> findByFreelancerEmail(String freelancerEmail);

}