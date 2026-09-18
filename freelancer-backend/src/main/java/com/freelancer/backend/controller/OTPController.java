package com.freelancer.backend.controller;

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

    public OTPController(OTPService otpService) {
        this.otpService = otpService;
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

            String otp =
                    otpService.generateOTP(email);

            Map<String, Object> response =
                    new HashMap<>();

            response.put(
                    "message",
                    "OTP generated successfully."
            );

            response.put(
                    "otp",
                    otp
            );

            return ResponseEntity.ok(response);

        } catch (Exception e) {

            return ResponseEntity
                    .internalServerError()
                    .body(
                        "Failed to generate OTP: "
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
                        .body("Email and OTP are required.");
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
                    .body("Invalid or expired OTP.");

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