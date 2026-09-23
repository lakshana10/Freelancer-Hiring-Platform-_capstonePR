package com.freelancer.backend.service;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.verify;

@ExtendWith(MockitoExtension.class)
class EmailServiceTest {

    @Mock
    private JavaMailSender mailSender;

    private EmailService service(String from) {
        return new EmailService(mailSender, from);
    }

    @Test
    void sendOTPEmailSetsFromToSubjectAndBody() {
        EmailService emailService =
                service("sender@gmail.com");

        emailService.sendOTPEmail("user@test.com", "123456");

        ArgumentCaptor<SimpleMailMessage> captor =
                ArgumentCaptor.forClass(SimpleMailMessage.class);
        verify(mailSender).send(captor.capture());

        SimpleMailMessage sent = captor.getValue();
        assertThat(sent.getFrom()).isEqualTo("sender@gmail.com");
        assertThat(sent.getTo()).containsExactly("user@test.com");
        assertThat(sent.getSubject()).contains("OTP");
        assertThat(sent.getText()).contains("123456");
    }

    @Test
    void sendOTPEmailTrimsRecipient() {
        EmailService emailService =
                service("sender@gmail.com");

        emailService.sendOTPEmail("  user@test.com  ", "654321");

        ArgumentCaptor<SimpleMailMessage> captor =
                ArgumentCaptor.forClass(SimpleMailMessage.class);
        verify(mailSender).send(captor.capture());

        assertThat(captor.getValue().getTo())
                .containsExactly("user@test.com");
    }

    @Test
    void sendOTPEmailRejectsBlankRecipient() {
        EmailService emailService =
                service("sender@gmail.com");

        assertThatThrownBy(() ->
                emailService.sendOTPEmail("  ", "123456"))
                .isInstanceOf(IllegalArgumentException.class);
    }

    @Test
    void sendOTPEmailFailsFastWhenSenderNotConfigured() {
        EmailService emailService = service("");

        assertThatThrownBy(() ->
                emailService.sendOTPEmail(
                        "user@test.com", "123456"))
                .isInstanceOf(IllegalStateException.class)
                .hasMessageContaining("not configured");
    }

    @Test
    void isConfiguredReflectsSenderPresence() {
        assertThat(service("sender@gmail.com").isConfigured())
                .isTrue();
        assertThat(service("").isConfigured()).isFalse();
        assertThat(service(null).isConfigured()).isFalse();
    }
}
