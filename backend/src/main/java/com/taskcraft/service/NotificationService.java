package com.taskcraft.service;

import com.taskcraft.dto.NotificationDtos;
import com.taskcraft.entity.Notification;
import com.taskcraft.entity.Task;
import com.taskcraft.entity.User;
import com.taskcraft.exception.ForbiddenException;
import com.taskcraft.repository.NotificationRepository;
import com.taskcraft.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import java.io.IOException;
import java.time.Instant;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.stream.Collectors;

@Service
public class NotificationService {

    private final NotificationRepository notificationRepository;
    private final UserRepository userRepository;

    private final Map<Long, SseEmitter> emitters = new ConcurrentHashMap<>();

    public NotificationService(NotificationRepository notificationRepository, UserRepository userRepository) {
        this.notificationRepository = notificationRepository;
        this.userRepository = userRepository;
    }

    @Transactional
    public void notifyTaskAssigned(Task task, User assignee) {
        if (assignee == null || !assignee.isEnabled()) {
            return;
        }
        Notification notification = new Notification();
        notification.setRecipient(assignee);
        notification.setType(Notification.NotificationType.TASK_ASSIGNED);
        notification.setTitle("Task assigned: " + task.getTitle());
        notification.setMessage("You have been assigned to task \"" + task.getTitle() + "\".");
        notification.setProjectId(task.getProject().getId());
        notification.setTaskId(task.getId());
        notification.setReadFlag(false);
        notification.setCreatedAt(Instant.now());

        notificationRepository.save(notification);
        sendToClient(assignee.getId(), toResponse(notification));
    }

    @Transactional
    public void notifyTaskStatusChanged(Task task, User actor) {
        User assignee = task.getAssignee();
        if (assignee == null || assignee.getId().equals(actor.getId())) {
            return;
        }

        Notification notification = new Notification();
        notification.setRecipient(assignee);
        notification.setType(Notification.NotificationType.TASK_STATUS_CHANGED);
        notification.setTitle("Task status updated: " + task.getTitle());
        notification.setMessage("Status changed to " + task.getStatus());
        notification.setProjectId(task.getProject().getId());
        notification.setTaskId(task.getId());
        notification.setReadFlag(false);
        notification.setCreatedAt(Instant.now());

        notificationRepository.save(notification);
        sendToClient(assignee.getId(), toResponse(notification));
    }

    @Transactional
    public void notifyTaskCommented(Task task, User author) {
        User assignee = task.getAssignee();
        if (assignee == null || assignee.getId().equals(author.getId())) {
            return;
        }

        Notification notification = new Notification();
        notification.setRecipient(assignee);
        notification.setType(Notification.NotificationType.TASK_COMMENTED);
        notification.setTitle("New comment on: " + task.getTitle());
        notification.setMessage("A new comment was added to this task.");
        notification.setProjectId(task.getProject().getId());
        notification.setTaskId(task.getId());
        notification.setReadFlag(false);
        notification.setCreatedAt(Instant.now());

        notificationRepository.save(notification);
        sendToClient(assignee.getId(), toResponse(notification));
    }

    @Transactional
    public void notifyTaskAttachmentAdded(Task task, User uploader) {
        User assignee = task.getAssignee();
        if (assignee == null || assignee.getId().equals(uploader.getId())) {
            return;
        }

        Notification notification = new Notification();
        notification.setRecipient(assignee);
        notification.setType(Notification.NotificationType.TASK_ATTACHMENT_ADDED);
        notification.setTitle("Attachment added: " + task.getTitle());
        notification.setMessage("A new attachment was added to this task.");
        notification.setProjectId(task.getProject().getId());
        notification.setTaskId(task.getId());
        notification.setReadFlag(false);
        notification.setCreatedAt(Instant.now());

        notificationRepository.save(notification);
        sendToClient(assignee.getId(), toResponse(notification));
    }

    @Transactional
    public void notifyTaskDueSoon(Task task) {
        User assignee = task.getAssignee();
        if (assignee == null || !assignee.isEnabled() || task.getDueDate() == null) {
            return;
        }
        Notification notification = new Notification();
        notification.setRecipient(assignee);
        notification.setType(Notification.NotificationType.TASK_DUE_SOON);
        notification.setTitle("Due soon: " + task.getTitle());
        notification.setMessage("Task is due at " + task.getDueDate());
        notification.setProjectId(task.getProject().getId());
        notification.setTaskId(task.getId());
        notification.setReadFlag(false);
        notification.setCreatedAt(Instant.now());

        notificationRepository.save(notification);
        sendToClient(assignee.getId(), toResponse(notification));
    }

