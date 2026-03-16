package com.taskcraft.dto;

import java.util.Map;

public class ReportDtos {

    public static class ProjectReportResponse {
        private Long workspaceId;
        private Long projectId;
        private Map<String, Long> tasksByStatus;
        private Map<String, Long> tasksByPriority;
        private Long totalTasks;
        private Long doneTasks;

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

        public Map<String, Long> getTasksByStatus() {
            return tasksByStatus;
        }

        public void setTasksByStatus(Map<String, Long> tasksByStatus) {
            this.tasksByStatus = tasksByStatus;
        }

        public Map<String, Long> getTasksByPriority() {
            return tasksByPriority;
        }

        public void setTasksByPriority(Map<String, Long> tasksByPriority) {
            this.tasksByPriority = tasksByPriority;
        }

        public Long getTotalTasks() {
            return totalTasks;
        }

        public void setTotalTasks(Long totalTasks) {
            this.totalTasks = totalTasks;
        }

        public Long getDoneTasks() {
            return doneTasks;
        }

        public void setDoneTasks(Long doneTasks) {
            this.doneTasks = doneTasks;
        }
    }
}

