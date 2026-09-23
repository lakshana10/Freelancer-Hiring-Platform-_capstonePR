package com.freelancer.backend.service;

import com.freelancer.backend.dto.UserDto.AuthResponse;
import com.freelancer.backend.dto.UserDto.LoginRequest;
import com.freelancer.backend.dto.UserDto.SignupRequest;
import com.freelancer.backend.dto.UserDto.UserResponse;
import com.freelancer.backend.dto.UserDto.UserUpdateRequest;
import com.freelancer.backend.exception.BadRequestException;
import com.freelancer.backend.exception.ConflictException;
import com.freelancer.backend.exception.ResourceNotFoundException;
import com.freelancer.backend.exception.UnauthorizedException;
import com.freelancer.backend.model.User;
import com.freelancer.backend.repository.UserRepository;
import com.freelancer.backend.security.JwtService;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.List;

/**
 * Works entirely with DTOs. Entities never leave this layer.
 * Passwords are stored as BCrypt hashes. Accounts created before
 * hashing was introduced are transparently upgraded on next login.
 */
@Service
public class UserService {

    private final UserRepository userRepository;

    private final PasswordEncoder passwordEncoder;

    private final JwtService jwtService;

    public UserService(
            UserRepository userRepository,
            PasswordEncoder passwordEncoder,
            JwtService jwtService) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
    }

    // ===============================
    // REGISTER USER
    // ===============================

    public UserResponse registerUser(SignupRequest request) {
        String email = request.getEmail().trim();

        if (userRepository.findByEmailIgnoreCase(email).isPresent()) {
            throw new ConflictException("Email already registered.");
        }

        String role = request.getRole().trim().toUpperCase();

        if (!role.equals("CLIENT") && !role.equals("FREELANCER")) {
            throw new BadRequestException(
                    "Invalid role. Must be CLIENT or FREELANCER.");
        }

        User user = new User();
        user.setName(request.getName().trim());
        user.setEmail(email);
        user.setPassword(
                passwordEncoder.encode(request.getPassword()));
        user.setRole(role);

        return UserResponse.from(userRepository.save(user));
    }

    // ===============================
    // LOGIN USER
    // ===============================

    public AuthResponse loginUser(LoginRequest request) {
        String email = request.getEmail().trim();

        User user = userRepository
                .findByEmailIgnoreCase(email)
                .orElseThrow(() -> new UnauthorizedException(
                        "Invalid email or password."));

        String storedPassword = user.getPassword();

        if (isBcryptHash(storedPassword)) {
            if (!passwordEncoder.matches(
                    request.getPassword(), storedPassword)) {
                throw new UnauthorizedException(
                        "Invalid email or password.");
            }
        } else if (!storedPassword.equals(request.getPassword())) {
            throw new UnauthorizedException(
                    "Invalid email or password.");
        } else {
            user.setPassword(passwordEncoder.encode(
                    request.getPassword()));
            user = userRepository.save(user);
        }

        return new AuthResponse(
                "Login successful",
                jwtService.generateToken(user),
                UserResponse.from(user));
    }

    // ===============================
    // GET ALL USERS
    // ===============================

    public List<UserResponse> getAllUsers() {
        return userRepository.findAll()
                .stream()
                .map(UserResponse::from)
                .toList();
    }

    // ===============================
    // UPDATE USER PROFILE
    // ===============================

    public UserResponse updateUser(
            String email, UserUpdateRequest request) {

        User user = userRepository
                .findByEmailIgnoreCase(email.trim())
                .orElseThrow(() -> new ResourceNotFoundException(
                        "User not found."));

        user.setSkills(request.getSkills());
        user.setExperience(request.getExperience());
        user.setBio(request.getBio());

        return UserResponse.from(userRepository.save(user));
    }

    private boolean isBcryptHash(String password) {
        return password != null
                && (password.startsWith("$2a$")
                    || password.startsWith("$2b$")
                    || password.startsWith("$2y$"));
    }
}
