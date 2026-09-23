package com.freelancer.backend.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.freelancer.backend.config.SecurityConfig;
import com.freelancer.backend.dto.OtpDto.OtpGenerateRequest;
import com.freelancer.backend.dto.OtpDto.OtpVerifyRequest;
import com.freelancer.backend.exception.RateLimitException;
import com.freelancer.backend.security.JwtAuthFilter;
import com.freelancer.backend.security.JwtService;
import com.freelancer.backend.service.EmailService;
import com.freelancer.backend.service.OTPService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.mail.MailSendException;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.doThrow;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(OTPController.class)
@Import({ SecurityConfig.class, JwtAuthFilter.class, JwtService.class })
class OTPControllerTest {

    @Autowired
    private MockMvc mockMvc;

    private final ObjectMapper objectMapper = new ObjectMapper();

    @MockitoBean
    private OTPService otpService;

    @MockitoBean
    private EmailService emailService;

    private String generateBody(String email) throws Exception {
        OtpGenerateRequest request = new OtpGenerateRequest();
        request.setEmail(email);
        return objectMapper.writeValueAsString(request);
    }

    private String verifyBody(String email, String otp)
            throws Exception {
        OtpVerifyRequest request = new OtpVerifyRequest();
        request.setEmail(email);
        request.setOtp(otp);
        return objectMapper.writeValueAsString(request);
    }

    @Test
    void generateSendsOtpEmailAndReturnsJson() throws Exception {
        when(otpService.generateOTP("user@test.com"))
                .thenReturn("123456");

        mockMvc.perform(post("/api/otp/generate")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(generateBody("user@test.com")))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.message")
                        .value("OTP sent successfully to your email."));

        verify(emailService).sendOTPEmail(
                "user@test.com", "123456");
    }

    @Test
    void generateRejectsMissingEmailWithJson() throws Exception {
        mockMvc.perform(post("/api/otp/generate")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(generateBody("  ")))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message")
                        .value("Email is required."));
    }

    @Test
    void generateReturns429WhenRateLimited() throws Exception {
        when(otpService.generateOTP(anyString()))
                .thenThrow(new RateLimitException(
                        "Too many OTP requests. "
                        + "Please try again later."));

        mockMvc.perform(post("/api/otp/generate")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(generateBody("spam@test.com")))
                .andExpect(status().isTooManyRequests())
                .andExpect(jsonPath("$.message")
                        .exists());
    }

    @Test
    void generateReturns500WhenMailFails() throws Exception {
        when(otpService.generateOTP("user@test.com"))
                .thenReturn("123456");
        doThrow(new MailSendException("SMTP 535 auth failed"))
                .when(emailService)
                .sendOTPEmail("user@test.com", "123456");

        mockMvc.perform(post("/api/otp/generate")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(generateBody("user@test.com")))
                .andExpect(status().isInternalServerError())
                .andExpect(jsonPath("$.message")
                        .value("Failed to send OTP. "
                                + "Please try again later."));
    }

    @Test
    void generateReturns500WhenMailNotConfigured() throws Exception {
        when(otpService.generateOTP("user@test.com"))
                .thenReturn("123456");
        doThrow(new IllegalStateException(
                "Email service is not configured."))
                .when(emailService)
                .sendOTPEmail("user@test.com", "123456");

        mockMvc.perform(post("/api/otp/generate")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(generateBody("user@test.com")))
                .andExpect(status().isInternalServerError())
                .andExpect(jsonPath("$.message")
                        .exists());
    }

    @Test
    void verifyReturnsTextOnSuccess() throws Exception {
        when(otpService.verifyOTP("user@test.com", "123456"))
                .thenReturn(true);

        mockMvc.perform(post("/api/otp/verify")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(verifyBody(
                                "user@test.com", "123456")))
                .andExpect(status().isOk());
    }

    @Test
    void verifyReturns400OnWrongCode() throws Exception {
        when(otpService.verifyOTP("user@test.com", "000000"))
                .thenReturn(false);

        mockMvc.perform(post("/api/otp/verify")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(verifyBody(
                                "user@test.com", "000000")))
                .andExpect(status().isBadRequest());
    }

    @Test
    void verifyRejectsMissingFields() throws Exception {
        mockMvc.perform(post("/api/otp/verify")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(verifyBody("user@test.com", "  ")))
                .andExpect(status().isBadRequest());
    }
}
