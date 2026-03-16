package com.taskcraft.controller;

import com.taskcraft.dto.DashboardDtos;
import com.taskcraft.service.DashboardService;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/workspaces/{workspaceId}/projects/{projectId}/dashboard")
public class DashboardController {

    private final DashboardService dashboardService;

    public DashboardController(DashboardService dashboardService) {
        this.dashboardService = dashboardService;
    }

    @GetMapping("/summary")
    public DashboardDtos.ProjectSummaryResponse getSummary(
            Authentication authentication,
            @PathVariable Long workspaceId,
            @PathVariable Long projectId
    ) {
        String identifier = authentication.getName();
        return dashboardService.getProjectSummary(identifier, workspaceId, projectId);
    }
}

