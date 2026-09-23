package com.freelancer.backend.controller;

import com.freelancer.backend.dto.MessageDto.MessageRequest;
import com.freelancer.backend.dto.MessageDto.MessageResponse;
import com.freelancer.backend.security.SecurityUtils;
import com.freelancer.backend.service.MessageService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/messages")
public class MessageController {

    private final MessageService messageService;

    public MessageController(MessageService messageService) {
        this.messageService = messageService;
    }

    // ===============================
    // SEND MESSAGE
    // ===============================

    @PostMapping
    public ResponseEntity<MessageResponse> sendMessage(
            @Valid @RequestBody MessageRequest request) {

        MessageResponse message = messageService.sendMessage(
                request, SecurityUtils.currentEmail());

        return ResponseEntity.ok(message);
    }

    // ===============================
    // GET CONVERSATION (participants or admin)
    // ===============================

    @GetMapping("/conversation")
    @PreAuthorize(
        "#senderEmail == authentication.name "
        + "or #receiverEmail == authentication.name "
        + "or hasRole('ADMIN')")
    public ResponseEntity<List<MessageResponse>> getConversation(
            @RequestParam String senderEmail,
            @RequestParam String receiverEmail) {

        return ResponseEntity.ok(messageService.getConversation(
                senderEmail, receiverEmail));
    }

    // ===============================
    // GET ALL MESSAGES (admin)
    // ===============================

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<MessageResponse>> getAllMessages() {
        return ResponseEntity.ok(
                messageService.getAllMessages());
    }

    // ===============================
    // PROJECT ROOM HISTORY (participants or admin)
    // ===============================

    @GetMapping("/job/{jobId}")
    public ResponseEntity<List<MessageResponse>> getMessagesByJob(
            @PathVariable Long jobId) {

        return ResponseEntity.ok(messageService.getMessagesByJob(
                jobId,
                SecurityUtils.currentEmail(),
                SecurityUtils.isAdmin()));
    }

    // ===============================
    // MARK MESSAGE AS READ (participant or admin)
    // ===============================

    @PutMapping("/{id}/read")
    public ResponseEntity<MessageResponse> markAsRead(
            @PathVariable Long id) {

        return ResponseEntity.ok(messageService.markAsRead(
                id,
                SecurityUtils.currentEmail(),
                SecurityUtils.isAdmin()));
    }
}
