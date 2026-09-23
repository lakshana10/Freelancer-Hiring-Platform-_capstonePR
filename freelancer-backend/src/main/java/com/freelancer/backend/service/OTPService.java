package com.freelancer.backend.service;

import com.freelancer.backend.exception.RateLimitException;
import com.freelancer.backend.model.OTP;
import com.freelancer.backend.repository.OTPRepository;
import org.springframework.stereotype.Service;

import java.security.SecureRandom;
import java.time.Duration;
import java.time.LocalDateTime;
import java.util.ArrayDeque;
import java.util.Deque;
import java.util.Map;
import java.util.Optional;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class OTPService {

    private static final int MAX_ATTEMPTS = 5;

    private static final int MAX_GENERATIONS_PER_WINDOW = 5;

    private static final Duration GENERATION_WINDOW =
            Duration.ofMinutes(10);

    private final OTPRepository otpRepository;

    private final SecureRandom secureRandom = new SecureRandom();

    private final Map<String, Deque<LocalDateTime>> generationLog =
            new ConcurrentHashMap<>();

    public OTPService(OTPRepository otpRepository) {
        this.otpRepository = otpRepository;
    }

    // Generate and save a 6-digit OTP (cryptographically secure)
    public String generateOTP(String email) {
        checkGenerationAllowed(email);

        String otp = String.format(
                "%06d",
                secureRandom.nextInt(1000000));

        LocalDateTime expiryTime =
                LocalDateTime.now().plusMinutes(5);

        Optional<OTP> existingOTP =
                otpRepository.findByEmail(email);

        OTP otpData;

        if (existingOTP.isPresent()) {
            otpData = existingOTP.get();
            otpData.setOtp(otp);
            otpData.setExpiryTime(expiryTime);
            otpData.setAttempts(0);
        } else {
            otpData = new OTP(email, otp, expiryTime);
        }

        otpRepository.save(otpData);

        return otp;
    }

    // Verify OTP. Deletes the record on success, expiry, or when
    // the maximum number of wrong attempts is reached.
    public boolean verifyOTP(String email, String otp) {
        Optional<OTP> otpData =
                otpRepository.findByEmail(email);

        if (otpData.isEmpty()) {
            return false;
        }

        OTP savedOTP = otpData.get();

        if (LocalDateTime.now()
                .isAfter(savedOTP.getExpiryTime())) {
            otpRepository.delete(savedOTP);
            return false;
        }

        if (savedOTP.getAttempts() >= MAX_ATTEMPTS) {
            otpRepository.delete(savedOTP);
            return false;
        }

        if (savedOTP.getOtp().equals(otp)) {
            otpRepository.delete(savedOTP);
            return true;
        }

        savedOTP.setAttempts(savedOTP.getAttempts() + 1);
        otpRepository.save(savedOTP);

        return false;
    }

    private void checkGenerationAllowed(String email) {
        String key = email.toLowerCase();
        LocalDateTime now = LocalDateTime.now();

        Deque<LocalDateTime> timestamps =
                generationLog.computeIfAbsent(
                        key, value -> new ArrayDeque<>());

        synchronized (timestamps) {
            while (!timestamps.isEmpty()
                    && timestamps.peekFirst()
                            .isBefore(now.minus(GENERATION_WINDOW))) {
                timestamps.pollFirst();
            }

            if (timestamps.size() >= MAX_GENERATIONS_PER_WINDOW) {
                throw new RateLimitException(
                        "Too many OTP requests. "
                        + "Please try again later.");
            }

            timestamps.addLast(now);
        }
    }
}
