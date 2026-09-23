package com.freelancer.backend.repository;

import com.freelancer.backend.model.User;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.data.jpa.test.autoconfigure.DataJpaTest;

import static org.assertj.core.api.Assertions.assertThat;

@DataJpaTest
class UserRepositoryTest {

    @Autowired
    private UserRepository userRepository;

    @Test
    void findByEmailReturnsSavedUser() {
        User user = new User();
        user.setName("Test Freelancer");
        user.setEmail("Dev@Test.com");
        user.setPassword("hashed");
        user.setRole("FREELANCER");
        userRepository.save(user);

        assertThat(userRepository.findByEmail("Dev@Test.com"))
                .isPresent();
        assertThat(userRepository.findByEmail("missing@test.com"))
                .isEmpty();
    }

    @Test
    void findByEmailIgnoreCaseMatchesAnyCasing() {
        User user = new User();
        user.setName("Test Client");
        user.setEmail("Client@Test.com");
        user.setPassword("hashed");
        user.setRole("CLIENT");
        userRepository.save(user);

        assertThat(userRepository
                .findByEmailIgnoreCase("client@test.com"))
                .isPresent();
        assertThat(userRepository
                .findByEmailIgnoreCase("CLIENT@TEST.COM"))
                .isPresent();
    }
}
