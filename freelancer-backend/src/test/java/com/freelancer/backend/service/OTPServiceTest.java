package com.freelancer.backend.service;

import com.freelancer.backend.exception.RateLimitException;
import com.freelancer.backend.model.OTP;
import com.freelancer.backend.repository.OTPRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDateTime;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class OTPServiceTest {

    @Mock
    private OTPRepository otpRepository;

    private OTPService otpService;

    @BeforeEach
    void setUp() {
        otpService = new OTPService(otpRepository);
    }

    @Test
    void generateOTPProducesSixDigits() {
        when(otpRepository.findByEmail("dev@test.com"))
                .thenReturn(Optional.empty());
        when(otpRepository.save(any(OTP.class)))
                .thenAnswer(invocation ->
                        invocation.getArgument(0));

        String otp = otpService.generateOTP("dev@test.com");

        assertThat(otp).matches("\\d{6}");
        verify(otpRepository).save(any(OTP.class));
    }

    @Test
    void generateOTPIsRateLimited() {
        when(otpRepository.findByEmail("spam@test.com"))
                .thenReturn(Optional.empty());
        when(otpRepository.save(any(OTP.class)))
                .thenAnswer(invocation ->
                        invocation.getArgument(0));

        for (int i = 0; i < 5; i++) {
            otpService.generateOTP("spam@test.com");
        }

        assertThatThrownBy(
                () -> otpService.generateOTP("spam@test.com"))
                .isInstanceOf(RateLimitException.class);
    }

    @Test
    void verifyOTPDeletesRecordOnSuccess() {
        OTP saved = new OTP("dev@test.com", "123456",
                LocalDateTime.now().plusMinutes(5));

        when(otpRepository.findByEmail("dev@test.com"))
                .thenReturn(Optional.of(saved));

        assertThat(otpService.verifyOTP(
                "dev@test.com", "123456")).isTrue();
        verify(otpRepository).delete(saved);
    }

    @Test
    void verifyOTPCountsWrongAttempts() {
        OTP saved = new OTP("dev@test.com", "123456",
                LocalDateTime.now().plusMinutes(5));

        when(otpRepository.findByEmail("dev@test.com"))
                .thenReturn(Optional.of(saved));
        when(otpRepository.save(any(OTP.class)))
                .thenAnswer(invocation ->
                        invocation.getArgument(0));

        assertThat(otpService.verifyOTP(
                "dev@test.com", "000000")).isFalse();
        assertThat(saved.getAttempts()).isEqualTo(1);
        verify(otpRepository, never()).delete(any(OTP.class));
    }

    @Test
    void verifyOTPRejectsExpiredCode() {
        OTP saved = new OTP("dev@test.com", "123456",
                LocalDateTime.now().minusMinutes(1));

        when(otpRepository.findByEmail("dev@test.com"))
                .thenReturn(Optional.of(saved));

        assertThat(otpService.verifyOTP(
                "dev@test.com", "123456")).isFalse();
        verify(otpRepository).delete(saved);
    }

    @Test
    void verifyOTPLocksOutAfterMaxAttempts() {
        OTP saved = new OTP("dev@test.com", "123456",
                LocalDateTime.now().plusMinutes(5));
        saved.setAttempts(5);

        when(otpRepository.findByEmail("dev@test.com"))
                .thenReturn(Optional.of(saved));

        assertThat(otpService.verifyOTP(
                "dev@test.com", "123456")).isFalse();
        verify(otpRepository).delete(saved);
    }
}
