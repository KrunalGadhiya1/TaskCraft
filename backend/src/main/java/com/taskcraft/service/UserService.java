package com.taskcraft.service;

import com.taskcraft.dto.UserDtos;
import com.taskcraft.entity.User;
import com.taskcraft.repository.UserRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public UserService(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Transactional(readOnly = true)
    public UserDtos.UserResponse getCurrentUserProfile(String identifier) {
        User user = findByIdentifier(identifier);
        return toResponse(user);
    }

    @Transactional
    public UserDtos.UserResponse updateCurrentUserProfile(String identifier, UserDtos.UpdateProfileRequest request) {
        User user = findByIdentifier(identifier);

        String newUsername = request.getUsername();
        String newEmail = request.getEmail().toLowerCase();

        if (!user.getUsername().equals(newUsername) && userRepository.existsByUsername(newUsername)) {
            throw new IllegalArgumentException("Username is already taken");
        }
        if (!user.getEmail().equalsIgnoreCase(newEmail) && userRepository.existsByEmail(newEmail)) {
            throw new IllegalArgumentException("Email is already registered");
        }

        user.setUsername(newUsername);
        user.setEmail(newEmail);
        user.setUpdatedAt(Instant.now());

        userRepository.save(user);
        return toResponse(user);
    }

    @Transactional
    public void changePassword(String identifier, UserDtos.ChangePasswordRequest request) {
        User user = findByIdentifier(identifier);

        if (!passwordEncoder.matches(request.getCurrentPassword(), user.getPassword())) {
            throw new IllegalArgumentException("Current password is incorrect");
        }

        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        user.setUpdatedAt(Instant.now());

        userRepository.save(user);
    }

    @Transactional(readOnly = true)
    public List<UserDtos.UserResponse> getAllUsers() {
        return userRepository.findAll()
                .stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public UserDtos.UserResponse getUserById(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("User not found with id: " + id));
        return toResponse(user);
    }

    @Transactional
    public UserDtos.UserResponse updateUserRole(Long id, UserDtos.UpdateUserRoleRequest request) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("User not found with id: " + id));

        user.setRole(request.getRole());
        user.setUpdatedAt(Instant.now());

        userRepository.save(user);
        return toResponse(user);
    }

    @Transactional
    public UserDtos.UserResponse updateUserStatus(Long id, UserDtos.UpdateUserStatusRequest request) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("User not found with id: " + id));

        user.setEnabled(request.isEnabled());
        user.setUpdatedAt(Instant.now());

        userRepository.save(user);
        return toResponse(user);
    }

    @Transactional
    public void deleteUser(Long id) {
        if (!userRepository.existsById(id)) {
            throw new IllegalArgumentException("User not found with id: " + id);
        }
        userRepository.deleteById(id);
    }

    private User findByIdentifier(String identifier) {
        if (identifier.contains("@")) {
            return userRepository.findByEmail(identifier.toLowerCase())
                    .orElseThrow(() -> new IllegalArgumentException("User not found"));
        }
        return userRepository.findByUsername(identifier)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));
    }

    private UserDtos.UserResponse toResponse(User user) {
        UserDtos.UserResponse dto = new UserDtos.UserResponse();
        dto.setId(user.getId());
        dto.setUsername(user.getUsername());
        dto.setEmail(user.getEmail());
        dto.setRole(user.getRole());
        dto.setEnabled(user.isEnabled());
        return dto;
    }
}

