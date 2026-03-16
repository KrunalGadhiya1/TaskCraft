package com.taskcraft.controller;

import com.taskcraft.dto.ReportDtos;
import com.taskcraft.service.ReportService;
import org.springframework.http.MediaType;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/workspaces/{workspaceId}/projects/{projectId}/reports")
public class ReportController {

    private final ReportService reportService;

    public ReportController(ReportService reportService) {
        this.reportService = reportService;
    }

    @GetMapping("/project")
    public ReportDtos.ProjectReportResponse projectReport(
            Authentication authentication,
            @PathVariable Long workspaceId,
            @PathVariable Long projectId
    ) {
        String identifier = authentication.getName();
        return reportService.getProjectReport(identifier, workspaceId, projectId);
    }

    @GetMapping(value = "/project.csv", produces = "text/csv")
    public String projectReportCsv(
            Authentication authentication,
            @PathVariable Long workspaceId,
            @PathVariable Long projectId
    ) {
        String identifier = authentication.getName();
        return reportService.getProjectReportCsv(identifier, workspaceId, projectId);
    }
}

