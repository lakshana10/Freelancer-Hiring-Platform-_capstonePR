package com.freelancer.backend.security;

import com.freelancer.backend.model.User;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.JwtException;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.util.Date;

/**
 * Creates and validates JWT access tokens.
 *
 * Token claims:
 * - sub  : user email (used as the authentication name)
 * - role : CLIENT / FREELANCER / ADMIN (uppercase)
 * - name : display name
 */
@Service
public class JwtService {

    private static final Logger log =
            LoggerFactory.getLogger(JwtService.class);

    private static final String DEV_DEFAULT =
            "dev-only-insecure-secret-key-change-me-0123456789abcdef";

    private final SecretKey key;

    private final long expirationMs;

    public JwtService(
            @Value("${app.jwt.secret}") String secret,
            @Value("${app.jwt.expiration-ms}") long expirationMs) {

        if (secret == null || secret.isBlank()) {
            throw new IllegalStateException(
                    "JWT secret is not configured. "
                    + "Set the JWT_SECRET environment variable.");
        }

        byte[] secretBytes =
                secret.getBytes(StandardCharsets.UTF_8);

        if (secretBytes.length < 32) {
            throw new IllegalStateException(
                    "JWT secret must be at least 32 characters. "
                    + "Set the JWT_SECRET environment variable.");
        }

        if (DEV_DEFAULT.equals(secret)) {
            log.warn(
                "Using the built-in development JWT secret. "
                + "Set JWT_SECRET in the environment for any "
                + "shared or production deployment.");
        }

        this.key = Keys.hmacShaKeyFor(secretBytes);
        this.expirationMs = expirationMs;
    }

    public String generateToken(User user) {
        long now = System.currentTimeMillis();

        return Jwts.builder()
                .subject(user.getEmail())
                .claim("role", user.getRole())
                .claim("name", user.getName())
                .issuedAt(new Date(now))
                .expiration(new Date(now + expirationMs))
                .signWith(key)
                .compact();
    }

    public ParsedToken parse(String token) throws JwtException {
        Claims claims = Jwts.parser()
                .verifyWith(key)
                .build()
                .parseSignedClaims(token)
                .getPayload();

        String email = claims.getSubject();
        Object roleClaim = claims.get("role");

        if (email == null || email.isBlank() || roleClaim == null) {
            throw new JwtException(
                    "Token is missing required claims.");
        }

        return new ParsedToken(
                email,
                String.valueOf(roleClaim).toUpperCase());
    }

    public record ParsedToken(String email, String role) {
    }
}
