package com.taskcraft.controller;

import com.taskcraft.dto.NotificationDtos;
import com.taskcraft.service.NotificationService;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import java.util.List;

@RestController
@RequestMapping("/api/notifications")
public class NotificationController {

    private final NotificationService notificationService;

    public NotificationController(NotificationService notificationService) {
        this.notificationService = notificationService;
    }

    @GetMapping
    public List<NotificationDtos.NotificationResponse> getAll(Authentication authentication) {
        String identifier = authentication.getName();
        return notificationService.getMyNotifications(identifier, false);
    }

    @GetMapping("/unread")
    public List<NotificationDtos.NotificationResponse> getUnread(Authentication authentication) {
        String identifier = authentication.getName();
        return notificationService.getMyNotifications(identifier, true);
    }

    @PostMapping("/{id}/read")
    public void markAsRead(Authentication authentication, @PathVariable Long id) {
        String identifier = authentication.getName();
        notificationService.markAsRead(identifier, id);
    }

    @PostMapping("/read-all")
    public void markAllAsRead(Authentication authentication) {
        String identifier = authentication.getName();
        notificationService.markAllAsRead(identifier);
    }

    @GetMapping("/stream")
    public SseEmitter stream(Authentication authentication) {
        String identifier = authentication.getName();
        return notificationService.subscribe(identifier);
    }
}