    @Transactional
    public void notifyTaskOverdue(Task task) {
        User assignee = task.getAssignee();
        if (assignee == null || !assignee.isEnabled() || task.getDueDate() == null) {
            return;
        }
        Notification notification = new Notification();
        notification.setRecipient(assignee);
        notification.setType(Notification.NotificationType.TASK_OVERDUE);
        notification.setTitle("Overdue: " + task.getTitle());
        notification.setMessage("Task was due at " + task.getDueDate());
        notification.setProjectId(task.getProject().getId());
        notification.setTaskId(task.getId());
        notification.setReadFlag(false);
        notification.setCreatedAt(Instant.now());

        notificationRepository.save(notification);
        sendToClient(assignee.getId(), toResponse(notification));
    }

    @Transactional(readOnly = true)
    public List<NotificationDtos.NotificationResponse> getMyNotifications(String identifier, boolean unreadOnly) {
        User user = findByIdentifier(identifier);
        List<Notification> notifications = unreadOnly
                ? notificationRepository.findByRecipientAndReadFlagFalseOrderByCreatedAtDesc(user)
                : notificationRepository.findByRecipientOrderByCreatedAtDesc(user);
        return notifications.stream().map(this::toResponse).collect(Collectors.toList());
    }

    @Transactional
    public void markAsRead(String identifier, Long notificationId) {
        User user = findByIdentifier(identifier);
        Notification notification = notificationRepository.findById(notificationId)
                .orElseThrow(() -> new IllegalArgumentException("Notification not found"));
        if (!notification.getRecipient().getId().equals(user.getId())) {
            throw new ForbiddenException("You cannot modify this notification");
        }
        notification.setReadFlag(true);
        notificationRepository.save(notification);
    }

    @Transactional
    public void markAllAsRead(String identifier) {
        User user = findByIdentifier(identifier);
        List<Notification> notifications = notificationRepository
                .findByRecipientAndReadFlagFalseOrderByCreatedAtDesc(user);
        for (Notification n : notifications) {
            n.setReadFlag(true);
        }
        notificationRepository.saveAll(notifications);
    }

    public SseEmitter subscribe(String identifier) {
        User user = findByIdentifier(identifier);
        // Keep the connection open for a long time; clients can reconnect when it expires.
        SseEmitter emitter = new SseEmitter(60L * 60_000L); // 60 minutes
        emitters.put(user.getId(), emitter);

        emitter.onCompletion(() -> emitters.remove(user.getId()));
        emitter.onTimeout(() -> emitters.remove(user.getId()));
        emitter.onError(e -> emitters.remove(user.getId()));

        try {
            emitter.send(SseEmitter.event().name("INIT").data("connected"));
        } catch (IOException ignored) {
        }

        return emitter;
    }

    private void sendToClient(Long userId, NotificationDtos.NotificationResponse notification) {
        SseEmitter emitter = emitters.get(userId);
        if (emitter == null) {
            return;
        }
        try {
            emitter.send(SseEmitter.event().name("NOTIFICATION").data(notification));
        } catch (IOException e) {
            emitters.remove(userId);
        }
    }

    private User findByIdentifier(String identifier) {
        if (identifier.contains("@")) {
            return userRepository.findByEmail(identifier.toLowerCase())
                    .orElseThrow(() -> new IllegalArgumentException("User not found"));
        }
        return userRepository.findByUsername(identifier)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));
    }

    private NotificationDtos.NotificationResponse toResponse(Notification notification) {
        NotificationDtos.NotificationResponse dto = new NotificationDtos.NotificationResponse();
        dto.setId(notification.getId());
        dto.setType(notification.getType());
        dto.setTitle(notification.getTitle());
        dto.setMessage(notification.getMessage());
        dto.setProjectId(notification.getProjectId());
        dto.setTaskId(notification.getTaskId());
        dto.setReadFlag(notification.isReadFlag());
        dto.setCreatedAt(notification.getCreatedAt());
        return dto;
    }
}

