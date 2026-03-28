package com.taskcraft.dto;

import java.util.Map;

public class DashboardDtos {

    public static class DailyProgress {
        private String date;
        private int total;
        private int done;

        public String getDate() { return date; }
        public void setDate(String date) { this.date = date; }
        public int getTotal() { return total; }
        public void setTotal(int total) { this.total = total; }
        public int getDone() { return done; }
        public void setDone(int done) { this.done = done; }
    }

    public static class ProjectSummaryResponse {
        private Long projectId;
        private Map<String, Long> tasksByStatus;
        private Map<String, Long> tasksByPriority;
        private Long totalTasks;
        private Long doneTasks;
        private java.util.List<DailyProgress> progressChart;

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

        public java.util.List<DailyProgress> getProgressChart() {
            return progressChart;
        }

        public void setProgressChart(java.util.List<DailyProgress> progressChart) {
            this.progressChart = progressChart;
        }
    }
}

