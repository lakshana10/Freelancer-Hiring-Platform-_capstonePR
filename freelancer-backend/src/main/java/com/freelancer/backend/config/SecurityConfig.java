package com.freelancer.backend.config;

import com.freelancer.backend.security.JwtAuthFilter;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.http.MediaType;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.AnonymousAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.Arrays;
import java.util.List;

/**
 * Stateless JWT security configuration.
 *
 * Public endpoints (no login required):
 * - POST /api/users/signup, POST /api/users/login
 * - POST /api/otp/generate, POST /api/otp/verify
 * - GET  /api/jobs and GET /api/jobs/{id} (public job board)
 * - GET  /api/users (public freelancer directory, no passwords)
 * - /ws/** (websocket handshake; STOMP CONNECT carries the JWT)
 *
 * Everything else requires a valid "Authorization: Bearer <jwt>"
 * header. Fine-grained role and ownership rules live on the
 * controller methods via @PreAuthorize plus service-level checks.
 */
@Configuration
@EnableWebSecurity
@EnableMethodSecurity
public class SecurityConfig {

    private final JwtAuthFilter jwtAuthFilter;

    private final String allowedOrigins;

    public SecurityConfig(
            JwtAuthFilter jwtAuthFilter,
            @Value("${app.cors.allowed-origins}") String allowedOrigins) {
        this.jwtAuthFilter = jwtAuthFilter;
        this.allowedOrigins = allowedOrigins;
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http)
            throws Exception {

        http
            .csrf(csrf -> csrf.disable())
            .cors(cors -> cors.configurationSource(
                    corsConfigurationSource()))
            .sessionManagement(session -> session
                    .sessionCreationPolicy(
                            SessionCreationPolicy.STATELESS))
            .exceptionHandling(handling -> handling
                    .authenticationEntryPoint((request, response, ex) -> {
                        response.setStatus(
                                HttpServletResponse.SC_UNAUTHORIZED);
                        response.setContentType(
                                MediaType.TEXT_PLAIN_VALUE);
                        response.getWriter().write(
                                "Unauthorized: please login.");
                    })
                    .accessDeniedHandler((request, response, ex) -> {
                        response.setStatus(
                                HttpServletResponse.SC_FORBIDDEN);
                        response.setContentType(
                                MediaType.TEXT_PLAIN_VALUE);
                        response.getWriter().write(
                                "Forbidden: insufficient permissions.");
                    }))
            .authorizeHttpRequests(auth -> auth
                    .requestMatchers(
                            HttpMethod.OPTIONS, "/**")
                    .permitAll()
                    .requestMatchers(
                            HttpMethod.POST,
                            "/api/users/signup",
                            "/api/users/login")
                    .permitAll()
                    .requestMatchers(
                            HttpMethod.POST,
                            "/api/otp/generate",
                            "/api/otp/verify")
                    .permitAll()
                    .requestMatchers(
                            HttpMethod.GET,
                            "/api/jobs",
                            "/api/jobs/*")
                    .permitAll()
                    .requestMatchers(
                            HttpMethod.GET,
                            "/api/users")
                    .permitAll()
                    .requestMatchers("/ws/**")
                    .permitAll()
                    .anyRequest()
                    .authenticated())
            .addFilterBefore(
                    jwtAuthFilter,
                    AnonymousAuthenticationFilter.class);

        return http.build();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration config = new CorsConfiguration();

        Arrays.stream(allowedOrigins.split(","))
                .map(String::trim)
                .filter(origin -> !origin.isEmpty())
                .forEach(config::addAllowedOriginPattern);

        config.setAllowedMethods(List.of(
                "GET", "POST", "PUT", "DELETE", "OPTIONS"));
        config.setAllowedHeaders(List.of("*"));
        config.setAllowCredentials(false);
        config.setMaxAge(3600L);

        UrlBasedCorsConfigurationSource source =
                new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", config);

        return source;
    }
}
