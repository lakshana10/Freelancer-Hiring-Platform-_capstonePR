package com.freelancer.backend.repository;

import com.freelancer.backend.model.Message;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface MessageRepository
        extends JpaRepository<Message, Long> {

    @Query("""
        SELECT m
        FROM Message m
        WHERE
            (m.senderEmail = :senderEmail
             AND m.receiverEmail = :receiverEmail)
            OR
            (m.senderEmail = :receiverEmail
             AND m.receiverEmail = :senderEmail)
        ORDER BY m.createdAt ASC
    """)
    List<Message> findConversation(
            @Param("senderEmail") String senderEmail,
            @Param("receiverEmail") String receiverEmail
    );

    List<Message> findByJobIdOrderByCreatedAtAsc(Long jobId);
}