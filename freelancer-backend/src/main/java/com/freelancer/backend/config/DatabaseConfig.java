package com.freelancer.backend.config;

import com.zaxxer.hikari.HikariConfig;
import com.zaxxer.hikari.HikariDataSource;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import javax.sql.DataSource;

@Configuration
public class DatabaseConfig {

    private static final Logger log =
            LoggerFactory.getLogger(DatabaseConfig.class);

    @Bean
    public DataSource dataSource(
            @Value("${spring.datasource.url}") String url,
            @Value("${spring.datasource.username:}") String username,
            @Value("${spring.datasource.password:}") String password) {

        String jdbcUrl = normalizeJdbcUrl(url);

        log.info("Connecting to database using JDBC URL: {}",
                hideCredentials(jdbcUrl));

        HikariConfig config = new HikariConfig();

        config.setJdbcUrl(jdbcUrl);

        if (username != null && !username.isBlank()) {
            config.setUsername(username);
        }

        if (password != null && !password.isBlank()) {
            config.setPassword(password);
        }

        return new HikariDataSource(config);
    }

    /**
     * Converts Railway/Render/Heroku PostgreSQL URL
     * into a JDBC PostgreSQL URL.
     *
     * postgresql://host:5432/db
     *        ↓
     * jdbc:postgresql://host:5432/db
     */
    static String normalizeJdbcUrl(String url) {

        if (url == null || url.isBlank()) {
            throw new IllegalArgumentException(
                    "Database URL is empty or not configured."
            );
        }

        String trimmed = url.trim();

        if (trimmed.startsWith("jdbc:postgresql://")) {
            return trimmed;
        }

        if (trimmed.startsWith("postgresql://")) {
            return "jdbc:" + trimmed;
        }

        if (trimmed.startsWith("postgres://")) {
            return "jdbc:postgresql://" +
                    trimmed.substring("postgres://".length());
        }

        throw new IllegalArgumentException(
                "Unsupported PostgreSQL URL: " + trimmed
        );
    }

    private static String hideCredentials(String url) {

        if (url == null) {
            return null;
        }

        return url.replaceFirst(
                "(jdbc:postgresql://[^:/]+:?[0-9]*\\/[^?]+).*",
                "$1"
        );
    }
}