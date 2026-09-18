package com.freelancer.backend.service;

import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
public class EmailService {

    private final JavaMailSender mailSender;

    public EmailService(JavaMailSender mailSender) {
        this.mailSender = mailSender;
    }

    public void sendOTPEmail(String toEmail, String otp) {

        SimpleMailMessage message =
                new SimpleMailMessage();

        message.setTo(toEmail);

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
    }
}