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
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class UserServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private JwtService jwtService;

    private final PasswordEncoder passwordEncoder =
            new BCryptPasswordEncoder();

    private UserService userService;

    @BeforeEach
    void setUp() {
        userService = new UserService(
                userRepository, passwordEncoder, jwtService);
    }

    private SignupRequest signupRequest() {
        SignupRequest request = new SignupRequest();
        request.setName("Test Freelancer");
        request.setEmail("dev@test.com");
        request.setPassword("secret123");
        request.setRole("freelancer");
        return request;
    }

    @Test
    void registerUserHashesPasswordAndNormalizesRole() {
        when(userRepository.findByEmailIgnoreCase("dev@test.com"))
                .thenReturn(Optional.empty());
        when(userRepository.save(any(User.class)))
                .thenAnswer(invocation ->
                        invocation.getArgument(0));

        UserResponse response =
                userService.registerUser(signupRequest());

        ArgumentCaptor<User> captor =
                ArgumentCaptor.forClass(User.class);
        verify(userRepository).save(captor.capture());

        User saved = captor.getValue();
        assertThat(saved.getPassword())
                .isNotEqualTo("secret123");
        assertThat(passwordEncoder.matches(
                "secret123", saved.getPassword())).isTrue();
        assertThat(response.getRole()).isEqualTo("FREELANCER");
        assertThat(response.getEmail()).isEqualTo("dev@test.com");
    }

    @Test
    void registerUserRejectsDuplicateEmail() {
        when(userRepository.findByEmailIgnoreCase("dev@test.com"))
                .thenReturn(Optional.of(new User()));

        assertThatThrownBy(
                () -> userService.registerUser(signupRequest()))
                .isInstanceOf(ConflictException.class)
                .hasMessage("Email already registered.");
    }

    @Test
    void registerUserRejectsAdminRole() {
        SignupRequest request = signupRequest();
        request.setRole("ADMIN");

        when(userRepository.findByEmailIgnoreCase("dev@test.com"))
                .thenReturn(Optional.empty());

        assertThatThrownBy(
                () -> userService.registerUser(request))
                .isInstanceOf(BadRequestException.class);
    }

    @Test
    void loginUserReturnsTokenOnSuccess() {
        User user = new User();
        user.setEmail("dev@test.com");
        user.setName("Test Freelancer");
        user.setRole("FREELANCER");
        user.setPassword(passwordEncoder.encode("secret123"));

        when(userRepository.findByEmailIgnoreCase("dev@test.com"))
                .thenReturn(Optional.of(user));
        when(jwtService.generateToken(user))
                .thenReturn("jwt-token");

        LoginRequest request = new LoginRequest();
        request.setEmail("dev@test.com");
        request.setPassword("secret123");

        AuthResponse response = userService.loginUser(request);

        assertThat(response.getToken()).isEqualTo("jwt-token");
        assertThat(response.getUser().getEmail())
                .isEqualTo("dev@test.com");
        assertThat(response.getMessage())
                .isEqualTo("Login successful");
    }

    @Test
    void loginUserRejectsWrongPassword() {
        User user = new User();
        user.setEmail("dev@test.com");
        user.setPassword(passwordEncoder.encode("secret123"));

        when(userRepository.findByEmailIgnoreCase("dev@test.com"))
                .thenReturn(Optional.of(user));

        LoginRequest request = new LoginRequest();
        request.setEmail("dev@test.com");
        request.setPassword("wrong");

        assertThatThrownBy(() -> userService.loginUser(request))
                .isInstanceOf(UnauthorizedException.class)
                .hasMessage("Invalid email or password.");
    }

    @Test
    void loginUserRejectsUnknownEmail() {
        when(userRepository.findByEmailIgnoreCase("no@test.com"))
                .thenReturn(Optional.empty());

        LoginRequest request = new LoginRequest();
        request.setEmail("no@test.com");
        request.setPassword("secret123");

        assertThatThrownBy(() -> userService.loginUser(request))
                .isInstanceOf(UnauthorizedException.class);
    }

    @Test
    void loginUserUpgradesLegacyPlaintextPassword() {
        User user = new User();
        user.setEmail("dev@test.com");
        user.setRole("CLIENT");
        user.setPassword("legacy-plain");

        when(userRepository.findByEmailIgnoreCase("dev@test.com"))
                .thenReturn(Optional.of(user));
        when(userRepository.save(any(User.class)))
                .thenAnswer(invocation ->
                        invocation.getArgument(0));
        when(jwtService.generateToken(any(User.class)))
                .thenReturn("jwt-token");

        LoginRequest request = new LoginRequest();
        request.setEmail("dev@test.com");
        request.setPassword("legacy-plain");

        AuthResponse response = userService.loginUser(request);

        assertThat(response.getToken()).isEqualTo("jwt-token");

        ArgumentCaptor<User> captor =
                ArgumentCaptor.forClass(User.class);
        verify(userRepository).save(captor.capture());
        assertThat(passwordEncoder.matches("legacy-plain",
                captor.getValue().getPassword())).isTrue();
    }

    @Test
    void getAllUsersMapsToResponses() {
        User user = new User();
        user.setId(1L);
        user.setEmail("dev@test.com");
        user.setPassword("hash");
        user.setRole("CLIENT");

        when(userRepository.findAll())
                .thenReturn(List.of(user));

        List<UserResponse> responses = userService.getAllUsers();

        assertThat(responses).hasSize(1);
        assertThat(responses.get(0).getEmail())
                .isEqualTo("dev@test.com");
    }

    @Test
    void updateUserThrowsWhenMissing() {
        UserUpdateRequest request = new UserUpdateRequest();
        request.setBio("bio");

        when(userRepository.findByEmailIgnoreCase("no@test.com"))
                .thenReturn(Optional.empty());

        assertThatThrownBy(() -> userService.updateUser(
                "no@test.com", request))
                .isInstanceOf(ResourceNotFoundException.class);
    }
}
