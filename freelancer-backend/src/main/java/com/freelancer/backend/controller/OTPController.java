package com.freelancer.backend.controller;

import com.freelancer.backend.dto.OtpDto.OtpGenerateRequest;
import com.freelancer.backend.dto.OtpDto.OtpVerifyRequest;
import com.freelancer.backend.exception.RateLimitException;
import com.freelancer.backend.service.EmailService;
import com.freelancer.backend.service.OTPService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.mail.MailException;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

/**
 * OTP endpoints stay public. /generate always answers JSON
 * because the signup page parses the body with response.json().
 * /verify answers plain text (the page uses response.text()).
 */
@RestController
@RequestMapping("/api/otp")
public class OTPController {

    private static final Logger log =
            LoggerFactory.getLogger(OTPController.class);

    private final OTPService otpService;
    private final EmailService emailService;

    public OTPController(
            OTPService otpService,
            EmailService emailService) {
        this.otpService = otpService;
        this.emailService = emailService;
    }

    // ===============================
    // GENERATE OTP
    // ===============================

    @PostMapping("/generate")
    public ResponseEntity<Map<String, String>> generateOTP(
            @RequestBody OtpGenerateRequest request) {

        if (request.getEmail() == null
                || request.getEmail().trim().isEmpty()) {
            return json(HttpStatus.BAD_REQUEST,
                    "Email is required.");
        }

        String email = request.getEmail().trim();

        try {
            String otp = otpService.generateOTP(email);

            emailService.sendOTPEmail(email, otp);

            return json(HttpStatus.OK,
                    "OTP sent successfully to your email.");

        } catch (RateLimitException e) {
            return json(HttpStatus.TOO_MANY_REQUESTS,
                    e.getMessage());

        } catch (IllegalStateException e) {
            // MAIL_USERNAME / MAIL_PASSWORD missing on server.
            log.error("OTP mail not configured for {}: {}",
                    email, e.getMessage());
            return json(HttpStatus.INTERNAL_SERVER_ERROR,
                    "Email service is not configured. "
                    + "Please contact support.");

        } catch (MailException e) {
            // Gmail rejected the send (bad App Password,
            // SMTP blocked, quota, etc.). OTP is already stored,
            // so the user can retry without losing rate-limit budget
            // beyond the one attempt just consumed.
            log.error("Failed to send OTP to {}: {}",
                    email, e.getMessage());
            return json(HttpStatus.INTERNAL_SERVER_ERROR,
                    "Failed to send OTP. Please try again later.");

        } catch (Exception e) {
            log.error("Failed to send OTP to {}: {}",
                    email, e.getMessage());
            return json(HttpStatus.INTERNAL_SERVER_ERROR,
                    "Failed to send OTP. Please try again later.");
        }
    }

    // ===============================
    // VERIFY OTP
    // ===============================

    @PostMapping("/verify")
    public ResponseEntity<String> verifyOTP(
            @RequestBody OtpVerifyRequest request) {

        if (request.getEmail() == null
                || request.getOtp() == null
                || request.getEmail().trim().isEmpty()
                || request.getOtp().trim().isEmpty()) {
            return ResponseEntity
                    .badRequest()
                    .body("Email and OTP are required.");
        }

        boolean verified = otpService.verifyOTP(
                request.getEmail().trim(),
                request.getOtp().trim());

        if (verified) {
            return ResponseEntity.ok(
                    "OTP verified successfully.");
        }

        return ResponseEntity
                .badRequest()
                .body("Invalid or expired OTP.");
    }

    private ResponseEntity<Map<String, String>> json(
            HttpStatus status, String message) {
        Map<String, String> body = new HashMap<>();
        body.put("message", message);
        return ResponseEntity.status(status).body(body);
    }
}
