package com.freelancer.backend.service;

import com.freelancer.backend.controller.OTPController;
import com.freelancer.backend.dto.OtpDto.OtpGenerateRequest;
import com.freelancer.backend.dto.OtpDto.OtpVerifyRequest;
import com.freelancer.backend.model.OTP;
import com.freelancer.backend.repository.OTPRepository;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.test.context.bean.override.mockito.MockitoBean;

import java.util.Map;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;

/**
 * End-to-end OTP workflow without real SMTP:
 * generate (controller -> OTPService -> EmailService -> mocked
 * JavaMailSender) then verify (controller -> OTPService).
 * Runs on the H2 test database.
 */
@SpringBootTest(properties = {
        "app.mail.from=workflow-test@gmail.com"
})
class OTPEmailWorkflowTest {

    @Autowired
    private OTPController otpController;

    @Autowired
    private OTPRepository otpRepository;

    @MockitoBean
    private JavaMailSender mailSender;

    @Test
    void fullOtpWorkflowGenerateThenVerify() {
        String email = "workflow@test.com";

        OtpGenerateRequest generate = new OtpGenerateRequest();
        generate.setEmail(email);

        ResponseEntity<Map<String, String>> generated =
                otpController.generateOTP(generate);

        assertThat(generated.getStatusCode())
                .isEqualTo(HttpStatus.OK);
        assertThat(generated.getBody()).containsKey("message");

        // An OTP row must exist and an email must have been sent.
        assertThat(otpRepository.findByEmail(email)).isPresent();
        verify(mailSender).send(any(SimpleMailMessage.class));

        String code = otpRepository.findByEmail(email)
                .map(OTP::getOtp)
                .orElseThrow();

        assertThat(code).matches("\\d{6}");

        OtpVerifyRequest verify = new OtpVerifyRequest();
        verify.setEmail(email);
        verify.setOtp(code);

        assertThat(otpController.verifyOTP(verify)
                .getStatusCode()).isEqualTo(HttpStatus.OK);

        // Successful verification deletes the record.
        assertThat(otpRepository.findByEmail(email)).isEmpty();
    }

    @Test
    void wrongCodeDoesNotVerify() {
        String email = "wrong-code@test.com";

        OtpGenerateRequest generate = new OtpGenerateRequest();
        generate.setEmail(email);

        otpController.generateOTP(generate);

        OtpVerifyRequest verify = new OtpVerifyRequest();
        verify.setEmail(email);
        verify.setOtp("000000");

        assertThat(otpController.verifyOTP(verify)
                .getStatusCode()).isEqualTo(HttpStatus.BAD_REQUEST);
        assertThat(otpRepository.findByEmail(email)).isPresent();
    }
}
