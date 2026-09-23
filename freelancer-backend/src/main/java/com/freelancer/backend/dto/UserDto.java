package com.freelancer.backend.dto;

import com.freelancer.backend.model.User;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

/**
 * Request/response objects for the user and auth APIs.
 * The password hash never leaves the server: responses
 * expose UserResponse, which has no password field.
 */
public final class UserDto {

    private UserDto() {
    }

    public static class SignupRequest {

        @NotBlank(message = "Name is required.")
        private String name;

        @NotBlank(message = "Email is required.")
        @Email(message = "Email must be valid.")
        private String email;

        @NotBlank(message = "Password is required.")
        @Size(min = 8, message = "Password must be at least 8 characters.")
        @Pattern(
                regexp = "^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)"
                        + "(?=.*[@$!%*?&^#_+\\-=:;.]).{8,}$",
                message = "Password must contain an uppercase letter, "
                        + "a lowercase letter, a digit and a special character.")
        private String password;

        @NotBlank(message = "Role is required.")
        private String role;

        public SignupRequest() {
        }

        public String getName() {
            return name;
        }

        public void setName(String name) {
            this.name = name;
        }

        public String getEmail() {
            return email;
        }

        public void setEmail(String email) {
            this.email = email;
        }

        public String getPassword() {
            return password;
        }

        public void setPassword(String password) {
            this.password = password;
        }

        public String getRole() {
            return role;
        }

        public void setRole(String role) {
            this.role = role;
        }
    }

    public static class LoginRequest {

        @NotBlank(message = "Email is required.")
        private String email;

        @NotBlank(message = "Password is required.")
        private String password;

        public LoginRequest() {
        }

        public String getEmail() {
            return email;
        }

        public void setEmail(String email) {
            this.email = email;
        }

        public String getPassword() {
            return password;
        }

        public void setPassword(String password) {
            this.password = password;
        }
    }

    public static class UserUpdateRequest {

        private String skills;

        private String experience;

        private String bio;

        public UserUpdateRequest() {
        }

        public String getSkills() {
            return skills;
        }

        public void setSkills(String skills) {
            this.skills = skills;
        }

        public String getExperience() {
            return experience;
        }

        public void setExperience(String experience) {
            this.experience = experience;
        }

        public String getBio() {
            return bio;
        }

        public void setBio(String bio) {
            this.bio = bio;
        }
    }

    public static class UserResponse {

        private Long id;
        private String name;
        private String email;
        private String role;
        private String skills;
        private String experience;
        private String bio;

        public UserResponse() {
        }

        public static UserResponse from(User user) {
            UserResponse response = new UserResponse();
            response.setId(user.getId());
            response.setName(user.getName());
            response.setEmail(user.getEmail());
            response.setRole(user.getRole());
            response.setSkills(user.getSkills());
            response.setExperience(user.getExperience());
            response.setBio(user.getBio());
            return response;
        }

        public Long getId() {
            return id;
        }

        public void setId(Long id) {
            this.id = id;
        }

        public String getName() {
            return name;
        }

        public void setName(String name) {
            this.name = name;
        }

        public String getEmail() {
            return email;
        }

        public void setEmail(String email) {
            this.email = email;
        }

        public String getRole() {
            return role;
        }

        public void setRole(String role) {
            this.role = role;
        }

        public String getSkills() {
            return skills;
        }

        public void setSkills(String skills) {
            this.skills = skills;
        }

        public String getExperience() {
            return experience;
        }

        public void setExperience(String experience) {
            this.experience = experience;
        }

        public String getBio() {
            return bio;
        }

        public void setBio(String bio) {
            this.bio = bio;
        }
    }

    public static class AuthResponse {

        private String message;
        private String token;
        private UserResponse user;

        public AuthResponse() {
        }

        public AuthResponse(
                String message, String token, UserResponse user) {
            this.message = message;
            this.token = token;
            this.user = user;
        }

        public String getMessage() {
            return message;
        }

        public void setMessage(String message) {
            this.message = message;
        }

        public String getToken() {
            return token;
        }

        public void setToken(String token) {
            this.token = token;
        }

        public UserResponse getUser() {
            return user;
        }

        public void setUser(UserResponse user) {
            this.user = user;
        }
    }
}
