package com.taskcraft.controller;

import com.taskcraft.dto.ProjectDtos;
import com.taskcraft.service.ProjectService;
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
@RequestMapping("/api/workspaces/{workspaceId}/projects")
public class ProjectController {

    private final ProjectService projectService;

    public ProjectController(ProjectService projectService) {
        this.projectService = projectService;
    }

    @PostMapping
    public ProjectDtos.ProjectResponse createProject(
            Authentication authentication,
            @PathVariable Long workspaceId,
            @Valid @RequestBody ProjectDtos.CreateProjectRequest request
    ) {
        String identifier = authentication.getName();
        return projectService.createProject(identifier, workspaceId, request);
    }

    @GetMapping
    public List<ProjectDtos.ProjectResponse> getProjects(
            Authentication authentication,
            @PathVariable Long workspaceId
    ) {
        String identifier = authentication.getName();
        return projectService.getProjects(identifier, workspaceId);
    }

    @GetMapping("/{projectId}")
    public ProjectDtos.ProjectResponse getProject(
            Authentication authentication,
            @PathVariable Long workspaceId,
            @PathVariable Long projectId
    ) {
        String identifier = authentication.getName();
        return projectService.getProject(identifier, workspaceId, projectId);
    }

    @PutMapping("/{projectId}")
    public ProjectDtos.ProjectResponse updateProject(
            Authentication authentication,
            @PathVariable Long workspaceId,
            @PathVariable Long projectId,
            @Valid @RequestBody ProjectDtos.UpdateProjectRequest request
    ) {
        String identifier = authentication.getName();
        return projectService.updateProject(identifier, workspaceId, projectId, request);
    }

    @DeleteMapping("/{projectId}")
    public void deleteProject(
            Authentication authentication,
            @PathVariable Long workspaceId,
            @PathVariable Long projectId
    ) {
        String identifier = authentication.getName();
        projectService.deleteProject(identifier, workspaceId, projectId);
    }

    @PostMapping("/{projectId}/members")
    public List<ProjectDtos.ProjectMemberResponse> addMembers(
            Authentication authentication,
            @PathVariable Long workspaceId,
            @PathVariable Long projectId,
            @Valid @RequestBody ProjectDtos.BulkAddProjectMembersRequest request
    ) {
        String identifier = authentication.getName();
        return projectService.addMembers(identifier, workspaceId, projectId, request);
    }

    @GetMapping("/{projectId}/members")
    public List<ProjectDtos.ProjectMemberResponse> getMembers(
            Authentication authentication,
            @PathVariable Long workspaceId,
            @PathVariable Long projectId
    ) {
        String identifier = authentication.getName();
        return projectService.getMembers(identifier, workspaceId, projectId);
    }
}

