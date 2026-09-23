package com.freelancer.backend.config;

import com.zaxxer.hikari.HikariConfig;
import com.zaxxer.hikari.HikariDataSource;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import javax.sql.DataSource;
import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.SQLException;
import java.sql.Statement;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

/**
 * Creates the Hikari DataSource and makes sure the database in
 * the JDBC URL exists first (createDatabaseIfNotExist behavior).
 * Connects to the "postgres" maintenance database and runs
 * CREATE DATABASE when needed. If that fails (for example a
 * wrong password, or a managed host without CREATEDB), startup
 * continues and JPA reports the real connection error.
 *
 * DATABASE_URL accepts JDBC ("jdbc:postgresql://..."), platform
 * ("postgresql://..." / "postgres://...", as injected by Railway
 * and similar hosts), and H2 ("jdbc:h2:...") styles for tests.
 * Embedded "user:password@" credentials are extracted (pgJDBC
 * cannot parse them from the host section) and win over the
 * separate username/password values when both are present.
 */
@Configuration
public class DatabaseConfig {

    private static final Logger log =
            LoggerFactory.getLogger(DatabaseConfig.class);

    private static final Pattern URL_PATTERN = Pattern.compile(
            "^jdbc:postgresql://(?:[^@]+@)?([^/]+)/([^?]+)");

    private static final Pattern USERINFO_PATTERN = Pattern.compile(
            "^jdbc:postgresql://([^@/:]+)(?::([^@]*))?@");

    @Bean
    public DataSource dataSource(
            @Value("${spring.datasource.url}") String url,
            @Value("${spring.datasource.username:}") String username,
            @Value("${spring.datasource.password:}") String password) {

        String jdbcUrl = normalizeJdbcUrl(url);

        Credentials credentials = extractCredentials(jdbcUrl);

        jdbcUrl = stripUserInfo(jdbcUrl);

        String effectiveUser =
                credentials.username() != null
                        ? credentials.username() : username;
        String effectivePassword =
                credentials.password() != null
                        ? credentials.password() : password;

        log.info("Connecting to database using JDBC URL: {}",
                hideCredentials(jdbcUrl));

        ensureDatabaseExists(
                jdbcUrl, effectiveUser, effectivePassword);

        HikariConfig config = new HikariConfig();
        config.setJdbcUrl(jdbcUrl);

        if (effectiveUser != null && !effectiveUser.isBlank()) {
            config.setUsername(effectiveUser);
        }

        if (effectivePassword != null && !effectivePassword.isBlank()) {
            config.setPassword(effectivePassword);
        }

        return new HikariDataSource(config);
    }

    /**
     * Turns platform-style URLs into JDBC URLs:
     * "postgresql://..." -> "jdbc:postgresql://...",
     * "postgres://..." -> "jdbc:postgresql://...".
     * Anything already starting with "jdbc:" (Postgres, H2, ...)
     * passes through untouched so tests keep working.
     */
    static String normalizeJdbcUrl(String url) {
        if (url == null || url.isBlank()) {
            throw new IllegalArgumentException(
                    "Database URL is empty or not configured.");
        }

        String trimmed = url.trim();

        if (trimmed.startsWith("jdbc:")) {
            return trimmed;
        }

        if (trimmed.startsWith("postgresql://")) {
            return "jdbc:" + trimmed;
        }

        if (trimmed.startsWith("postgres://")) {
            return "jdbc:postgresql://"
                    + trimmed.substring("postgres://".length());
        }

        throw new IllegalArgumentException(
                "Unsupported database URL: " + trimmed);
    }

    /**
     * Pulls "user:password@" out of a JDBC URL so one DATABASE_URL
     * env var is enough on hosting platforms. Empty when the URL
     * carries no credentials.
     */
    static Credentials extractCredentials(String jdbcUrl) {
        if (jdbcUrl == null) {
            return new Credentials(null, null);
        }

        Matcher matcher =
                USERINFO_PATTERN.matcher(jdbcUrl.trim());

        if (!matcher.find()) {
            return new Credentials(null, null);
        }

        return new Credentials(matcher.group(1), matcher.group(2));
    }

    /**
     * Removes "user:password@" from a JDBC URL. pgJDBC treats the
     * whole host section as the hostname, so credentials travel via
     * Hikari's username/password instead. Extract them first with
     * {@link #extractCredentials(String)}.
     */
    static String stripUserInfo(String jdbcUrl) {
        if (jdbcUrl == null) {
            return null;
        }

        return jdbcUrl.replaceFirst(
                "^(jdbc:postgresql://)[^@/]+@", "$1");
    }

    /**
     * Mask credentials before logging a URL.
     */
    static String hideCredentials(String url) {
        if (url == null) {
            return null;
        }

        return url.replaceFirst(
                "^(jdbc:[^:]+://)[^@/]+@", "$1***@");
    }

    record Credentials(String username, String password) {
    }

    private void ensureDatabaseExists(
            String url, String username, String password) {

        Matcher matcher = URL_PATTERN.matcher(url.trim());

        if (!matcher.find()) {
            return;
        }

        String hostPart = matcher.group(1);
        String dbName = matcher.group(2).replace("\"", "");

        String adminUrl =
                "jdbc:postgresql://" + hostPart + "/postgres";

        try (Connection connection = DriverManager.getConnection(
                     adminUrl, username, password);
             Statement statement = connection.createStatement()) {

            statement.execute(
                    "CREATE DATABASE \"" + dbName + "\"");
            log.info("Created database '{}'.", dbName);

        } catch (SQLException e) {
            if ("42P04".equals(e.getSQLState())) {
                log.info("Database '{}' already exists.", dbName);
            } else {
                log.warn("Could not ensure database '{}' exists: {}",
                        dbName, e.getMessage());
            }
        }
    }
}
