package com.freelancer.backend.service;

import com.freelancer.backend.model.Message;
import com.freelancer.backend.model.User;
import com.freelancer.backend.repository.MessageRepository;
import com.freelancer.backend.repository.UserRepository;

import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class MessageService {

    private final MessageRepository messageRepository;
    private final UserRepository userRepository;

    public MessageService(
            MessageRepository messageRepository,
            UserRepository userRepository) {

        this.messageRepository = messageRepository;
        this.userRepository = userRepository;
    }

    // ===============================
    // SEND MESSAGE
    // ===============================

    public Message sendMessage(
            String senderEmail,
            String receiverEmail,
            String messageText) {

        User sender =
                userRepository
                        .findByEmail(senderEmail)
                        .orElseThrow(
                                () -> new RuntimeException(
                                        "Sender not found"
                                )
                        );

        User receiver =
                userRepository
                        .findByEmail(receiverEmail)
                        .orElseThrow(
                                () -> new RuntimeException(
                                        "Receiver not found"
                                )
                        );

        // ===============================
        // ROLE VALIDATION
        // ===============================

        String senderRole =
                sender.getRole().toString();

        String receiverRole =
                receiver.getRole().toString();

        boolean validConversation =
                (senderRole.equals("CLIENT") &&
                 receiverRole.equals("FREELANCER"))
                ||
                (senderRole.equals("FREELANCER") &&
                 receiverRole.equals("CLIENT"));

        if (!validConversation) {

            throw new RuntimeException(
                    "Messaging is allowed only between clients and freelancers"
            );
        }

        // ===============================
        // CREATE MESSAGE
        // ===============================

        Message message =
                new Message(
                        senderEmail,
                        receiverEmail,
                        messageText
                );

        return messageRepository.save(message);
    }

    // ===============================
    // GET CONVERSATION
    // ===============================

    public List<Message> getConversation(
            String senderEmail,
            String receiverEmail) {

        return messageRepository.findConversation(
                senderEmail,
                receiverEmail
        );
    }

    // ===============================
    // GET ALL MESSAGES
    // ===============================

    public List<Message> getAllMessages() {

        return messageRepository.findAll();
    }

    // ===============================
    // MARK MESSAGE AS READ
    // ===============================

    public Message markAsRead(Long id) {

        Message message =
                messageRepository
                        .findById(id)
                        .orElseThrow(
                                () -> new RuntimeException(
                                        "Message not found"
                                )
                        );

        message.setRead(true);

        return messageRepository.save(message);
    }
}