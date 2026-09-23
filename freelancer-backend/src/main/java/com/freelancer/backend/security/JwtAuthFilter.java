package com.freelancer.backend.security;

import io.jsonwebtoken.JwtException;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.security.authentication.AnonymousAuthenticationToken;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.List;

/**
 * Reads the "Authorization: Bearer <jwt>" header on every request.
 *
 * - No header (or a non-Bearer header): the request continues as
 *   anonymous. Public endpoints still work; protected endpoints
 *   are rejected with 401 by the entry point.
 * - Invalid or expired token: treated as anonymous, never as an
 *   error here. This keeps public pages usable when a stored
 *   token has expired.
 */
@Component
public class JwtAuthFilter extends OncePerRequestFilter {

    private final JwtService jwtService;

    public JwtAuthFilter(JwtService jwtService) {
        this.jwtService = jwtService;
    }

    @Override
    protected void doFilterInternal(
            HttpServletRequest request,
            HttpServletResponse response,
            FilterChain filterChain)
            throws ServletException, IOException {

        String header =
                request.getHeader("Authorization");

        if (header != null && header.startsWith("Bearer ")) {
            String token = header.substring(7).trim();

            if (!token.isEmpty() && !hasRealAuthentication()) {
                try {
                    JwtService.ParsedToken parsed =
                            jwtService.parse(token);

                    UsernamePasswordAuthenticationToken authentication =
                            new UsernamePasswordAuthenticationToken(
                                    parsed.email(),
                                    null,
                                    List.of(new SimpleGrantedAuthority(
                                            "ROLE_" + parsed.role())));

                    authentication.setDetails(
                            new WebAuthenticationDetailsSource()
                                    .buildDetails(request));

                    SecurityContextHolder.getContext()
                            .setAuthentication(authentication);

                } catch (JwtException | IllegalArgumentException e) {
                    SecurityContextHolder.clearContext();
                }
            }
        }

        filterChain.doFilter(request, response);
    }

    /**
     * True when the context already holds a real (non-anonymous)
     * authentication. Anonymous tokens must not block JWT login:
     * AnonymousAuthenticationFilter may have run before this filter.
     */
    private boolean hasRealAuthentication() {
        Authentication existing = SecurityContextHolder
                .getContext()
                .getAuthentication();

        return existing != null
                && existing.isAuthenticated()
                && !(existing instanceof AnonymousAuthenticationToken);
    }
}
