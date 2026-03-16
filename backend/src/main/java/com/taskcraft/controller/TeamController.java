package com.taskcraft.controller;

import com.taskcraft.dto.TeamDtos;
import com.taskcraft.service.TeamService;
import jakarta.validation.Valid;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/workspaces/{workspaceId}/teams")
public class TeamController {

    private final TeamService teamService;

    public TeamController(TeamService teamService) {
        this.teamService = teamService;
    }

    @PostMapping
    public TeamDtos.TeamResponse createTeam(
            Authentication authentication,
            @PathVariable Long workspaceId,
            @Valid @RequestBody TeamDtos.CreateTeamRequest request
    ) {
        String identifier = authentication.getName();
        return teamService.createTeam(identifier, workspaceId, request);
    }

    @GetMapping
    public List<TeamDtos.TeamResponse> getTeams(
            Authentication authentication,
            @PathVariable Long workspaceId
    ) {
        String identifier = authentication.getName();
        return teamService.getTeams(identifier, workspaceId);
    }

    @PostMapping("/{teamId}/members")
    public List<TeamDtos.TeamMemberResponse> addMembers(
            Authentication authentication,
            @PathVariable Long workspaceId,
            @PathVariable Long teamId,
            @Valid @RequestBody TeamDtos.BulkAddTeamMembersRequest request
    ) {
        String identifier = authentication.getName();
        return teamService.addMembers(identifier, workspaceId, teamId, request);
    }

    @GetMapping("/{teamId}/members")
    public List<TeamDtos.TeamMemberResponse> getMembers(
            Authentication authentication,
            @PathVariable Long workspaceId,
            @PathVariable Long teamId
    ) {
        String identifier = authentication.getName();
        return teamService.getMembers(identifier, workspaceId, teamId);
    }
}

