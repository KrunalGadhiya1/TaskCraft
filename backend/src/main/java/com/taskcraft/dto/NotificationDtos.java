package com.taskcraft.dto;

import com.taskcraft.entity.Notification;

import java.time.Instant;

public class NotificationDtos {

    public static class NotificationResponse {
        private Long id;
        private Notification.NotificationType type;
        private String title;
        private String message;
        private Long projectId;
        private Long taskId;
        private boolean readFlag;
        private Instant createdAt;

        public Long getId() {
            return id;
        }

        public void setId(Long id) {
            this.id = id;
        }

        public Notification.NotificationType getType() {
            return type;
        }

        public void setType(Notification.NotificationType type) {
            this.type = type;
        }

        public String getTitle() {
            return title;
        }

        public void setTitle(String title) {
            this.title = title;
        }

        public String getMessage() {
            return message;
        }

        public void setMessage(String message) {
            this.message = message;
        }

        public Long getProjectId() {
            return projectId;
        }

        public void setProjectId(Long projectId) {
            this.projectId = projectId;
        }

        public Long getTaskId() {
            return taskId;
        }

        public void setTaskId(Long taskId) {
            this.taskId = taskId;
        }

        public boolean isReadFlag() {
            return readFlag;
        }

        public void setReadFlag(boolean readFlag) {
            this.readFlag = readFlag;
        }

        public Instant getCreatedAt() {
            return createdAt;
        }

        public void setCreatedAt(Instant createdAt) {
            this.createdAt = createdAt;
        }
    }
}

