package com.freelancer.backend.security;

import com.freelancer.backend.model.User;
import io.jsonwebtoken.JwtException;
import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

class JwtServiceTest {

    private static final String SECRET =
            "test-secret-key-for-unit-tests-only-0123456789abcdef";

    private final JwtService jwtService =
            new JwtService(SECRET, 3600000);

    private User user() {
        User user = new User();
        user.setEmail("dev@test.com");
        user.setName("Test Freelancer");
        user.setRole("FREELANCER");
        return user;
    }

    @Test
    void generateAndParseRoundTrip() {
        String token = jwtService.generateToken(user());

        JwtService.ParsedToken parsed = jwtService.parse(token);

        assertThat(parsed.email()).isEqualTo("dev@test.com");
        assertThat(parsed.role()).isEqualTo("FREELANCER");
    }

    @Test
    void parseRejectsTamperedToken() {
        String token = jwtService.generateToken(user());

        String tampered = token.substring(0, token.length() - 2)
                + "xx";

        assertThatThrownBy(() -> jwtService.parse(tampered))
                .isInstanceOf(JwtException.class);
    }

    @Test
    void parseRejectsTokenSignedWithAnotherSecret() {
        JwtService other = new JwtService(
                "another-test-secret-key-0123456789abcdef-gh",
                3600000);

        String token = other.generateToken(user());

        assertThatThrownBy(() -> jwtService.parse(token))
                .isInstanceOf(JwtException.class);
    }

    @Test
    void parseRejectsExpiredToken() {
        JwtService expired =
                new JwtService(SECRET, -1000);

        String token = expired.generateToken(user());

        assertThatThrownBy(() -> jwtService.parse(token))
                .isInstanceOf(JwtException.class);
    }

    @Test
    void constructorRejectsShortSecret() {
        assertThatThrownBy(
                () -> new JwtService("too-short", 3600000))
                .isInstanceOf(IllegalStateException.class);
    }
}
