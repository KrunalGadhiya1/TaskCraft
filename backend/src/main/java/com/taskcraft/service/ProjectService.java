package com.taskcraft.service;

import com.taskcraft.dto.ProjectDtos;
import com.taskcraft.entity.Project;
import com.taskcraft.entity.ProjectMember;
import com.taskcraft.entity.User;
import com.taskcraft.entity.Workspace;
import com.taskcraft.exception.ForbiddenException;
import com.taskcraft.repository.ProjectMemberRepository;
import com.taskcraft.repository.ProjectRepository;
import com.taskcraft.repository.UserRepository;
import com.taskcraft.repository.WorkspaceMemberRepository;
import com.taskcraft.repository.WorkspaceRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class ProjectService {

    private final ProjectRepository projectRepository;
    private final ProjectMemberRepository projectMemberRepository;
    private final WorkspaceRepository workspaceRepository;
    private final WorkspaceMemberRepository workspaceMemberRepository;
    private final UserRepository userRepository;
    private final ActivityService activityService;

    public ProjectService(
            ProjectRepository projectRepository,
            ProjectMemberRepository projectMemberRepository,
            WorkspaceRepository workspaceRepository,
            WorkspaceMemberRepository workspaceMemberRepository,
            UserRepository userRepository,
            ActivityService activityService
    ) {
        this.projectRepository = projectRepository;
        this.projectMemberRepository = projectMemberRepository;
        this.workspaceRepository = workspaceRepository;
        this.workspaceMemberRepository = workspaceMemberRepository;
        this.userRepository = userRepository;
        this.activityService = activityService;
    }

    @Transactional
    public ProjectDtos.ProjectResponse createProject(
            String identifier,
            Long workspaceId,
            ProjectDtos.CreateProjectRequest request
    ) {
        User user = findByIdentifier(identifier);
        Workspace workspace = workspaceRepository.findById(workspaceId)
                .orElseThrow(() -> new IllegalArgumentException("Workspace not found"));

        ensureWorkspaceMember(workspace, user);

        Instant now = Instant.now();

        Project project = new Project();
        project.setName(request.getName());
        project.setKey(request.getKey());
        project.setDescription(request.getDescription());
        project.setStatus("ACTIVE");
        project.setWorkspace(workspace);
        project.setCreatedBy(user);
        project.setCreatedAt(now);
        project.setUpdatedAt(now);

        projectRepository.save(project);

        ProjectMember ownerMember = new ProjectMember();
        ownerMember.setProject(project);
        ownerMember.setUser(user);
        ownerMember.setRole("PROJECT_OWNER");
        ownerMember.setCreatedAt(now);

        projectMemberRepository.save(ownerMember);

        activityService.record(
                identifier,
                com.taskcraft.entity.ActivityLog.ActivityType.PROJECT_CREATED,
                workspaceId,
                project.getId(),
                null,
                null,
                "Created project: " + project.getName()
        );

        return toResponse(project);
    }

    @Transactional(readOnly = true)
    public List<ProjectDtos.ProjectResponse> getProjects(String identifier, Long workspaceId) {
        User user = findByIdentifier(identifier);
        Workspace workspace = workspaceRepository.findById(workspaceId)
                .orElseThrow(() -> new IllegalArgumentException("Workspace not found"));

        ensureWorkspaceMember(workspace, user);

        return projectRepository.findByWorkspace(workspace)
                .stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public ProjectDtos.ProjectResponse getProject(String identifier, Long workspaceId, Long projectId) {
        User user = findByIdentifier(identifier);
        Workspace workspace = workspaceRepository.findById(workspaceId)
                .orElseThrow(() -> new IllegalArgumentException("Workspace not found"));

        ensureWorkspaceMember(workspace, user);

        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new IllegalArgumentException("Project not found"));
        if (!project.getWorkspace().getId().equals(workspace.getId())) {
            throw new IllegalArgumentException("Project does not belong to this workspace");
        }

        ensureProjectMember(project, user);

        return toResponse(project);
    }

    @Transactional
    public ProjectDtos.ProjectResponse updateProject(
            String identifier,
            Long workspaceId,
            Long projectId,
            ProjectDtos.UpdateProjectRequest request
    ) {
        User user = findByIdentifier(identifier);
        Workspace workspace = workspaceRepository.findById(workspaceId)
                .orElseThrow(() -> new IllegalArgumentException("Workspace not found"));

        ensureWorkspaceMember(workspace, user);

        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new IllegalArgumentException("Project not found"));
        if (!project.getWorkspace().getId().equals(workspace.getId())) {
            throw new IllegalArgumentException("Project does not belong to this workspace");
        }

        ensureProjectOwner(project, user);

        project.setName(request.getName());
        project.setDescription(request.getDescription());
        project.setStatus(request.getStatus());
        project.setUpdatedAt(Instant.now());

        projectRepository.save(project);
        return toResponse(project);
    }

    @Transactional
    public void deleteProject(String identifier, Long workspaceId, Long projectId) {
        User user = findByIdentifier(identifier);
        Workspace workspace = workspaceRepository.findById(workspaceId)
                .orElseThrow(() -> new IllegalArgumentException("Workspace not found"));

        ensureWorkspaceMember(workspace, user);

        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new IllegalArgumentException("Project not found"));
        if (!project.getWorkspace().getId().equals(workspace.getId())) {
            throw new IllegalArgumentException("Project does not belong to this workspace");
        }

        ensureProjectOwner(project, user);

        projectRepository.delete(project);
    }

    @Transactional
    public List<ProjectDtos.ProjectMemberResponse> addMembers(
            String identifier,
            Long workspaceId,
            Long projectId,
            ProjectDtos.BulkAddProjectMembersRequest request
    ) {
        User currentUser = findByIdentifier(identifier);
        Workspace workspace = workspaceRepository.findById(workspaceId)
                .orElseThrow(() -> new IllegalArgumentException("Workspace not found"));

        ensureWorkspaceMember(workspace, currentUser);

        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new IllegalArgumentException("Project not found"));
        if (!project.getWorkspace().getId().equals(workspace.getId())) {
            throw new IllegalArgumentException("Project does not belong to this workspace");
        }

        ensureProjectOwner(project, currentUser);

        Instant now = Instant.now();

        for (ProjectDtos.AddProjectMemberRequest m : request.getMembers()) {
            User user = findByIdentifier(m.getIdentifier());

            // ensure user is workspace member first
            ensureWorkspaceMember(workspace, user);

            ProjectMember existing = projectMemberRepository.findByProjectAndUser(project, user)
                    .orElse(null);
            if (existing == null) {
                ProjectMember member = new ProjectMember();
                member.setProject(project);
                member.setUser(user);
                member.setRole(m.getRole());
                member.setCreatedAt(now);
                projectMemberRepository.save(member);
            } else {
                existing.setRole(m.getRole());
                projectMemberRepository.save(existing);
            }
        }

        activityService.record(
                identifier,
                com.taskcraft.entity.ActivityLog.ActivityType.PROJECT_MEMBER_ADDED,
                workspaceId,
                projectId,
                null,
                null,
                "Updated project members"
        );

        return getMembers(identifier, workspaceId, projectId);
    }

    @Transactional(readOnly = true)
    public List<ProjectDtos.ProjectMemberResponse> getMembers(
            String identifier,
            Long workspaceId,
            Long projectId
    ) {
        User user = findByIdentifier(identifier);
        Workspace workspace = workspaceRepository.findById(workspaceId)
                .orElseThrow(() -> new IllegalArgumentException("Workspace not found"));

        ensureWorkspaceMember(workspace, user);

        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new IllegalArgumentException("Project not found"));
        if (!project.getWorkspace().getId().equals(workspace.getId())) {
            throw new IllegalArgumentException("Project does not belong to this workspace");
        }

        ensureProjectMember(project, user);

        return projectMemberRepository.findByProject(project)
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
                .orElseThrow(() -> new ForbiddenException("You are not a member of this workspace"));
    }

    private void ensureProjectMember(Project project, User user) {
        projectMemberRepository.findByProjectAndUser(project, user)
                .orElseThrow(() -> new ForbiddenException("You are not a member of this project"));
    }

    private void ensureProjectOwner(Project project, User user) {
        ProjectMember member = projectMemberRepository.findByProjectAndUser(project, user)
                .orElseThrow(() -> new ForbiddenException("You are not a member of this project"));
        if (!"PROJECT_OWNER".equals(member.getRole())) {
            throw new ForbiddenException("Only project owner can perform this action");
        }
    }

    private ProjectDtos.ProjectResponse toResponse(Project project) {
        ProjectDtos.ProjectResponse dto = new ProjectDtos.ProjectResponse();
        dto.setId(project.getId());
        dto.setName(project.getName());
        dto.setKey(project.getKey());
        dto.setDescription(project.getDescription());
        dto.setStatus(project.getStatus());
        dto.setWorkspaceId(project.getWorkspace().getId());
        dto.setCreatedById(project.getCreatedBy().getId());
        return dto;
    }

    private ProjectDtos.ProjectMemberResponse toMemberResponse(ProjectMember member) {
        ProjectDtos.ProjectMemberResponse dto = new ProjectDtos.ProjectMemberResponse();
        dto.setId(member.getId());
        dto.setUserId(member.getUser().getId());
        dto.setUsername(member.getUser().getUsername());
        dto.setEmail(member.getUser().getEmail());
        dto.setRole(member.getRole());
        return dto;
    }
}

