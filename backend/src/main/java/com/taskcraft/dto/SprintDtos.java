package com.taskcraft.dto;

import com.taskcraft.entity.Sprint;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.time.Instant;

public class SprintDtos {

    public static class SprintResponse {
        private Long id;
        private String name;
        private String goal;
        private Sprint.SprintStatus status;
        private Instant startDate;
        private Instant endDate;
        private Long projectId;

        public Long getId() {
            return id;
        }

        public void setId(Long id) {
            this.id = id;
        }

        public String getName() {
            return name;
        }

        public void setName(String name) {
            this.name = name;
        }

        public String getGoal() {
            return goal;
        }

        public void setGoal(String goal) {
            this.goal = goal;
        }

        public Sprint.SprintStatus getStatus() {
            return status;
        }

        public void setStatus(Sprint.SprintStatus status) {
            this.status = status;
        }

        public Instant getStartDate() {
            return startDate;
        }

        public void setStartDate(Instant startDate) {
            this.startDate = startDate;
        }

        public Instant getEndDate() {
            return endDate;
        }

        public void setEndDate(Instant endDate) {
            this.endDate = endDate;
        }

        public Long getProjectId() {
            return projectId;
        }

        public void setProjectId(Long projectId) {
            this.projectId = projectId;
        }
    }

    public static class CreateSprintRequest {

        @NotBlank
        @Size(min = 3, max = 150)
        private String name;

        @Size(max = 500)
        private String goal;

        @NotNull
        private Instant startDate;

        @NotNull
        private Instant endDate;

        public String getName() {
            return name;
        }

        public void setName(String name) {
            this.name = name;
        }

        public String getGoal() {
            return goal;
        }

        public void setGoal(String goal) {
            this.goal = goal;
        }

        public Instant getStartDate() {
            return startDate;
        }

        public void setStartDate(Instant startDate) {
            this.startDate = startDate;
        }

        public Instant getEndDate() {
            return endDate;
        }

        public void setEndDate(Instant endDate) {
            this.endDate = endDate;
        }
    }

    public static class UpdateSprintRequest {

        @NotBlank
        @Size(min = 3, max = 150)
        private String name;

        @Size(max = 500)
        private String goal;

        @NotNull
        private Instant startDate;

        @NotNull
        private Instant endDate;

        public String getName() {
            return name;
        }

        public void setName(String name) {
            this.name = name;
        }

        public String getGoal() {
            return goal;
        }

        public void setGoal(String goal) {
            this.goal = goal;
        }

        public Instant getStartDate() {
            return startDate;
        }

        public void setStartDate(Instant startDate) {
            this.startDate = startDate;
        }

        public Instant getEndDate() {
            return endDate;
        }

        public void setEndDate(Instant endDate) {
            this.endDate = endDate;
        }
    }

    public static class UpdateSprintStatusRequest {

        @NotNull
        private Sprint.SprintStatus status;

        public Sprint.SprintStatus getStatus() {
            return status;
        }

        public void setStatus(Sprint.SprintStatus status) {
            this.status = status;
        }
    }

    public static class AssignTasksRequest {

        @NotNull
        private java.util.List<Long> taskIds;

        public java.util.List<Long> getTaskIds() {
            return taskIds;
        }

        public void setTaskIds(java.util.List<Long> taskIds) {
            this.taskIds = taskIds;
        }
    }
}

