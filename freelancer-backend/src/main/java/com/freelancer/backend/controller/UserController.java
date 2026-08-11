package com.freelancer.backend.controller;

import com.freelancer.backend.model.User;
import com.freelancer.backend.service.UserService;
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

    // SIGNUP
    @PostMapping("/signup")
    public ResponseEntity<?> signup(@RequestBody User user) {

        if (userService.getUserByEmail(user.getEmail()).isPresent()) {
            return ResponseEntity
                    .badRequest()
                    .body("Email already registered");
        }

        User savedUser = userService.registerUser(user);

        return ResponseEntity.ok(savedUser);
    }

    // LOGIN
    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody Map<String, String> loginData) {

        String email = loginData.get("email");
        String password = loginData.get("password");

        Optional<User> user =
                userService.loginUser(email, password);

        if (user.isPresent()) {

            Map<String, Object> response = new HashMap<>();

            response.put("message", "Login successful");
            response.put("user", user.get());

            return ResponseEntity.ok(response);
        }

        return ResponseEntity
                .status(401)
                .body("Invalid email or password");
    }
}