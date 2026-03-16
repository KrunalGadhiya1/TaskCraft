package com.taskcraft.dto;

import com.taskcraft.entity.ActivityLog;

import java.time.Instant;

public class ActivityDtos {

    public static class ActivityResponse {
        private Long id;
        private Long actorId;
        private String actorUsername;
        private ActivityLog.ActivityType type;
        private Long workspaceId;
        private Long projectId;
        private Long sprintId;
        private Long taskId;
        private String message;
        private Instant createdAt;

        public Long getId() {
            return id;
        }

        public void setId(Long id) {
            this.id = id;
        }

        public Long getActorId() {
            return actorId;
        }

        public void setActorId(Long actorId) {
            this.actorId = actorId;
        }

        public String getActorUsername() {
            return actorUsername;
        }

        public void setActorUsername(String actorUsername) {
            this.actorUsername = actorUsername;
        }

        public ActivityLog.ActivityType getType() {
            return type;
        }

        public void setType(ActivityLog.ActivityType type) {
            this.type = type;
        }

        public Long getWorkspaceId() {
            return workspaceId;
        }

        public void setWorkspaceId(Long workspaceId) {
            this.workspaceId = workspaceId;
        }

        public Long getProjectId() {
            return projectId;
        }

        public void setProjectId(Long projectId) {
            this.projectId = projectId;
        }

        public Long getSprintId() {
            return sprintId;
        }

        public void setSprintId(Long sprintId) {
            this.sprintId = sprintId;
        }

        public Long getTaskId() {
            return taskId;
        }

        public void setTaskId(Long taskId) {
            this.taskId = taskId;
        }

        public String getMessage() {
            return message;
        }

        public void setMessage(String message) {
            this.message = message;
        }

        public Instant getCreatedAt() {
            return createdAt;
        }

        public void setCreatedAt(Instant createdAt) {
            this.createdAt = createdAt;
        }
    }
}

