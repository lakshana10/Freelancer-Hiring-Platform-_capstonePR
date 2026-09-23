package com.freelancer.backend.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.freelancer.backend.dto.UserDto.AuthResponse;
import com.freelancer.backend.dto.UserDto.LoginRequest;
import com.freelancer.backend.dto.UserDto.SignupRequest;
import com.freelancer.backend.dto.UserDto.UserResponse;
import com.freelancer.backend.dto.UserDto.UserUpdateRequest;
import com.freelancer.backend.exception.ConflictException;
import com.freelancer.backend.exception.UnauthorizedException;
import com.freelancer.backend.model.User;
import com.freelancer.backend.security.JwtService;
import com.freelancer.backend.service.UserService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.http.MediaType;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import java.util.List;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
class UserControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private JwtService jwtService;

    private final ObjectMapper objectMapper = new ObjectMapper();

    @MockitoBean
    private UserService userService;

    private SignupRequest signupRequest() {
        SignupRequest request = new SignupRequest();
        request.setName("Test Freelancer");
        request.setEmail("dev@test.com");
        request.setPassword("Secret123!");
        request.setRole("FREELANCER");
        return request;
    }

    private UserResponse userResponse() {
        UserResponse response = new UserResponse();
        response.setId(1L);
        response.setName("Test Freelancer");
        response.setEmail("dev@test.com");
        response.setRole("FREELANCER");
        return response;
    }

    private String token(String email, String role) {
        User user = new User();
        user.setEmail(email);
        user.setName("Test User");
        user.setRole(role);
        return jwtService.generateToken(user);
    }

    private String bearer(String email, String role) {
        return "Bearer " + token(email, role);
    }

    @Test
    void signupReturnsCreatedWithoutPassword() throws Exception {
        when(userService.registerUser(any(SignupRequest.class)))
                .thenReturn(userResponse());

        mockMvc.perform(post("/api/users/signup")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(
                                signupRequest())))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.email")
                        .value("dev@test.com"))
                .andExpect(jsonPath("$.password")
                        .doesNotExist());
    }

    @Test
    void signupRejectsInvalidBody() throws Exception {
        SignupRequest request = signupRequest();
        request.setEmail("not-an-email");
        request.setPassword("123");

        mockMvc.perform(post("/api/users/signup")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(
                                request)))
                .andExpect(status().isBadRequest());
    }

    @Test
    void signupRejectsWeakPassword() throws Exception {
        // 8+ chars but missing uppercase, digit and special char.
        SignupRequest request = signupRequest();
        request.setPassword("weakpass");

        mockMvc.perform(post("/api/users/signup")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(
                                request)))
                .andExpect(status().isBadRequest());
    }

    @Test
    void signupConflictReturns409() throws Exception {
        when(userService.registerUser(any(SignupRequest.class)))
                .thenThrow(new ConflictException(
                        "Email already registered."));

        mockMvc.perform(post("/api/users/signup")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(
                                signupRequest())))
                .andExpect(status().isConflict());
    }

    @Test
    void loginReturnsTokenAndUser() throws Exception {
        AuthResponse auth = new AuthResponse(
                "Login successful", "jwt-token", userResponse());
        when(userService.loginUser(any(LoginRequest.class)))
                .thenReturn(auth);

        LoginRequest request = new LoginRequest();
        request.setEmail("dev@test.com");
        request.setPassword("secret123");

        mockMvc.perform(post("/api/users/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(
                                request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.token")
                        .value("jwt-token"))
                .andExpect(jsonPath("$.user.email")
                        .value("dev@test.com"))
                .andExpect(jsonPath("$.user.password")
                        .doesNotExist());
    }

    @Test
    void loginWithBadCredentialsReturns401() throws Exception {
        when(userService.loginUser(any(LoginRequest.class)))
                .thenThrow(new UnauthorizedException(
                        "Invalid email or password."));

        LoginRequest request = new LoginRequest();
        request.setEmail("dev@test.com");
        request.setPassword("wrong");

        mockMvc.perform(post("/api/users/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(
                                request)))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void getAllUsersIsPublic() throws Exception {
        when(userService.getAllUsers())
                .thenReturn(List.of(userResponse()));

        mockMvc.perform(get("/api/users"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].email")
                        .value("dev@test.com"));
    }

    @Test
    void updateProfileWithoutAuthReturns401() throws Exception {
        UserUpdateRequest request = new UserUpdateRequest();
        request.setBio("bio");

        mockMvc.perform(put("/api/users/dev@test.com")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(
                                request)))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void updateOwnProfileSucceeds() throws Exception {
        when(userService.updateUser(
                any(String.class),
                any(UserUpdateRequest.class)))
                .thenReturn(userResponse());

        UserUpdateRequest request = new UserUpdateRequest();
        request.setBio("bio");

        mockMvc.perform(put("/api/users/dev@test.com")
                        .header("Authorization",
                                bearer("dev@test.com", "FREELANCER"))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(
                                request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.email")
                        .value("dev@test.com"));
    }

    @Test
    void updateOtherUsersProfileIsForbidden() throws Exception {
        UserUpdateRequest request = new UserUpdateRequest();
        request.setBio("bio");

        mockMvc.perform(put("/api/users/dev@test.com")
                        .header("Authorization",
                                bearer("other@test.com", "CLIENT"))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(
                                request)))
                .andExpect(status().isForbidden());
    }
}
