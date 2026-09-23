package com.freelancer.backend.controller;

import com.freelancer.backend.dto.UserDto.AuthResponse;
import com.freelancer.backend.dto.UserDto.LoginRequest;
import com.freelancer.backend.dto.UserDto.SignupRequest;
import com.freelancer.backend.dto.UserDto.UserResponse;
import com.freelancer.backend.dto.UserDto.UserUpdateRequest;
import com.freelancer.backend.service.UserService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/users")
public class UserController {

    private final UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
    }

    // ===============================
    // SIGNUP (public)
    // ===============================

    @PostMapping("/signup")
    public ResponseEntity<UserResponse> signup(
            @Valid @RequestBody SignupRequest request) {

        UserResponse savedUser =
                userService.registerUser(request);

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(savedUser);
    }

    // ===============================
    // LOGIN (public)
    // ===============================

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(
            @Valid @RequestBody LoginRequest request) {

        AuthResponse response =
                userService.loginUser(request);

        return ResponseEntity.ok(response);
    }

    // ===============================
    // GET ALL USERS (public directory)
    // ===============================

    @GetMapping
    public ResponseEntity<List<UserResponse>> getAllUsers() {
        return ResponseEntity.ok(userService.getAllUsers());
    }

    // ===============================
    // UPDATE PROFILE (self or admin)
    // ===============================

    @PutMapping("/{email}")
    @PreAuthorize(
        "#email == authentication.name or hasRole('ADMIN')")
    public ResponseEntity<UserResponse> updateProfile(
            @PathVariable String email,
            @RequestBody UserUpdateRequest request) {

        return ResponseEntity.ok(
                userService.updateUser(email, request));
    }
}
