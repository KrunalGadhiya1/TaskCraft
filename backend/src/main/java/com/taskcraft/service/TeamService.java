package com.taskcraft.service;

import com.taskcraft.dto.TeamDtos;
import com.taskcraft.entity.Team;
import com.taskcraft.entity.TeamMember;
import com.taskcraft.entity.User;
import com.taskcraft.entity.Workspace;
import com.taskcraft.entity.WorkspaceMember;
import com.taskcraft.repository.TeamMemberRepository;
import com.taskcraft.repository.TeamRepository;
import com.taskcraft.repository.UserRepository;
import com.taskcraft.repository.WorkspaceMemberRepository;
import com.taskcraft.repository.WorkspaceRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class TeamService {

    private final TeamRepository teamRepository;
    private final TeamMemberRepository teamMemberRepository;
    private final WorkspaceRepository workspaceRepository;
    private final WorkspaceMemberRepository workspaceMemberRepository;
    private final UserRepository userRepository;
    private final ActivityService activityService;

    public TeamService(
            TeamRepository teamRepository,
            TeamMemberRepository teamMemberRepository,
            WorkspaceRepository workspaceRepository,
            WorkspaceMemberRepository workspaceMemberRepository,
            UserRepository userRepository,
            ActivityService activityService
    ) {
        this.teamRepository = teamRepository;
        this.teamMemberRepository = teamMemberRepository;
        this.workspaceRepository = workspaceRepository;
        this.workspaceMemberRepository = workspaceMemberRepository;
        this.userRepository = userRepository;
        this.activityService = activityService;
    }

    @Transactional
    public TeamDtos.TeamResponse createTeam(
            String identifier,
            Long workspaceId,
            TeamDtos.CreateTeamRequest request
    ) {
        User user = findByIdentifier(identifier);
        Workspace workspace = workspaceRepository.findById(workspaceId)
                .orElseThrow(() -> new IllegalArgumentException("Workspace not found"));

        ensureWorkspaceMember(workspace, user);

        Instant now = Instant.now();

        Team team = new Team();
        team.setName(request.getName());
        team.setDescription(request.getDescription());
        team.setWorkspace(workspace);
        team.setCreatedAt(now);
        team.setUpdatedAt(now);

        teamRepository.save(team);

        TeamMember member = new TeamMember();
        member.setTeam(team);
        member.setUser(user);
        member.setRole("TEAM_ADMIN");
        member.setCreatedAt(now);

        teamMemberRepository.save(member);

        activityService.record(
                identifier,
                com.taskcraft.entity.ActivityLog.ActivityType.TEAM_CREATED,
                workspaceId,
                null,
                null,
                null,
                "Created team: " + team.getName()
        );

        return toResponse(team);
    }

    @Transactional(readOnly = true)
    public List<TeamDtos.TeamResponse> getTeams(String identifier, Long workspaceId) {
        User user = findByIdentifier(identifier);
        Workspace workspace = workspaceRepository.findById(workspaceId)
                .orElseThrow(() -> new IllegalArgumentException("Workspace not found"));

        ensureWorkspaceMember(workspace, user);

        return teamRepository.findByWorkspace(workspace)
                .stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    @Transactional
    public List<TeamDtos.TeamMemberResponse> addMembers(
            String identifier,
            Long workspaceId,
            Long teamId,
            TeamDtos.BulkAddTeamMembersRequest request
    ) {
        User currentUser = findByIdentifier(identifier);
        Workspace workspace = workspaceRepository.findById(workspaceId)
                .orElseThrow(() -> new IllegalArgumentException("Workspace not found"));

        ensureWorkspaceMember(workspace, currentUser);

        Team team = teamRepository.findById(teamId)
                .orElseThrow(() -> new IllegalArgumentException("Team not found"));
        if (!team.getWorkspace().getId().equals(workspace.getId())) {
            throw new IllegalArgumentException("Team does not belong to this workspace");
        }

        ensureTeamAdmin(team, currentUser);

        Instant now = Instant.now();

        for (TeamDtos.AddTeamMemberRequest m : request.getMembers()) {
            User user = findByIdentifier(m.getIdentifier());

            // ensure user is a workspace member first
            ensureWorkspaceMember(workspace, user);

            TeamMember existing = teamMemberRepository.findByTeamAndUser(team, user)
                    .orElse(null);
            if (existing == null) {
                TeamMember member = new TeamMember();
                member.setTeam(team);
                member.setUser(user);
                member.setRole(m.getRole());
                member.setCreatedAt(now);
                teamMemberRepository.save(member);
            } else {
                existing.setRole(m.getRole());
                teamMemberRepository.save(existing);
            }
        }

        activityService.record(
                identifier,
                com.taskcraft.entity.ActivityLog.ActivityType.TEAM_MEMBER_ADDED,
                workspaceId,
                null,
                null,
                null,
                "Updated team members"
        );

        return getMembers(identifier, workspaceId, teamId);
    }

    @Transactional(readOnly = true)
    public List<TeamDtos.TeamMemberResponse> getMembers(
            String identifier,
            Long workspaceId,
            Long teamId
    ) {
        User user = findByIdentifier(identifier);
        Workspace workspace = workspaceRepository.findById(workspaceId)
                .orElseThrow(() -> new IllegalArgumentException("Workspace not found"));

        ensureWorkspaceMember(workspace, user);

        Team team = teamRepository.findById(teamId)
                .orElseThrow(() -> new IllegalArgumentException("Team not found"));
        if (!team.getWorkspace().getId().equals(workspace.getId())) {
            throw new IllegalArgumentException("Team does not belong to this workspace");
        }

        return teamMemberRepository.findByTeam(team)
                .stream()
                .map(this::toMemberResponse)
                .collect(Collectors.toList());
    }

    private User findByIdentifier(String identifier) {
        if (identifier.contains("@")) {
            return userRepository.findByEmail(identifier.toLowerCase())
                    .orElseThrow(() -> new IllegalArgumentException("User not found"));
        }
        return userRepository.findByUsername(identifier)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));
    }

    private void ensureWorkspaceMember(Workspace workspace, User user) {
        workspaceMemberRepository.findByWorkspaceAndUser(workspace, user)
                .orElseThrow(() -> new IllegalArgumentException("You are not a member of this workspace"));
    }

    private void ensureTeamAdmin(Team team, User user) {
        TeamMember member = teamMemberRepository.findByTeamAndUser(team, user)
                .orElseThrow(() -> new IllegalArgumentException("You are not a member of this team"));
        if (!"TEAM_ADMIN".equals(member.getRole())) {
            throw new IllegalArgumentException("Only team admin can perform this action");
        }
    }

    private TeamDtos.TeamResponse toResponse(Team team) {
        TeamDtos.TeamResponse dto = new TeamDtos.TeamResponse();
        dto.setId(team.getId());
        dto.setName(team.getName());
        dto.setDescription(team.getDescription());
        dto.setWorkspaceId(team.getWorkspace().getId());
        return dto;
    }

    private TeamDtos.TeamMemberResponse toMemberResponse(TeamMember member) {
        TeamDtos.TeamMemberResponse dto = new TeamDtos.TeamMemberResponse();
        dto.setId(member.getId());
        dto.setUserId(member.getUser().getId());
        dto.setUsername(member.getUser().getUsername());
        dto.setEmail(member.getUser().getEmail());
        dto.setRole(member.getRole());
        return dto;
    }
}

