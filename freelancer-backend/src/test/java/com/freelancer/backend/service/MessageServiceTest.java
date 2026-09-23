package com.freelancer.backend.service;

import com.freelancer.backend.dto.MessageDto.MessageRequest;
import com.freelancer.backend.dto.MessageDto.MessageResponse;
import com.freelancer.backend.exception.BadRequestException;
import com.freelancer.backend.exception.ForbiddenException;
import com.freelancer.backend.exception.ResourceNotFoundException;
import com.freelancer.backend.model.Application;
import com.freelancer.backend.model.Contract;
import com.freelancer.backend.model.Job;
import com.freelancer.backend.model.Message;
import com.freelancer.backend.model.User;
import com.freelancer.backend.repository.ApplicationRepository;
import com.freelancer.backend.repository.ContractRepository;
import com.freelancer.backend.repository.JobRepository;
import com.freelancer.backend.repository.MessageRepository;
import com.freelancer.backend.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class MessageServiceTest {

    @Mock
    private MessageRepository messageRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private JobRepository jobRepository;

    @Mock
    private ApplicationRepository applicationRepository;

    @Mock
    private ContractRepository contractRepository;

    @Mock
    private NotificationService notificationService;

    private MessageService messageService;

    @BeforeEach
    void setUp() {
        messageService = new MessageService(
                messageRepository, userRepository,
                jobRepository, applicationRepository,
                contractRepository, notificationService);
    }

    private User user(String email, String role) {
        User user = new User();
        user.setEmail(email);
        user.setRole(role);
        return user;
    }

    private MessageRequest messageRequest(String receiver) {
        MessageRequest request = new MessageRequest();
        request.setReceiverEmail(receiver);
        request.setMessage("Hello!");
        return request;
    }

    @Test
    void sendMessageBetweenClientAndFreelancerSucceeds() {
        when(userRepository
                .findByEmailIgnoreCase("client@test.com"))
                .thenReturn(Optional.of(
                        user("client@test.com", "CLIENT")));
        when(userRepository
                .findByEmailIgnoreCase("dev@test.com"))
                .thenReturn(Optional.of(
                        user("dev@test.com", "FREELANCER")));
        when(messageRepository.save(any(Message.class)))
                .thenAnswer(invocation ->
                        invocation.getArgument(0));

        MessageResponse response = messageService.sendMessage(
                messageRequest("dev@test.com"),
                "client@test.com");

        assertThat(response.getSenderEmail())
                .isEqualTo("client@test.com");
        assertThat(response.isRead()).isFalse();
    }

    @Test
    void sendMessageBetweenFreelancersIsRejected() {
        when(userRepository
                .findByEmailIgnoreCase("dev@test.com"))
                .thenReturn(Optional.of(
                        user("dev@test.com", "FREELANCER")));
        when(userRepository
                .findByEmailIgnoreCase("other@test.com"))
                .thenReturn(Optional.of(
                        user("other@test.com", "FREELANCER")));

        assertThatThrownBy(() -> messageService.sendMessage(
                messageRequest("other@test.com"),
                "dev@test.com"))
                .isInstanceOf(BadRequestException.class);
    }

    @Test
    void sendMessageToUnknownReceiverThrows() {
        when(userRepository
                .findByEmailIgnoreCase("client@test.com"))
                .thenReturn(Optional.of(
                        user("client@test.com", "CLIENT")));
        when(userRepository
                .findByEmailIgnoreCase("ghost@test.com"))
                .thenReturn(Optional.empty());

        assertThatThrownBy(() -> messageService.sendMessage(
                messageRequest("ghost@test.com"),
                "client@test.com"))
                .isInstanceOf(ResourceNotFoundException.class)
                .hasMessage("Receiver not found.");
    }

    @Test
    void markAsReadByStrangerIsForbidden() {
        Message message = new Message(
                "client@test.com", "dev@test.com", "Hello!");

        when(messageRepository.findById(1L))
                .thenReturn(Optional.of(message));

        assertThatThrownBy(() -> messageService.markAsRead(
                1L, "stranger@test.com", false))
                .isInstanceOf(ForbiddenException.class);
    }

    @Test
    void markAsReadByParticipantSucceeds() {
        Message message = new Message(
                "client@test.com", "dev@test.com", "Hello!");

        when(messageRepository.findById(1L))
                .thenReturn(Optional.of(message));
        when(messageRepository.save(any(Message.class)))
                .thenAnswer(invocation ->
                        invocation.getArgument(0));

        MessageResponse response = messageService.markAsRead(
                1L, "dev@test.com", false);

        assertThat(response.isRead()).isTrue();
    }

    private Job jobOwnedBy(String clientEmail) {
        Job job = new Job();
        job.setId(1L);
        job.setTitle("Build a site");
        job.setClientEmail(clientEmail);
        return job;
    }

    private Application acceptedApplication() {
        Application app = new Application(
                "dev@test.com", 1L, "Build a site");
        app.setStatus("ACCEPTED");
        return app;
    }

    @Test
    void jobHistoryForOwnerClientSucceeds() {
        when(jobRepository.findById(1L)).thenReturn(
                Optional.of(jobOwnedBy("client@test.com")));
        Message stored = new Message(
                "client@test.com", "dev@test.com", "Hi", 1L);
        when(messageRepository.findByJobIdOrderByCreatedAtAsc(1L))
                .thenReturn(List.of(stored));

        List<MessageResponse> history = messageService
                .getMessagesByJob(1L, "client@test.com", false);

        assertThat(history).hasSize(1);
        assertThat(history.get(0).getJobId()).isEqualTo(1L);
    }

    @Test
    void jobHistoryForHiredFreelancerSucceeds() {
        when(jobRepository.findById(1L)).thenReturn(
                Optional.of(jobOwnedBy("client@test.com")));
        when(applicationRepository.findByJobId(1L))
                .thenReturn(List.of(acceptedApplication()));
        when(contractRepository.findByJobId(1L))
                .thenReturn(List.of());
        when(messageRepository.findByJobIdOrderByCreatedAtAsc(1L))
                .thenReturn(List.of());

        List<MessageResponse> history = messageService
                .getMessagesByJob(1L, "dev@test.com", false);

        assertThat(history).isEmpty();
    }

    @Test
    void jobHistoryForOutsiderIsForbidden() {
        when(jobRepository.findById(1L)).thenReturn(
                Optional.of(jobOwnedBy("client@test.com")));
        when(applicationRepository.findByJobId(1L))
                .thenReturn(List.of());
        when(contractRepository.findByJobId(1L))
                .thenReturn(List.of());

        assertThatThrownBy(() -> messageService.getMessagesByJob(
                1L, "stranger@test.com", false))
                .isInstanceOf(ForbiddenException.class);
    }

    @Test
    void jobHistoryForAdminBypassesParticipation() {
        Message stored = new Message(
                "client@test.com", "dev@test.com", "Hi", 1L);
        when(messageRepository.findByJobIdOrderByCreatedAtAsc(1L))
                .thenReturn(List.of(stored));

        List<MessageResponse> history = messageService
                .getMessagesByJob(1L, "admin@test.com", true);

        assertThat(history).hasSize(1);
    }

    @Test
    void resolveRoomPeerRoutesToOtherSide() {
        when(jobRepository.findById(1L)).thenReturn(
                Optional.of(jobOwnedBy("client@test.com")));

        assertThat(messageService.resolveRoomPeer(
                1L, "dev@test.com")).isEqualTo("client@test.com");
    }
}
