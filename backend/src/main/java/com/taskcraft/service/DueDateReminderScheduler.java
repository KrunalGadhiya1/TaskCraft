package com.taskcraft.service;

import com.taskcraft.entity.Notification;
import com.taskcraft.entity.Task;
import com.taskcraft.repository.NotificationRepository;
import com.taskcraft.repository.TaskRepository;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.Duration;
import java.time.Instant;
import java.util.List;

@Component
public class DueDateReminderScheduler {

    private final TaskRepository taskRepository;
    private final NotificationRepository notificationRepository;
    private final NotificationService notificationService;

    public DueDateReminderScheduler(
            TaskRepository taskRepository,
            NotificationRepository notificationRepository,
            NotificationService notificationService
    ) {
        this.taskRepository = taskRepository;
        this.notificationRepository = notificationRepository;
        this.notificationService = notificationService;
    }

    // Runs every 5 minutes. Safe + cheap for FYP scale.
    @Scheduled(fixedDelay = 300_000L)
    @Transactional
    public void scanDueDates() {
        Instant now = Instant.now();
        Instant soon = now.plus(Duration.ofHours(24));

        List<Task.TaskStatus> closed = List.of(Task.TaskStatus.DONE, Task.TaskStatus.CANCELED);

        // Due soon (next 24h)
        for (Task t : taskRepository.findDueSoon(now, soon, closed)) {
            if (t.getAssignee() == null) continue;
            boolean already = notificationRepository.existsByRecipientAndTypeAndTaskIdAndCreatedAtAfter(
                    t.getAssignee(),
                    Notification.NotificationType.TASK_DUE_SOON,
                    t.getId(),
                    now.minus(Duration.ofHours(6)) // avoid spam: max 1 per 6h per task
            );
            if (!already) {
                notificationService.notifyTaskDueSoon(t);
            }
        }

        // Overdue
        for (Task t : taskRepository.findOverdue(now, closed)) {
            if (t.getAssignee() == null) continue;
            boolean already = notificationRepository.existsByRecipientAndTypeAndTaskIdAndCreatedAtAfter(
                    t.getAssignee(),
                    Notification.NotificationType.TASK_OVERDUE,
                    t.getId(),
                    now.minus(Duration.ofHours(24)) // overdue reminder once per day per task
            );
            if (!already) {
                notificationService.notifyTaskOverdue(t);
            }
        }
    }
}

