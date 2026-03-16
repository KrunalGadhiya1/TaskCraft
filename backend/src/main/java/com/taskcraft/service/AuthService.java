package com.taskcraft.service;

import com.taskcraft.dto.AuthDtos;
import com.taskcraft.entity.User;
import com.taskcraft.repository.UserRepository;
import com.taskcraft.security.JwtTokenProvider;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final JwtTokenProvider tokenProvider;
    private final MailService mailService;

    public AuthService(
            UserRepository userRepository,
            PasswordEncoder passwordEncoder,
            AuthenticationManager authenticationManager,
            JwtTokenProvider tokenProvider,
            MailService mailService
    ) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.authenticationManager = authenticationManager;
        this.tokenProvider = tokenProvider;
        this.mailService = mailService;
    }

    @Transactional
    public void register(AuthDtos.RegisterRequest request) {
        String username = request.getUsername();
        String email = request.getEmail() != null ? request.getEmail().toLowerCase() : null;

        if (userRepository.existsByUsername(username)) {
            throw new IllegalArgumentException("Username is already taken");
        }
        if (userRepository.existsByEmail(email)) {
            throw new IllegalArgumentException("Email is already registered");
        }

        Instant now = Instant.now();

        String encodedPassword = passwordEncoder.encode(request.getPassword());

        User user = new User();
        user.setUsername(username);
        user.setEmail(email);
        user.setPassword(encodedPassword);
        user.setRole("ROLE_USER");
        user.setEnabled(true);
        user.setCreatedAt(now);
        user.setUpdatedAt(now);

        userRepository.save(user);

        if (user.getEmail() != null) {
            mailService.sendMail(
                    user.getEmail(),
                    "Welcome to TaskCraft",
                    "Hi " + user.getUsername() + ",\n\nYour TaskCraft account was created successfully.\n\nRegards,\nTaskCraft"
            );
        }
    }

    public String login(AuthDtos.LoginRequest request) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        request.getIdentifier(),
                        request.getPassword()
                )
        );
        String token = tokenProvider.generateToken(authentication);

        Object principal = authentication.getPrincipal();
        String identifier = request.getIdentifier();
        if (identifier != null && identifier.contains("@")) {
            // if login with email, we can send notification to that email
            mailService.sendMail(
                    identifier.toLowerCase(),
                    "TaskCraft Login Notification",
                    "A login to your TaskCraft account just occurred."
            );
        }

        return token;
    }

    @Transactional
    public String initiateForgotPassword(AuthDtos.ForgotPasswordRequest request) {
        String email = request.getEmail().toLowerCase();
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("No user registered with this email address"));

        String token = com.taskcraft.utils.SecureTokenGenerator.generateToken(32);
        Instant expiry = Instant.now().plusSeconds(15 * 60);

        user.setResetToken(token);
        user.setResetTokenExpiry(expiry);
        userRepository.save(user);

        mailService.sendMail(
                user.getEmail(),
                "TaskCraft Password Reset Request",
                "We received a request to reset your TaskCraft password.\n\n" +
                        "Use this token in the app to reset your password:\n\n" +
                        token + "\n\nIf you didn't request this, you can ignore this email."
        );

        // Also return token to the client for FYP/testing convenience.
        return token;
    }

    @Transactional
    public void resetPassword(AuthDtos.ResetPasswordRequest request) {
        String token = request.getToken();
        User user = userRepository.findByResetToken(token)
                .orElseThrow(() -> new IllegalArgumentException("Invalid or expired reset token"));

        Instant now = Instant.now();
        if (user.getResetTokenExpiry() == null || now.isAfter(user.getResetTokenExpiry())) {
            throw new IllegalArgumentException("Reset token has expired");
        }

        String encodedPassword = passwordEncoder.encode(request.getNewPassword());
        user.setPassword(encodedPassword);
        user.setResetToken(null);
        user.setResetTokenExpiry(null);
        user.setUpdatedAt(now);

        userRepository.save(user);
    }
}

