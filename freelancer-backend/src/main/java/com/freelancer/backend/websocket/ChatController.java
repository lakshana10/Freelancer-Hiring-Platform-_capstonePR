package com.freelancer.backend.websocket;

import com.freelancer.backend.dto.MessageDto.MessageRequest;
import com.freelancer.backend.dto.MessageDto.MessageResponse;
import com.freelancer.backend.security.SecurityUtils;
import com.freelancer.backend.service.MessageService;
import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.stereotype.Controller;

import java.security.Principal;

/**
 * Realtime project rooms. A client SENDs to /app/chat/{jobId};
 * everyone subscribed to /topic/jobs/{jobId} receives the saved
 * message within milliseconds. Participation is enforced by the
 * same rule as the REST history endpoint: owning client,
 * accepted/contracted freelancer, or admin.
 */
@Controller
public class ChatController {

    private final MessageService messageService;

    public ChatController(MessageService messageService) {
        this.messageService = messageService;
    }

    @MessageMapping("/chat/{jobId}")
    @SendTo("/topic/jobs/{jobId}")
    public MessageResponse chat(
            @DestinationVariable Long jobId,
            ChatInbound payload,
            Principal principal) {

        String email = principal != null
                ? principal.getName()
                : SecurityUtils.currentEmail();

        if (email == null) {
            throw new IllegalArgumentException(
                    "Authentication required.");
        }

        String text = payload == null || payload.getMessage() == null
                ? ""
                : payload.getMessage().trim();

        if (text.isEmpty()) {
            throw new IllegalArgumentException(
                    "Message cannot be empty.");
        }

        // Throws Forbidden when the sender is not on this project.
        messageService.requireJobParticipant(
                jobId, email, SecurityUtils.isAdmin());

        MessageRequest request = new MessageRequest();
        request.setReceiverEmail(resolveReceiver(jobId, email));
        request.setMessage(text);
        request.setJobId(jobId);

        return messageService.sendMessage(request, email);
    }

    /**
     * Project rooms are group threads, but the legacy Message row
     * still needs a receiver. Route to the other side of the hire:
     * freelancers write to the owning client, clients write to the
     * most recently hired freelancer on the job.
     */
    private String resolveReceiver(Long jobId, String senderEmail) {
        return messageService.resolveRoomPeer(jobId, senderEmail);
    }

    public static class ChatInbound {

        private String message;

        public ChatInbound() {
        }

        public String getMessage() {
            return message;
        }

        public void setMessage(String message) {
            this.message = message;
        }
    }
}
