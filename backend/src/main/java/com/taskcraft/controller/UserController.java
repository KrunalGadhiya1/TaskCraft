package com.taskcraft.controller;

import com.taskcraft.dto.UserDtos;
import com.taskcraft.service.UserService;
import jakarta.validation.Valid;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/users")
public class UserController {

    private final UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
    }

    @GetMapping("/me")
    public UserDtos.UserResponse me(Authentication authentication) {
        String identifier = authentication.getName();
        return userService.getCurrentUserProfile(identifier);
    }

    @PutMapping("/me")
    public UserDtos.UserResponse updateMe(
            Authentication authentication,
            @Valid @RequestBody UserDtos.UpdateProfileRequest request
    ) {
        String identifier = authentication.getName();
        return userService.updateCurrentUserProfile(identifier, request);
    }

    @PutMapping("/me/password")
    public void changePassword(
            Authentication authentication,
            @Valid @RequestBody UserDtos.ChangePasswordRequest request
    ) {
        String identifier = authentication.getName();
        userService.changePassword(identifier, request);
    }

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public List<UserDtos.UserResponse> getAllUsers() {
        return userService.getAllUsers();
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public UserDtos.UserResponse getUserById(@PathVariable Long id) {
        return userService.getUserById(id);
    }

    @PutMapping("/{id}/role")
    @PreAuthorize("hasRole('ADMIN')")
    public UserDtos.UserResponse updateUserRole(
            @PathVariable Long id,
            @Valid @RequestBody UserDtos.UpdateUserRoleRequest request
    ) {
        return userService.updateUserRole(id, request);
    }

    @PutMapping("/{id}/status")
    @PreAuthorize("hasRole('ADMIN')")
    public UserDtos.UserResponse updateUserStatus(
            @PathVariable Long id,
            @RequestBody UserDtos.UpdateUserStatusRequest request
    ) {
        return userService.updateUserStatus(id, request);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public void deleteUser(@PathVariable Long id) {
        userService.deleteUser(id);
    }
}

