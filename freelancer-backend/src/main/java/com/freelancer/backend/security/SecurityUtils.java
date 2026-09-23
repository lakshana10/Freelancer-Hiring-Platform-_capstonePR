package com.freelancer.backend.security;

import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;

/**
 * Helpers for reading the currently authenticated user inside
 * services and controllers. The authentication name is always
 * the user's email (the JWT "sub" claim).
 */
public final class SecurityUtils {

    private SecurityUtils() {
    }

    public static String currentEmail() {
        Authentication authentication = SecurityContextHolder
                .getContext()
                .getAuthentication();

        if (authentication == null
                || !authentication.isAuthenticated()
                || "anonymousUser".equals(
                        authentication.getPrincipal())) {
            return null;
        }

        return authentication.getName();
    }

    public static boolean hasRole(String role) {
        Authentication authentication = SecurityContextHolder
                .getContext()
                .getAuthentication();

        if (authentication == null) {
            return false;
        }

        String wanted = "ROLE_" + role.toUpperCase();

        for (GrantedAuthority authority
                : authentication.getAuthorities()) {
            if (wanted.equals(authority.getAuthority())) {
                return true;
            }
        }

        return false;
    }

    public static boolean isAdmin() {
        return hasRole("ADMIN");
    }

    public static boolean isSelfOrAdmin(String email) {
        if (email == null) {
            return false;
        }

        if (isAdmin()) {
            return true;
        }

        String current = currentEmail();

        return current != null
                && current.equalsIgnoreCase(email);
    }
}
