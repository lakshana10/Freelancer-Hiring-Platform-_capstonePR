package com.freelancer.backend.repository;

import com.freelancer.backend.model.Notification;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface NotificationRepository
        extends JpaRepository<Notification, Long> {

    List<Notification> findByEmailOrderByCreatedAtDesc(
            String email
    );
}