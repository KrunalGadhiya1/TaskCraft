package com.taskcraft.service;

import com.taskcraft.dto.DashboardDtos;
import com.taskcraft.dto.ReportDtos;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class ReportService {

    private final DashboardService dashboardService;

    public ReportService(DashboardService dashboardService) {
        this.dashboardService = dashboardService;
    }

    @Transactional(readOnly = true)
    public ReportDtos.ProjectReportResponse getProjectReport(
            String identifier,
            Long workspaceId,
            Long projectId
    ) {
        DashboardDtos.ProjectSummaryResponse summary =
                dashboardService.getProjectSummary(identifier, workspaceId, projectId);

        ReportDtos.ProjectReportResponse dto = new ReportDtos.ProjectReportResponse();
        dto.setWorkspaceId(workspaceId);
        dto.setProjectId(projectId);
        dto.setTasksByStatus(summary.getTasksByStatus());
        dto.setTasksByPriority(summary.getTasksByPriority());
        dto.setTotalTasks(summary.getTotalTasks());
        dto.setDoneTasks(summary.getDoneTasks());
        return dto;
    }

    @Transactional(readOnly = true)
    public String getProjectReportCsv(String identifier, Long workspaceId, Long projectId) {
        ReportDtos.ProjectReportResponse r = getProjectReport(identifier, workspaceId, projectId);

        StringBuilder sb = new StringBuilder();
        sb.append("workspaceId,projectId,totalTasks,doneTasks\n");
        sb.append(r.getWorkspaceId()).append(",")
                .append(r.getProjectId()).append(",")
                .append(r.getTotalTasks()).append(",")
                .append(r.getDoneTasks()).append("\n\n");

        sb.append("tasksByStatus\n");
        sb.append("status,count\n");
        for (var e : r.getTasksByStatus().entrySet()) {
            sb.append(e.getKey()).append(",").append(e.getValue()).append("\n");
        }

        sb.append("\n");
        sb.append("tasksByPriority\n");
        sb.append("priority,count\n");
        for (var e : r.getTasksByPriority().entrySet()) {
            sb.append(e.getKey()).append(",").append(e.getValue()).append("\n");
        }

        return sb.toString();
    }
}

