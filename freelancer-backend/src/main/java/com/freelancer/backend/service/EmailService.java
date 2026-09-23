package com.freelancer.backend.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.MailSendException;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.charset.StandardCharsets;
import java.time.Duration;

@Service
public class EmailService {

    private static final Logger log =
            LoggerFactory.getLogger(EmailService.class);

    private static final String OTP_SUBJECT =
            "FreelanceHub - Email Verification OTP";

    private final JavaMailSender mailSender;

    private final String fromAddress;

    private final String brevoApiKey;

    private final String brevoUrl;

    private final HttpClient httpClient;

    @Autowired
    public EmailService(
            JavaMailSender mailSender,
            @Value("${app.mail.from:${spring.mail.username:}}")
            String fromAddress,
            @Value("${app.mail.brevo-api-key:}")
            String brevoApiKey,
            @Value("${app.mail.brevo-url:"
                    + "https://api.brevo.com/v3/smtp/email}")
            String brevoUrl) {
        this.mailSender = mailSender;
        this.fromAddress = fromAddress == null
                ? "" : fromAddress.trim();
        this.brevoApiKey = brevoApiKey == null
                ? "" : brevoApiKey.trim();
        this.brevoUrl = brevoUrl == null
                || brevoUrl.isBlank()
                ? "https://api.brevo.com/v3/smtp/email"
                : brevoUrl.trim();
        this.httpClient = HttpClient.newBuilder()
                .connectTimeout(Duration.ofSeconds(10))
                .build();
    }

    public EmailService(
            JavaMailSender mailSender,
            @Value("${app.mail.from:${spring.mail.username:}}")
            String fromAddress) {
        this(mailSender, fromAddress, "", null);
    }

    /**
     * Sends the 6-digit verification OTP.
     * The Gmail App Password must be supplied via the
     * MAIL_PASSWORD env var (never committed to git).
     * MAIL_USERNAME / app.mail.from must be the Gmail address
     * that created that App Password.
     */
    /**
     * Sends the 6-digit verification OTP.
     *
     * Two providers, selected by environment:
     * - BREVO_API_KEY set -> Brevo HTTPS API (port 443; works where
     *   outbound SMTP is blocked, e.g. Railway). MAIL_USERNAME must be
     *   the sender address verified in Brevo.
     * - otherwise -> Gmail SMTP via App Password (MAIL_USERNAME /
     *   MAIL_PASSWORD). MAIL_USERNAME must be the Gmail address that
     *   created that App Password.
     * Secrets travel via env vars only (never committed to git).
     */
    public void sendOTPEmail(String toEmail, String otp) {
        if (toEmail == null || toEmail.trim().isEmpty()) {
            throw new IllegalArgumentException(
                    "Recipient email is required.");
        }

        if (!isConfigured()) {
            log.error("Mail send aborted: MAIL_USERNAME/app.mail.from "
                    + "is not configured.");
            throw new IllegalStateException(
                    "Email service is not configured. "
                    + "Set MAIL_USERNAME and MAIL_PASSWORD.");
        }

        if (!brevoApiKey.isEmpty()) {
            sendViaBrevo(toEmail.trim(), otp);
            return;
        }

        SimpleMailMessage message =
                new SimpleMailMessage();

        message.setFrom(fromAddress);
        message.setTo(toEmail.trim());

        message.setSubject(OTP_SUBJECT);

        message.setText(otpBody(otp));

        mailSender.send(message);
        log.info("OTP email sent via SMTP to {}.", toEmail.trim());
    }

    private static String otpBody(String otp) {
        return "Hello,\n\n"
                + "Your FreelanceHub verification OTP is: "
                + otp
                + "\n\n"
                + "This OTP is valid for 5 minutes.\n\n"
                + "Please do not share this OTP with anyone.\n\n"
                + "Regards,\n"
                + "FreelanceHub Team";
    }

    /**
     * Sends via the Brevo transactional-email HTTPS API.
     * Throws MailSendException (a MailException) on any failure so
     * OTPController maps it to its existing 500 path untouched.
     */
    private void sendViaBrevo(String toEmail, String otp) {
        String payload = "{\"sender\":{\"name\":\"FreelanceHub\","
                + "\"email\":\"" + esc(fromAddress) + "\"},"
                + "\"to\":[{\"email\":\"" + esc(toEmail) + "\"}],"
                + "\"subject\":\"" + esc(OTP_SUBJECT) + "\","
                + "\"textContent\":\"" + esc(otpBody(otp)) + "\"}";

        HttpRequest request = HttpRequest.newBuilder(
                        URI.create(brevoUrl))
                .timeout(Duration.ofSeconds(15))
                .header("accept", "application/json")
                .header("content-type", "application/json")
                .header("api-key", brevoApiKey)
                .POST(HttpRequest.BodyPublishers.ofString(
                        payload, StandardCharsets.UTF_8))
                .build();

        HttpResponse<String> response;
        try {
            response = httpClient.send(
                    request, HttpResponse.BodyHandlers.ofString());
        } catch (IOException e) {
            log.error("Brevo send failed for {}: {}",
                    toEmail, e.getMessage());
            throw new MailSendException(
                    "Brevo send failed: " + e.getMessage(), e);
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
            throw new MailSendException(
                    "Brevo send interrupted.", e);
        }

        int status = response.statusCode();
        if (status < 200 || status >= 300) {
            log.error("Brevo rejected OTP for {}: {} {}",
                    toEmail, status, response.body());
            throw new MailSendException(
                    "Brevo rejected send: "
                            + status + " " + response.body());
        }

        log.info("OTP email sent via Brevo to {}.", toEmail);
    }

    private static String esc(String value) {
        return value
                .replace("\\", "\\\\")
                .replace("\"", "\\\"")
                .replace("\n", "\\n")
                .replace("\r", "\\r");
    }

    public boolean isConfigured() {
        return fromAddress != null && !fromAddress.isEmpty();
    }
}