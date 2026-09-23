package com.freelancer.backend.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
public class EmailService {

    private static final Logger log =
            LoggerFactory.getLogger(EmailService.class);

    private final JavaMailSender mailSender;

    private final String fromAddress;

    public EmailService(
            JavaMailSender mailSender,
            @Value("${app.mail.from:${spring.mail.username:}}")
            String fromAddress) {
        this.mailSender = mailSender;
        this.fromAddress = fromAddress == null
                ? "" : fromAddress.trim();
    }

    /**
     * Sends the 6-digit verification OTP.
     * The Gmail App Password must be supplied via the
     * MAIL_PASSWORD env var (never committed to git).
     * MAIL_USERNAME / app.mail.from must be the Gmail address
     * that created that App Password.
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

        SimpleMailMessage message =
                new SimpleMailMessage();

        message.setFrom(fromAddress);
        message.setTo(toEmail.trim());

        message.setSubject(
                "FreelanceHub - Email Verification OTP"
        );

        message.setText(
                "Hello,\n\n"
                + "Your FreelanceHub verification OTP is: "
                + otp
                + "\n\n"
                + "This OTP is valid for 5 minutes.\n\n"
                + "Please do not share this OTP with anyone.\n\n"
                + "Regards,\n"
                + "FreelanceHub Team"
        );

        mailSender.send(message);
        log.info("OTP email sent to {}.", toEmail.trim());
    }

    public boolean isConfigured() {
        return fromAddress != null && !fromAddress.isEmpty();
    }
}