package com.freelancer.backend.service;

import com.freelancer.backend.dto.MessageDto.MessageRequest;
import com.freelancer.backend.dto.MessageDto.MessageResponse;
import com.freelancer.backend.exception.BadRequestException;
import com.freelancer.backend.exception.ForbiddenException;
import com.freelancer.backend.exception.ResourceNotFoundException;
import com.freelancer.backend.model.Job;
import com.freelancer.backend.model.Message;
import com.freelancer.backend.model.User;
import com.freelancer.backend.repository.ApplicationRepository;
import com.freelancer.backend.repository.ContractRepository;
import com.freelancer.backend.repository.JobRepository;
import com.freelancer.backend.repository.MessageRepository;
import com.freelancer.backend.repository.UserRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class MessageService {

    private final MessageRepository messageRepository;
    private final UserRepository userRepository;
    private final JobRepository jobRepository;
    private final ApplicationRepository applicationRepository;
    private final ContractRepository contractRepository;
    private final NotificationService notificationService;

    public MessageService(
            MessageRepository messageRepository,
            UserRepository userRepository,
            JobRepository jobRepository,
            ApplicationRepository applicationRepository,
            ContractRepository contractRepository,
            NotificationService notificationService) {
        this.messageRepository = messageRepository;
        this.userRepository = userRepository;
        this.jobRepository = jobRepository;
        this.applicationRepository = applicationRepository;
        this.contractRepository = contractRepository;
        this.notificationService = notificationService;
    }

    // ===============================
    // SEND MESSAGE
    // ===============================

    public MessageResponse sendMessage(
            MessageRequest request, String requesterEmail) {

        String receiverEmail = request.getReceiverEmail().trim();

        User sender = userRepository
                .findByEmailIgnoreCase(requesterEmail)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Sender not found."));

        User receiver = userRepository
                .findByEmailIgnoreCase(receiverEmail)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Receiver not found."));

        // ===============================
        // ROLE VALIDATION
        // ===============================

        String senderRole = sender.getRole().toUpperCase();
        String receiverRole = receiver.getRole().toUpperCase();

        boolean validConversation =
                (senderRole.equals("CLIENT")
                 && receiverRole.equals("FREELANCER"))
                ||
                (senderRole.equals("FREELANCER")
                 && receiverRole.equals("CLIENT"));

        if (!validConversation) {
            throw new BadRequestException(
                    "Messaging is allowed only between "
                    + "clients and freelancers.");
        }

        // ===============================
        // CREATE MESSAGE
        // ===============================

        if (request.getMessage() == null
                || request.getMessage().trim().isEmpty()) {
            throw new BadRequestException(
                    "Message cannot be empty.");
        }

        Message message = new Message(
                sender.getEmail(),
                receiver.getEmail(),
                request.getMessage().trim(),
                request.getJobId());

        if (request.getJobId() != null) {
            requireJobParticipant(
                    request.getJobId(), requesterEmail, false);
        }

        MessageResponse saved = MessageResponse.from(
                messageRepository.save(message));

        // Project-room messages are already realtime; only classic
        // DMs raise a notification.
        if (request.getJobId() == null) {
            notificationService.notify(
                    saved.getReceiverEmail(),
                    "New message from " + saved.getSenderEmail()
                    + ".");
        }

        return saved;
    }

    // ===============================
    // PROJECT ROOM HISTORY
    // ===============================

    /**
     * Full chat history for one job page. Only the owning client,
     * an accepted/contracted freelancer on that job, or an admin
     * may read it.
     */
    public List<MessageResponse> getMessagesByJob(
            Long jobId, String requesterEmail, boolean admin) {

        requireJobParticipant(jobId, requesterEmail, admin);

        return messageRepository
                .findByJobIdOrderByCreatedAtAsc(jobId)
                .stream()
                .map(MessageResponse::from)
                .toList();
    }

    /**
     * Picks the legacy receiver for a project-room message.
     * Freelancer-side senders write to the owning client; the
     * client writes to the most recently hired freelancer.
     */
    public String resolveRoomPeer(Long jobId, String senderEmail) {
        Job job = jobRepository.findById(jobId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Job not found."));

        if (senderEmail != null
                && !senderEmail.equalsIgnoreCase(
                        job.getClientEmail())) {
            return job.getClientEmail();
        }

        List<String> hired = contractRepository
                .findByJobId(jobId)
                .stream()
                .map(c -> c.getFreelancerEmail())
                .toList();

        if (!hired.isEmpty()) {
            return hired.get(hired.size() - 1);
        }

        List<String> accepted = applicationRepository
                .findByJobId(jobId)
                .stream()
                .filter(app -> "ACCEPTED".equalsIgnoreCase(
                        app.getStatus()))
                .map(app -> app.getFreelancerEmail())
                .toList();

        if (!accepted.isEmpty()) {
            return accepted.get(accepted.size() - 1);
        }

        throw new BadRequestException(
                "No hired freelancer on this job yet.");
    }

    /**
     * Chat unlocks once hiring happens: the owning client, a
     * freelancer whose proposal was ACCEPTED (or who holds a
     * contract) on that job, or an admin.
     */
    public void requireJobParticipant(
            Long jobId, String email, boolean admin) {

        if (admin) {
            return;
        }

        Job job = jobRepository.findById(jobId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Job not found."));

        if (email != null
                && email.equalsIgnoreCase(job.getClientEmail())) {
            return;
        }

        boolean accepted = applicationRepository
                .findByJobId(jobId)
                .stream()
                .anyMatch(app ->
                        email != null
                        && email.equalsIgnoreCase(
                                app.getFreelancerEmail())
                        && "ACCEPTED".equalsIgnoreCase(
                                app.getStatus()));

        boolean contracted = email != null
                && contractRepository.findByJobId(jobId)
                        .stream()
                        .anyMatch(c -> email.equalsIgnoreCase(
                                c.getFreelancerEmail()));

        if (!accepted && !contracted) {
            throw new ForbiddenException(
                    "Chat is available only to the client and "
                    + "the hired freelancer of this job.");
        }
    }

    // ===============================
    // GET CONVERSATION
    // ===============================

    public List<MessageResponse> getConversation(
            String senderEmail, String receiverEmail) {
        return messageRepository
                .findConversation(senderEmail, receiverEmail)
                .stream()
                .map(MessageResponse::from)
                .toList();
    }

    // ===============================
    // GET ALL MESSAGES
    // ===============================

    public List<MessageResponse> getAllMessages() {
        return messageRepository.findAll()
                .stream()
                .map(MessageResponse::from)
                .toList();
    }

    // ===============================
    // MARK MESSAGE AS READ
    // ===============================

    public MessageResponse markAsRead(
            Long id, String requesterEmail, boolean admin) {

        Message message = messageRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Message not found."));

        if (!admin
                && (requesterEmail == null
                    || (!requesterEmail.equalsIgnoreCase(
                                message.getSenderEmail())
                        && !requesterEmail.equalsIgnoreCase(
                                message.getReceiverEmail())))) {
            throw new ForbiddenException(
                    "You can only read your own messages.");
        }

        message.setRead(true);

        return MessageResponse.from(
                messageRepository.save(message));
    }
}
