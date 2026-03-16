package com.taskcraft.service;

import com.taskcraft.dto.WorkspaceDtos;
import com.taskcraft.entity.User;
import com.taskcraft.entity.Workspace;
import com.taskcraft.entity.WorkspaceMember;
import com.taskcraft.exception.ForbiddenException;
import com.taskcraft.repository.UserRepository;
import com.taskcraft.repository.WorkspaceMemberRepository;
import com.taskcraft.repository.WorkspaceRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class WorkspaceService {

    private final WorkspaceRepository workspaceRepository;
    private final WorkspaceMemberRepository workspaceMemberRepository;
    private final UserRepository userRepository;
    private final ActivityService activityService;

    public WorkspaceService(
            WorkspaceRepository workspaceRepository,
            WorkspaceMemberRepository workspaceMemberRepository,
            UserRepository userRepository,
            ActivityService activityService
    ) {
        this.workspaceRepository = workspaceRepository;
        this.workspaceMemberRepository = workspaceMemberRepository;
        this.userRepository = userRepository;
        this.activityService = activityService;
    }

    @Transactional
    public WorkspaceDtos.WorkspaceResponse createWorkspace(String identifier, WorkspaceDtos.CreateWorkspaceRequest request) {
        User owner = findByIdentifier(identifier);

        Instant now = Instant.now();

        Workspace workspace = new Workspace();
        workspace.setName(request.getName());
        workspace.setKey(request.getKey());
        workspace.setDescription(request.getDescription());
        workspace.setOwner(owner);
        workspace.setCreatedAt(now);
        workspace.setUpdatedAt(now);

        workspaceRepository.save(workspace);

        WorkspaceMember ownerMember = new WorkspaceMember();
        ownerMember.setWorkspace(workspace);
        ownerMember.setUser(owner);
        ownerMember.setRole("WORKSPACE_OWNER");
        ownerMember.setCreatedAt(now);

        workspaceMemberRepository.save(ownerMember);

        activityService.record(
                identifier,
                com.taskcraft.entity.ActivityLog.ActivityType.WORKSPACE_CREATED,
                workspace.getId(),
                null,
                null,
                null,
                "Created workspace: " + workspace.getName()
        );

        return toResponse(workspace);
    }

    @Transactional(readOnly = true)
    public List<WorkspaceDtos.WorkspaceResponse> getMyWorkspaces(String identifier) {
        User user = findByIdentifier(identifier);

        List<WorkspaceMember> memberships = workspaceMemberRepository.findAll()
                .stream()
                .filter(m -> m.getUser().getId().equals(user.getId()))
                .collect(Collectors.toList());

        return memberships.stream()
                .map(WorkspaceMember::getWorkspace)
                .distinct()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public WorkspaceDtos.WorkspaceResponse getWorkspace(String identifier, Long workspaceId) {
        User user = findByIdentifier(identifier);
        Workspace workspace = workspaceRepository.findById(workspaceId)
                .orElseThrow(() -> new IllegalArgumentException("Workspace not found"));

        ensureMember(workspace, user);

        return toResponse(workspace);
    }

    @Transactional
    public WorkspaceDtos.WorkspaceResponse updateWorkspace(
            String identifier,
            Long workspaceId,
            WorkspaceDtos.UpdateWorkspaceRequest request
    ) {
        User user = findByIdentifier(identifier);
        Workspace workspace = workspaceRepository.findById(workspaceId)
                .orElseThrow(() -> new IllegalArgumentException("Workspace not found"));

        ensureOwner(workspace, user);

        workspace.setName(request.getName());
        workspace.setDescription(request.getDescription());
        workspace.setUpdatedAt(Instant.now());

        workspaceRepository.save(workspace);
        return toResponse(workspace);
    }

    @Transactional
    public void deleteWorkspace(String identifier, Long workspaceId) {
        User user = findByIdentifier(identifier);
        Workspace workspace = workspaceRepository.findById(workspaceId)
                .orElseThrow(() -> new IllegalArgumentException("Workspace not found"));

        ensureOwner(workspace, user);

        workspaceRepository.delete(workspace);
    }

    @Transactional
    public List<WorkspaceDtos.WorkspaceMemberResponse> addMembers(
            String identifier,
            Long workspaceId,
            WorkspaceDtos.BulkAddWorkspaceMembersRequest request
    ) {
        User currentUser = findByIdentifier(identifier);
        Workspace workspace = workspaceRepository.findById(workspaceId)
                .orElseThrow(() -> new IllegalArgumentException("Workspace not found"));

        ensureOwner(workspace, currentUser);

        Instant now = Instant.now();

        for (WorkspaceDtos.AddWorkspaceMemberRequest m : request.getMembers()) {
            User user = findByIdentifier(m.getIdentifier());
            WorkspaceMember existing = workspaceMemberRepository.findByWorkspaceAndUser(workspace, user)
                    .orElse(null);
            if (existing == null) {
                WorkspaceMember member = new WorkspaceMember();
                member.setWorkspace(workspace);
                member.setUser(user);
                member.setRole(m.getRole());
                member.setCreatedAt(now);
                workspaceMemberRepository.save(member);
            } else {
                existing.setRole(m.getRole());
                workspaceMemberRepository.save(existing);
            }
        }

        activityService.record(
                identifier,
                com.taskcraft.entity.ActivityLog.ActivityType.WORKSPACE_MEMBER_ADDED,
                workspaceId,
                null,
                null,
                null,
                "Updated workspace members"
        );

        return getMembers(identifier, workspaceId);
    }

    @Transactional(readOnly = true)
    public List<WorkspaceDtos.WorkspaceMemberResponse> getMembers(String identifier, Long workspaceId) {
        User user = findByIdentifier(identifier);
        Workspace workspace = workspaceRepository.findById(workspaceId)
                .orElseThrow(() -> new IllegalArgumentException("Workspace not found"));

        ensureMember(workspace, user);

        return workspaceMemberRepository.findByWorkspace(workspace)
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

    private void ensureMember(Workspace workspace, User user) {
        workspaceMemberRepository.findByWorkspaceAndUser(workspace, user)
                .orElseThrow(() -> new ForbiddenException("You are not a member of this workspace"));
    }

    private void ensureOwner(Workspace workspace, User user) {
        WorkspaceMember member = workspaceMemberRepository.findByWorkspaceAndUser(workspace, user)
                .orElseThrow(() -> new ForbiddenException("You are not a member of this workspace"));
        if (!"WORKSPACE_OWNER".equals(member.getRole())) {
            throw new ForbiddenException("Only workspace owner can perform this action");
        }
    }

    private WorkspaceDtos.WorkspaceResponse toResponse(Workspace workspace) {
        WorkspaceDtos.WorkspaceResponse dto = new WorkspaceDtos.WorkspaceResponse();
        dto.setId(workspace.getId());
        dto.setName(workspace.getName());
        dto.setKey(workspace.getKey());
        dto.setDescription(workspace.getDescription());
        dto.setOwnerId(workspace.getOwner().getId());
        return dto;
    }

    private WorkspaceDtos.WorkspaceMemberResponse toMemberResponse(WorkspaceMember member) {
        WorkspaceDtos.WorkspaceMemberResponse dto = new WorkspaceDtos.WorkspaceMemberResponse();
        dto.setId(member.getId());
        dto.setUserId(member.getUser().getId());
        dto.setUsername(member.getUser().getUsername());
        dto.setEmail(member.getUser().getEmail());
        dto.setRole(member.getRole());
        return dto;
    }
}

