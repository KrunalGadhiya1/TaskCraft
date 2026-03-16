package com.taskcraft.repository;

import com.taskcraft.entity.Notification;
import com.taskcraft.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.Instant;
import java.util.List;

public interface NotificationRepository extends JpaRepository<Notification, Long> {

    List<Notification> findByRecipientOrderByCreatedAtDesc(User recipient);

    List<Notification> findByRecipientAndReadFlagFalseOrderByCreatedAtDesc(User recipient);

    boolean existsByRecipientAndTypeAndTaskIdAndCreatedAtAfter(
            User recipient,
            Notification.NotificationType type,
            Long taskId,
            Instant createdAtAfter
    );
}

