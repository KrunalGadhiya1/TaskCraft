package com.taskcraft.controller;

import com.taskcraft.dto.SprintDtos;
import com.taskcraft.service.SprintService;
import jakarta.validation.Valid;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/workspaces/{workspaceId}/projects/{projectId}/sprints")
public class SprintController {

    private final SprintService sprintService;

    public SprintController(SprintService sprintService) {
        this.sprintService = sprintService;
    }

    @PostMapping
    public SprintDtos.SprintResponse createSprint(
            Authentication authentication,
            @PathVariable Long workspaceId,
            @PathVariable Long projectId,
            @Valid @RequestBody SprintDtos.CreateSprintRequest request
    ) {
        String identifier = authentication.getName();
        return sprintService.createSprint(identifier, workspaceId, projectId, request);
    }

    @GetMapping
    public List<SprintDtos.SprintResponse> getSprints(
            Authentication authentication,
            @PathVariable Long workspaceId,
            @PathVariable Long projectId
    ) {
        String identifier = authentication.getName();
        return sprintService.getSprints(identifier, workspaceId, projectId);
    }

    @PutMapping("/{sprintId}")
    public SprintDtos.SprintResponse updateSprint(
            Authentication authentication,
            @PathVariable Long workspaceId,
            @PathVariable Long projectId,
            @PathVariable Long sprintId,
            @Valid @RequestBody SprintDtos.UpdateSprintRequest request
    ) {
        String identifier = authentication.getName();
        return sprintService.updateSprint(identifier, workspaceId, projectId, sprintId, request);
    }

    @PutMapping("/{sprintId}/status")
    public SprintDtos.SprintResponse updateSprintStatus(
            Authentication authentication,
            @PathVariable Long workspaceId,
            @PathVariable Long projectId,
            @PathVariable Long sprintId,
            @Valid @RequestBody SprintDtos.UpdateSprintStatusRequest request
    ) {
        String identifier = authentication.getName();
        return sprintService.updateSprintStatus(identifier, workspaceId, projectId, sprintId, request);
    }

    @DeleteMapping("/{sprintId}")
    public void deleteSprint(
            Authentication authentication,
            @PathVariable Long workspaceId,
            @PathVariable Long projectId,
            @PathVariable Long sprintId
    ) {
        String identifier = authentication.getName();
        sprintService.deleteSprint(identifier, workspaceId, projectId, sprintId);
    }

    @PostMapping("/{sprintId}/tasks")
    public void assignTasks(
            Authentication authentication,
            @PathVariable Long workspaceId,
            @PathVariable Long projectId,
            @PathVariable Long sprintId,
            @Valid @RequestBody SprintDtos.AssignTasksRequest request
    ) {
        String identifier = authentication.getName();
        sprintService.assignTasksToSprint(identifier, workspaceId, projectId, sprintId, request);
    }

    @DeleteMapping("/{sprintId}/tasks")
    public void removeTasks(
            Authentication authentication,
            @PathVariable Long workspaceId,
            @PathVariable Long projectId,
            @PathVariable Long sprintId,
            @Valid @RequestBody SprintDtos.AssignTasksRequest request
    ) {
        String identifier = authentication.getName();
        sprintService.removeTasksFromSprint(identifier, workspaceId, projectId, sprintId, request);
    }
}

