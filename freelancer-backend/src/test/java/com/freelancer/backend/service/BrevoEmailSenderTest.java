package com.freelancer.backend.service;

import com.sun.net.httpserver.HttpServer;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.mail.MailSendException;
import org.springframework.mail.javamail.JavaMailSender;

import java.io.IOException;
import java.io.OutputStream;
import java.net.InetSocketAddress;
import java.nio.charset.StandardCharsets;
import java.util.concurrent.atomic.AtomicInteger;
import java.util.concurrent.atomic.AtomicReference;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.verifyNoInteractions;

/**
 * Brevo HTTPS path of EmailService, tested against a local stub
 * HTTP server (no real sends, no network). The SMTP fallback path
 * is covered by EmailServiceTest.
 */
@ExtendWith(MockitoExtension.class)
class BrevoEmailSenderTest {

    @Mock
    private JavaMailSender mailSender;

    private HttpServer stub;
    private String stubUrl;

    private final AtomicInteger statusToReturn =
            new AtomicInteger(201);
    private final AtomicReference<String> lastApiKey =
            new AtomicReference<>();
    private final AtomicReference<String> lastBody =
            new AtomicReference<>();

    @BeforeEach
    void startStub() throws IOException {
        stub = HttpServer.create(
                new InetSocketAddress("127.0.0.1", 0), 0);
        stub.createContext("/", exchange -> {
            lastApiKey.set(exchange.getRequestHeaders()
                    .getFirst("api-key"));
            byte[] raw = exchange.getRequestBody()
                    .readAllBytes();
            lastBody.set(new String(
                    raw, StandardCharsets.UTF_8));
            byte[] out = "{\"messageId\":\"stub-id\"}"
                    .getBytes(StandardCharsets.UTF_8);
            exchange.getResponseHeaders().add(
                    "content-type", "application/json");
            exchange.sendResponseHeaders(
                    statusToReturn.get(), out.length);
            try (OutputStream body = exchange.getResponseBody()) {
                body.write(out);
            }
        });
        stub.start();
        stubUrl = "http://127.0.0.1:"
                + stub.getAddress().getPort() + "/";
    }

    @AfterEach
    void stopStub() {
        stub.stop(0);
    }

    private EmailService brevoService() {
        return new EmailService(
                mailSender, "sender@gmail.com",
                "test-brevo-key", stubUrl);
    }

    @Test
    void sendOTPEmailUsesBrevoApiNotSmtp() {
        brevoService().sendOTPEmail("user@test.com", "123456");

        verifyNoInteractions(mailSender);
        assertThat(lastApiKey.get())
                .isEqualTo("test-brevo-key");
        assertThat(lastBody.get())
                .contains("\"email\":\"user@test.com\"")
                .contains("123456")
                .contains("sender@gmail.com");
    }

    @Test
    void sendOTPEmailTrimsRecipientForBrevo() {
        brevoService().sendOTPEmail("  user@test.com  ", "654321");

        verifyNoInteractions(mailSender);
        assertThat(lastBody.get())
                .contains("\"email\":\"user@test.com\"");
    }

    @Test
    void brevoRejectionSurfacesAsMailSendException() {
        statusToReturn.set(400);

        assertThatThrownBy(() ->
                brevoService().sendOTPEmail(
                        "user@test.com", "123456"))
                .isInstanceOf(MailSendException.class)
                .hasMessageContaining("400");

        verifyNoInteractions(mailSender);
    }
}
