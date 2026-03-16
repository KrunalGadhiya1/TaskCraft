package com.taskcraft.dto;

import com.taskcraft.entity.Task;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.time.Instant;

public class TaskDtos {

    public static class TaskResponse {
        private Long id;
        private String issueKey;
        private Integer issueSeq;
        private String title;
        private String description;
        private Task.TaskType type;
        private Task.TaskStatus status;
        private Task.TaskPriority priority;
        private Integer storyPoints;
        private Instant dueDate;
        private Long projectId;
        private Long sprintId;
        private Long reporterId;
        private Long assigneeId;

        public Long getId() {
            return id;
        }

        public void setId(Long id) {
            this.id = id;
        }

        public String getIssueKey() {
            return issueKey;
        }

        public void setIssueKey(String issueKey) {
            this.issueKey = issueKey;
        }

        public Integer getIssueSeq() {
            return issueSeq;
        }

        public void setIssueSeq(Integer issueSeq) {
            this.issueSeq = issueSeq;
        }

        public String getTitle() {
            return title;
        }

        public void setTitle(String title) {
            this.title = title;
        }

        public String getDescription() {
            return description;
        }

        public void setDescription(String description) {
            this.description = description;
        }

        public Task.TaskType getType() {
            return type;
        }

        public void setType(Task.TaskType type) {
            this.type = type;
        }

        public Task.TaskStatus getStatus() {
            return status;
        }

        public void setStatus(Task.TaskStatus status) {
            this.status = status;
        }

        public Task.TaskPriority getPriority() {
            return priority;
        }

        public void setPriority(Task.TaskPriority priority) {
            this.priority = priority;
        }

        public Integer getStoryPoints() {
            return storyPoints;
        }

        public void setStoryPoints(Integer storyPoints) {
            this.storyPoints = storyPoints;
        }

        public Instant getDueDate() {
            return dueDate;
        }

        public void setDueDate(Instant dueDate) {
            this.dueDate = dueDate;
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

        public Long getReporterId() {
            return reporterId;
        }

        public void setReporterId(Long reporterId) {
            this.reporterId = reporterId;
        }

        public Long getAssigneeId() {
            return assigneeId;
        }

        public void setAssigneeId(Long assigneeId) {
            this.assigneeId = assigneeId;
        }
    }

    public static class CreateTaskRequest {

        @NotBlank
        @Size(min = 3, max = 200)
        private String title;

        @Size(max = 2000)
        private String description;

        @NotNull
        private Task.TaskType type;

        @NotNull
        private Task.TaskPriority priority;

        private Integer storyPoints;

        private Instant dueDate;

        private String assigneeIdentifier;

        public String getTitle() {
            return title;
        }

        public void setTitle(String title) {
            this.title = title;
        }

        public String getDescription() {
            return description;
        }

        public void setDescription(String description) {
            this.description = description;
        }

        public Task.TaskType getType() {
            return type;
        }

        public void setType(Task.TaskType type) {
            this.type = type;
        }

        public Task.TaskPriority getPriority() {
            return priority;
        }

        public void setPriority(Task.TaskPriority priority) {
            this.priority = priority;
        }

        public Integer getStoryPoints() {
            return storyPoints;
        }

        public void setStoryPoints(Integer storyPoints) {
            this.storyPoints = storyPoints;
        }

        public Instant getDueDate() {
            return dueDate;
        }

        public void setDueDate(Instant dueDate) {
            this.dueDate = dueDate;
        }

        public String getAssigneeIdentifier() {
            return assigneeIdentifier;
        }

        public void setAssigneeIdentifier(String assigneeIdentifier) {
            this.assigneeIdentifier = assigneeIdentifier;
        }
    }

    public static class UpdateTaskRequest {

        @NotBlank
        @Size(min = 3, max = 200)
        private String title;

        @Size(max = 2000)
        private String description;

        @NotNull
        private Task.TaskType type;

        @NotNull
        private Task.TaskPriority priority;

        private Integer storyPoints;

        private Instant dueDate;

        public String getTitle() {
            return title;
        }

        public void setTitle(String title) {
            this.title = title;
        }

        public String getDescription() {
            return description;
        }

        public void setDescription(String description) {
            this.description = description;
        }

        public Task.TaskType getType() {
            return type;
        }

        public void setType(Task.TaskType type) {
            this.type = type;
        }

        public Task.TaskPriority getPriority() {
            return priority;
        }

        public void setPriority(Task.TaskPriority priority) {
            this.priority = priority;
        }

        public Integer getStoryPoints() {
            return storyPoints;
        }

        public void setStoryPoints(Integer storyPoints) {
            this.storyPoints = storyPoints;
        }

        public Instant getDueDate() {
            return dueDate;
        }

        public void setDueDate(Instant dueDate) {
            this.dueDate = dueDate;
        }
    }

    public static class UpdateTaskStatusRequest {

        @NotNull
        private Task.TaskStatus status;

        public Task.TaskStatus getStatus() {
            return status;
        }

        public void setStatus(Task.TaskStatus status) {
            this.status = status;
        }
    }

    public static class UpdateTaskAssigneeRequest {

        private String assigneeIdentifier;

        public String getAssigneeIdentifier() {
            return assigneeIdentifier;
        }

        public void setAssigneeIdentifier(String assigneeIdentifier) {
            this.assigneeIdentifier = assigneeIdentifier;
        }
    }
}

