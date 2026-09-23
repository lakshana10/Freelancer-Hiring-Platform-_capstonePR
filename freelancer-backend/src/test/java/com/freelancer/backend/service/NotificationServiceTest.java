package com.freelancer.backend.service;

import com.freelancer.backend.dto.NotificationDto.NotificationRequest;
import com.freelancer.backend.dto.NotificationDto.NotificationResponse;
import com.freelancer.backend.model.Notification;
import com.freelancer.backend.repository.NotificationRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class NotificationServiceTest {

    @Mock
    private NotificationRepository notificationRepository;

    private NotificationService notificationService;

    @BeforeEach
    void setUp() {
        notificationService =
                new NotificationService(notificationRepository);
    }

    @Test
    void notifyTrimsAndSaves() {
        when(notificationRepository.save(any(Notification.class)))
                .thenAnswer(invocation ->
                        invocation.getArgument(0));

        NotificationResponse response = notificationService.notify(
                "  dev@test.com  ", "  Hired!  ");

        assertThat(response.getEmail()).isEqualTo("dev@test.com");
        assertThat(response.getMessage()).isEqualTo("Hired!");
        assertThat(response.isRead()).isFalse();

        ArgumentCaptor<Notification> captor =
                ArgumentCaptor.forClass(Notification.class);
        verify(notificationRepository).save(captor.capture());
        assertThat(captor.getValue().getCreatedAt()).isNotNull();
    }

    @Test
    void createNotificationDelegatesToNotify() {
        when(notificationRepository.save(any(Notification.class)))
                .thenAnswer(invocation ->
                        invocation.getArgument(0));

        NotificationRequest request = new NotificationRequest();
        request.setEmail("dev@test.com");
        request.setMessage("Hello");

        NotificationResponse response = notificationService
                .createNotification(request);

        assertThat(response.getEmail()).isEqualTo("dev@test.com");
        assertThat(response.getMessage()).isEqualTo("Hello");
    }
}
