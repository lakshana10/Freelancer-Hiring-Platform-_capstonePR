package com.freelancer.backend.controller;

import com.freelancer.backend.model.Message;
import com.freelancer.backend.service.MessageService;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/messages")
@CrossOrigin(origins = "*")
public class MessageController {

    private final MessageService messageService;

    public MessageController(
            MessageService messageService) {

        this.messageService = messageService;
    }


    // ===============================
    // SEND MESSAGE
    // ===============================

    @PostMapping
    public ResponseEntity<Message> sendMessage(
            @RequestBody MessageRequest request) {

        Message message =
                messageService.sendMessage(
                        request.getSenderEmail(),
                        request.getReceiverEmail(),
                        request.getMessage()
                );

        return ResponseEntity.ok(message);
    }


    // ===============================
    // GET CONVERSATION
    // ===============================

    @GetMapping("/conversation")
    public ResponseEntity<List<Message>> getConversation(
            @RequestParam String senderEmail,
            @RequestParam String receiverEmail) {

        List<Message> messages =
                messageService.getConversation(
                        senderEmail,
                        receiverEmail
                );

        return ResponseEntity.ok(messages);
    }


    // ===============================
    // GET ALL MESSAGES
    // ===============================

    @GetMapping
    public ResponseEntity<List<Message>> getAllMessages() {

        return ResponseEntity.ok(
                messageService.getAllMessages()
        );
    }


    // ===============================
    // MARK MESSAGE AS READ
    // ===============================

    @PutMapping("/{id}/read")
    public ResponseEntity<Message> markAsRead(
            @PathVariable Long id) {

        return ResponseEntity.ok(
                messageService.markAsRead(id)
        );
    }


    // ===============================
    // REQUEST CLASS
    // ===============================

    public static class MessageRequest {

        private String senderEmail;

        private String receiverEmail;

        private String message;


        public MessageRequest() {
        }


        public String getSenderEmail() {
            return senderEmail;
        }

        public void setSenderEmail(
                String senderEmail) {

            this.senderEmail = senderEmail;
        }


        public String getReceiverEmail() {
            return receiverEmail;
        }

        public void setReceiverEmail(
                String receiverEmail) {

            this.receiverEmail = receiverEmail;
        }


        public String getMessage() {
            return message;
        }

        public void setMessage(
                String message) {

            this.message = message;
        }
    }
}