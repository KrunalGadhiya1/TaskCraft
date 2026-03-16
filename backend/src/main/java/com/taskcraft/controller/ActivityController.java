package com.taskcraft.controller;

import com.taskcraft.dto.ActivityDtos;
import com.taskcraft.service.ActivityService;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/activity")
public class ActivityController {

    private final ActivityService activityService;

    public ActivityController(ActivityService activityService) {
        this.activityService = activityService;
    }

    @GetMapping("/workspaces/{workspaceId}")
    public List<ActivityDtos.ActivityResponse> getWorkspaceActivity(
            Authentication authentication,
            @PathVariable Long workspaceId
    ) {
        // Access control is enforced by other services (workspace membership) in most flows.
        // For now, this endpoint returns activity; we will tighten this later if needed.
        return activityService.getByWorkspace(workspaceId);
    }

    @GetMapping("/projects/{projectId}")
    public List<ActivityDtos.ActivityResponse> getProjectActivity(
            Authentication authentication,
            @PathVariable Long projectId
    ) {
        return activityService.getByProject(projectId);
    }

    @GetMapping("/tasks/{taskId}")
    public List<ActivityDtos.ActivityResponse> getTaskActivity(
            Authentication authentication,
            @PathVariable Long taskId
    ) {
        return activityService.getByTask(taskId);
    }
}

