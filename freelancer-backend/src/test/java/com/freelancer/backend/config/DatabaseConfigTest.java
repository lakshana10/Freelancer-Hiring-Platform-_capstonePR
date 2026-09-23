package com.freelancer.backend.config;

import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.assertThat;

class DatabaseConfigTest {

    @Test
    void keepsJdbcUrlsUntouched() {
        assertThat(DatabaseConfig.normalizeJdbcUrl(
                "jdbc:postgresql://localhost:5432/freelancer"))
                .isEqualTo(
                        "jdbc:postgresql://localhost:5432/freelancer");
    }

    @Test
    void prefixesPlatformPostgresUrls() {
        assertThat(DatabaseConfig.normalizeJdbcUrl(
                "postgresql://postgres:secret@db:5432/railway"))
                .isEqualTo(
                        "jdbc:postgresql://postgres:secret@db:5432/railway");
    }

    @Test
    void rewritesHerokuStyleUrls() {
        assertThat(DatabaseConfig.normalizeJdbcUrl(
                "postgres://u:p@host:5432/db"))
                .isEqualTo("jdbc:postgresql://u:p@host:5432/db");
    }

    @Test
    void extractsEmbeddedCredentials() {
        DatabaseConfig.Credentials credentials =
                DatabaseConfig.extractCredentials(
                        "jdbc:postgresql://bob:s3cret@host:5432/db");

        assertThat(credentials.username()).isEqualTo("bob");
        assertThat(credentials.password()).isEqualTo("s3cret");
    }

    @Test
    void noCredentialsWhenAbsent() {
        DatabaseConfig.Credentials credentials =
                DatabaseConfig.extractCredentials(
                        "jdbc:postgresql://localhost:5432/freelancer");

        assertThat(credentials.username()).isNull();
        assertThat(credentials.password()).isNull();
    }

    @Test
    void stripsUserInfoKeepingHostAndDatabase() {
        assertThat(DatabaseConfig.stripUserInfo(
                "jdbc:postgresql://bob:s3cret@host:5432/db"))
                .isEqualTo("jdbc:postgresql://host:5432/db");
    }

    @Test
    void stripLeavesPlainUrlsUntouched() {
        assertThat(DatabaseConfig.stripUserInfo(
                "jdbc:postgresql://localhost:5432/freelancer"))
                .isEqualTo(
                        "jdbc:postgresql://localhost:5432/freelancer");
    }

    @Test
    void fullPipelineHandlesRailwayStyleUrl() {
        String raw =
                "postgresql://bob:s3cret@host:5432/railway";

        String jdbcUrl = DatabaseConfig.stripUserInfo(
                DatabaseConfig.normalizeJdbcUrl(raw));

        assertThat(jdbcUrl)
                .isEqualTo("jdbc:postgresql://host:5432/railway");
        assertThat(DatabaseConfig.extractCredentials(
                DatabaseConfig.normalizeJdbcUrl(raw)).username())
                .isEqualTo("bob");
    }
}
