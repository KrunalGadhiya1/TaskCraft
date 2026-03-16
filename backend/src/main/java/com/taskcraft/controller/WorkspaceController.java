package com.taskcraft.controller;

import com.taskcraft.dto.WorkspaceDtos;
import com.taskcraft.service.WorkspaceService;
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
@RequestMapping("/api/workspaces")
public class WorkspaceController {

    private final WorkspaceService workspaceService;

    public WorkspaceController(WorkspaceService workspaceService) {
        this.workspaceService = workspaceService;
    }

    @PostMapping
    public WorkspaceDtos.WorkspaceResponse createWorkspace(
            Authentication authentication,
            @Valid @RequestBody WorkspaceDtos.CreateWorkspaceRequest request
    ) {
        String identifier = authentication.getName();
        return workspaceService.createWorkspace(identifier, request);
    }

    @GetMapping
    public List<WorkspaceDtos.WorkspaceResponse> getMyWorkspaces(Authentication authentication) {
        String identifier = authentication.getName();
        return workspaceService.getMyWorkspaces(identifier);
    }

    @GetMapping("/{id}")
    public WorkspaceDtos.WorkspaceResponse getWorkspace(
            Authentication authentication,
            @PathVariable Long id
    ) {
        String identifier = authentication.getName();
        return workspaceService.getWorkspace(identifier, id);
    }

    @PutMapping("/{id}")
    public WorkspaceDtos.WorkspaceResponse updateWorkspace(
            Authentication authentication,
            @PathVariable Long id,
            @Valid @RequestBody WorkspaceDtos.UpdateWorkspaceRequest request
    ) {
        String identifier = authentication.getName();
        return workspaceService.updateWorkspace(identifier, id, request);
    }

    @DeleteMapping("/{id}")
    public void deleteWorkspace(
            Authentication authentication,
            @PathVariable Long id
    ) {
        String identifier = authentication.getName();
        workspaceService.deleteWorkspace(identifier, id);
    }

    @PostMapping("/{id}/members")
    public List<WorkspaceDtos.WorkspaceMemberResponse> addMembers(
            Authentication authentication,
            @PathVariable Long id,
            @Valid @RequestBody WorkspaceDtos.BulkAddWorkspaceMembersRequest request
    ) {
        String identifier = authentication.getName();
        return workspaceService.addMembers(identifier, id, request);
    }

    @GetMapping("/{id}/members")
    public List<WorkspaceDtos.WorkspaceMemberResponse> getMembers(
            Authentication authentication,
            @PathVariable Long id
    ) {
        String identifier = authentication.getName();
        return workspaceService.getMembers(identifier, id);
    }
}

