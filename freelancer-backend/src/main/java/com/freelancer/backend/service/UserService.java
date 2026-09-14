package com.freelancer.backend.service;

import com.freelancer.backend.model.User;
import com.freelancer.backend.repository.UserRepository;

import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class UserService {

    private final UserRepository userRepository;

    public UserService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }


    // ===============================
    // REGISTER USER
    // ===============================

    public User registerUser(User user) {

        return userRepository.save(user);
    }


    // ===============================
    // LOGIN USER
    // ===============================

    public Optional<User> loginUser(
            String email,
            String password) {

        Optional<User> user =
                userRepository.findByEmail(email);

        if (user.isPresent() &&
                user.get().getPassword().equals(password)) {

            return user;
        }

        return Optional.empty();
    }


    // ===============================
    // GET USER BY EMAIL
    // ===============================

    public Optional<User> getUserByEmail(
            String email) {

        return userRepository.findByEmail(email);
    }


    // ===============================
    // GET ALL USERS
    // ===============================

    public List<User> getAllUsers() {

        return userRepository.findAll();
    }


    // ===============================
    // UPDATE USER PROFILE
    // ===============================

    public User updateUser(User user) {

        return userRepository.save(user);
    }

}