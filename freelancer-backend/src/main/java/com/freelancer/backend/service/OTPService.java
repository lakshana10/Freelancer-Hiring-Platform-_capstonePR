package com.freelancer.backend.service;

import com.freelancer.backend.model.OTP;
import com.freelancer.backend.repository.OTPRepository;

import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.Optional;
import java.util.Random;

@Service
public class OTPService {

    private final OTPRepository otpRepository;

    public OTPService(OTPRepository otpRepository) {
        this.otpRepository = otpRepository;
    }

    // Generate and save a 6-digit OTP
    public String generateOTP(String email) {

        Random random = new Random();

        String otp = String.format(
                "%06d",
                random.nextInt(1000000)
        );

        LocalDateTime expiryTime =
                LocalDateTime.now().plusMinutes(5);

        Optional<OTP> existingOTP =
                otpRepository.findByEmail(email);

        OTP otpData;

        if (existingOTP.isPresent()) {

            otpData = existingOTP.get();

            otpData.setOtp(otp);
            otpData.setExpiryTime(expiryTime);

        } else {

            otpData =
                    new OTP(
                            email,
                            otp,
                            expiryTime
                    );
        }

        otpRepository.save(otpData);

        return otp;
    }


    // Verify OTP
    public boolean verifyOTP(
            String email,
            String otp) {

        Optional<OTP> otpData =
                otpRepository.findByEmail(email);

        if (otpData.isEmpty()) {
            return false;
        }

        OTP savedOTP = otpData.get();

        if (LocalDateTime.now()
                .isAfter(savedOTP.getExpiryTime())) {

            return false;
        }

        return savedOTP.getOtp().equals(otp);
    }
}