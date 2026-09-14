package com.freelancer.backend.controller;

import com.freelancer.backend.model.User;
import com.freelancer.backend.service.UserService;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/users")
@CrossOrigin(origins = "*")
public class UserController {

    private final UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
    }


    // ===============================
    // SIGNUP
    // ===============================

    @PostMapping("/signup")
    public ResponseEntity<?> signup(@RequestBody User user) {

        try {

            Optional<User> existingUser =
                    userService.getUserByEmail(user.getEmail());

            if (existingUser.isPresent()) {

                return ResponseEntity
                        .status(HttpStatus.CONFLICT)
                        .body("Email already registered.");
            }

            User savedUser =
                    userService.registerUser(user);

            return ResponseEntity
                    .status(HttpStatus.CREATED)
                    .body(savedUser);

        } catch (Exception e) {

            return ResponseEntity
                    .status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Signup failed: " + e.getMessage());
        }
    }


    // ===============================
    // LOGIN
    // ===============================

    @PostMapping("/login")
    public ResponseEntity<?> login(
            @RequestBody LoginRequest loginRequest) {

        try {

            Optional<User> user =
                    userService.loginUser(
                            loginRequest.getEmail(),
                            loginRequest.getPassword()
                    );

            if (user.isPresent()) {

                Map<String, Object> response =
                        new HashMap<>();

                response.put(
                        "message",
                        "Login successful"
                );

                response.put(
                        "user",
                        user.get()
                );

                return ResponseEntity.ok(response);
            }

            return ResponseEntity
                    .status(HttpStatus.UNAUTHORIZED)
                    .body("Invalid email or password.");

        } catch (Exception e) {

            return ResponseEntity
                    .status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Login failed: " + e.getMessage());
        }
    }


    // ===============================
    // GET ALL USERS
    // ===============================

    @GetMapping
    public ResponseEntity<?> getAllUsers() {

        try {

            return ResponseEntity.ok(
                    userService.getAllUsers()
            );

        } catch (Exception e) {

            return ResponseEntity
                    .status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(
                        "Failed to fetch users: "
                        + e.getMessage()
                    );
        }
    }// ===============================
// UPDATE PROFILE
// ===============================

@PutMapping("/{email}")
public ResponseEntity<?> updateProfile(
        @PathVariable String email,
        @RequestBody User updatedUser) {

    try {

        Optional<User> existingUser =
                userService.getUserByEmail(email);

        if (existingUser.isEmpty()) {

            return ResponseEntity
                    .status(HttpStatus.NOT_FOUND)
                    .body("User not found.");
        }

        User user = existingUser.get();

        user.setSkills(updatedUser.getSkills());
        user.setExperience(updatedUser.getExperience());
        user.setBio(updatedUser.getBio());

        User savedUser =
                userService.updateUser(user);

        return ResponseEntity.ok(savedUser);

    } catch (Exception e) {

        return ResponseEntity
                .status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body("Profile update failed: " + e.getMessage());
    }
}


    // ===============================
    // LOGIN REQUEST
    // ===============================

    public static class LoginRequest {

        private String email;

        private String password;


        // CONSTRUCTOR

        public LoginRequest() {
        }


        // GET EMAIL

        public String getEmail() {
            return email;
        }


        // SET EMAIL

        public void setEmail(String email) {
            this.email = email;
        }


        // GET PASSWORD

        public String getPassword() {
            return password;
        }


        // SET PASSWORD

        public void setPassword(String password) {
            this.password = password;
        }
    }
}