package com.freelancer.backend.dto;

/**
 * OTP payloads. These are validated manually in the controller
 * (not with @Valid) so that error responses stay JSON, which is
 * what the signup page expects from /api/otp/generate.
 */
public final class OtpDto {

    private OtpDto() {
    }

    public static class OtpGenerateRequest {

        private String email;

        public OtpGenerateRequest() {
        }

        public String getEmail() {
            return email;
        }

        public void setEmail(String email) {
            this.email = email;
        }
    }

    public static class OtpVerifyRequest {

        private String email;

        private String otp;

        public OtpVerifyRequest() {
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
