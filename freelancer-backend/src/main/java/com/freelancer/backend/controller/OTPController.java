package com.freelancer.backend.controller;

import com.freelancer.backend.service.EmailService;
import com.freelancer.backend.service.OTPService;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/otp")
@CrossOrigin(origins = "*")
public class OTPController {

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
    public ResponseEntity<?> generateOTP(
            @RequestBody OTPRequest request) {

        try {

            if (request.getEmail() == null ||
                    request.getEmail().trim().isEmpty()) {

                return ResponseEntity
                        .badRequest()
                        .body("Email is required.");
            }

            String email =
                    request.getEmail().trim();

            // Generate and save OTP
            String otp =
                    otpService.generateOTP(email);

            // Send OTP to Gmail
            emailService.sendOTPEmail(email, otp);

            Map<String, Object> response =
                    new HashMap<>();

            response.put(
                    "message",
                    "OTP sent successfully to your email."
            );

            return ResponseEntity.ok(response);

        } catch (Exception e) {

            e.printStackTrace();

            return ResponseEntity
                    .internalServerError()
                    .body(
                        "Failed to send OTP: "
                        + e.getMessage()
                    );
        }
    }


    // ===============================
    // VERIFY OTP
    // ===============================

    @PostMapping("/verify")
    public ResponseEntity<?> verifyOTP(
            @RequestBody OTPVerifyRequest request) {

        try {

            if (request.getEmail() == null ||
                    request.getOtp() == null) {

                return ResponseEntity
                        .badRequest()
                        .body(
                            "Email and OTP are required."
                        );
            }

            boolean verified =
                    otpService.verifyOTP(
                            request.getEmail().trim(),
                            request.getOtp().trim()
                    );

            if (verified) {

                return ResponseEntity.ok(
                        "OTP verified successfully."
                );
            }

            return ResponseEntity
                    .badRequest()
                    .body(
                        "Invalid or expired OTP."
                    );

        } catch (Exception e) {

            return ResponseEntity
                    .internalServerError()
                    .body(
                        "OTP verification failed: "
                        + e.getMessage()
                    );
        }
    }


    // ===============================
    // OTP REQUEST
    // ===============================

    public static class OTPRequest {

        private String email;

        public OTPRequest() {
        }

        public String getEmail() {
            return email;
        }

        public void setEmail(String email) {
            this.email = email;
        }
    }


    // ===============================
    // OTP VERIFY REQUEST
    // ===============================

    public static class OTPVerifyRequest {

        private String email;

        private String otp;

        public OTPVerifyRequest() {
        }

        public String getEmail() {
            return email;
        }

        public void setEmail(String email) {
            this.email = email;
        }

        public String getOtp() {
            return otp;
        }

        public void setOtp(String otp) {
            this.otp = otp;
        }
    }
}
