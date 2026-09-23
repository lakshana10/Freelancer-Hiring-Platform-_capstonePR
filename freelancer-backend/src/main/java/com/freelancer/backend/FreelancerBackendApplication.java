package com.freelancer.backend;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

import java.util.TimeZone;

@SpringBootApplication
public class FreelancerBackendApplication {

	public static void main(String[] args) {
		// Pin the JVM timezone before anything connects. pgJDBC sends
		// the JVM default as the "TimeZone" startup parameter, and
		// legacy aliases like "Asia/Calcutta" (reported by some Windows
		// JREs) are rejected by newer PostgreSQL servers. UTC is used
		// for all server-side timestamps; the UI formats for display.
		TimeZone.setDefault(TimeZone.getTimeZone("UTC"));
		SpringApplication.run(FreelancerBackendApplication.class, args);
	}

}
