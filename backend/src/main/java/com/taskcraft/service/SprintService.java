package com.taskcraft.service;

import com.taskcraft.dto.SprintDtos;
import com.taskcraft.entity.Project;
import com.taskcraft.entity.ProjectMember;
import com.taskcraft.entity.Sprint;
import com.taskcraft.entity.Task;
import com.taskcraft.entity.User;
import com.taskcraft.entity.Workspace;
import com.taskcraft.entity.WorkspaceMember;
import com.taskcraft.repository.ProjectMemberRepository;
import com.taskcraft.repository.ProjectRepository;
import com.taskcraft.repository.SprintRepository;
import com.taskcraft.repository.TaskRepository;
import com.taskcraft.repository.UserRepository;
import com.taskcraft.repository.WorkspaceMemberRepository;
import com.taskcraft.repository.WorkspaceRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class SprintService {

    private final SprintRepository sprintRepository;
    private final TaskRepository taskRepository;
    private final ProjectRepository projectRepository;
    private final ProjectMemberRepository projectMemberRepository;
    private final WorkspaceRepository workspaceRepository;
    private final WorkspaceMemberRepository workspaceMemberRepository;
    private final UserRepository userRepository;
    private final ActivityService activityService;

    public SprintService(
            SprintRepository sprintRepository,
            TaskRepository taskRepository,
            ProjectRepository projectRepository,
            ProjectMemberRepository projectMemberRepository,
            WorkspaceRepository workspaceRepository,
            WorkspaceMemberRepository workspaceMemberRepository,
            UserRepository userRepository,
            ActivityService activityService
    ) {
        this.sprintRepository = sprintRepository;
        this.taskRepository = taskRepository;
        this.projectRepository = projectRepository;
        this.projectMemberRepository = projectMemberRepository;
        this.workspaceRepository = workspaceRepository;
        this.workspaceMemberRepository = workspaceMemberRepository;
        this.userRepository = userRepository;
        this.activityService = activityService;
    }

    @Transactional
    public SprintDtos.SprintResponse createSprint(
            String identifier,
            Long workspaceId,
            Long projectId,
            SprintDtos.CreateSprintRequest request
    ) {
        User user = findByIdentifier(identifier);
        Workspace workspace = workspaceRepository.findById(workspaceId)
                .orElseThrow(() -> new IllegalArgumentException("Workspace not found"));
        ensureWorkspaceMember(workspace, user);

        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new IllegalArgumentException("Project not found"));
        ensureProjectInWorkspace(project, workspace);
        ensureProjectMember(project, user);

        Instant now = Instant.now();

        Sprint sprint = new Sprint();
        sprint.setName(request.getName());
        sprint.setGoal(request.getGoal());
        sprint.setStatus(Sprint.SprintStatus.PLANNED);
        sprint.setStartDate(request.getStartDate());
        sprint.setEndDate(request.getEndDate());
        sprint.setProject(project);
        sprint.setCreatedAt(now);
        sprint.setUpdatedAt(now);

        sprintRepository.save(sprint);
        activityService.record(
                identifier,
                com.taskcraft.entity.ActivityLog.ActivityType.SPRINT_CREATED,
                workspaceId,
                projectId,
                sprint.getId(),
                null,
                "Created sprint: " + sprint.getName()
        );
        return toResponse(sprint);
    }

    @Transactional(readOnly = true)
    public List<SprintDtos.SprintResponse> getSprints(
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
        ensureProjectInWorkspace(project, workspace);
        ensureProjectMember(project, user);

        return sprintRepository.findByProject(project)
                .stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    @Transactional
    public SprintDtos.SprintResponse updateSprint(
            String identifier,
            Long workspaceId,
            Long projectId,
            Long sprintId,
            SprintDtos.UpdateSprintRequest request
    ) {
        User user = findByIdentifier(identifier);
        Workspace workspace = workspaceRepository.findById(workspaceId)
                .orElseThrow(() -> new IllegalArgumentException("Workspace not found"));
        ensureWorkspaceMember(workspace, user);

        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new IllegalArgumentException("Project not found"));
        ensureProjectInWorkspace(project, workspace);
        ensureProjectMember(project, user);

        Sprint sprint = sprintRepository.findById(sprintId)
                .orElseThrow(() -> new IllegalArgumentException("Sprint not found"));
        ensureSprintInProject(sprint, project);

        sprint.setName(request.getName());
        sprint.setGoal(request.getGoal());
        sprint.setStartDate(request.getStartDate());
        sprint.setEndDate(request.getEndDate());
        sprint.setUpdatedAt(Instant.now());

        sprintRepository.save(sprint);
        activityService.record(
                identifier,
                com.taskcraft.entity.ActivityLog.ActivityType.SPRINT_STATUS_CHANGED,
                workspaceId,
                projectId,
                sprint.getId(),
                null,
                "Changed sprint status to " + sprint.getStatus() + " for sprint: " + sprint.getName()
        );
        return toResponse(sprint);
    }

    @Transactional
    public SprintDtos.SprintResponse updateSprintStatus(
            String identifier,
            Long workspaceId,
            Long projectId,
            Long sprintId,
            SprintDtos.UpdateSprintStatusRequest request
    ) {
        User user = findByIdentifier(identifier);
        Workspace workspace = workspaceRepository.findById(workspaceId)
                .orElseThrow(() -> new IllegalArgumentException("Workspace not found"));
        ensureWorkspaceMember(workspace, user);

        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new IllegalArgumentException("Project not found"));
        ensureProjectInWorkspace(project, workspace);
        ensureProjectMember(project, user);

        Sprint sprint = sprintRepository.findById(sprintId)
                .orElseThrow(() -> new IllegalArgumentException("Sprint not found"));
        ensureSprintInProject(sprint, project);

        sprint.setStatus(request.getStatus());
        sprint.setUpdatedAt(Instant.now());

        sprintRepository.save(sprint);
        return toResponse(sprint);
    }

    @Transactional
    public void deleteSprint(
            String identifier,
            Long workspaceId,
            Long projectId,
            Long sprintId
    ) {
        User user = findByIdentifier(identifier);
        Workspace workspace = workspaceRepository.findById(workspaceId)
                .orElseThrow(() -> new IllegalArgumentException("Workspace not found"));
        ensureWorkspaceMember(workspace, user);

        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new IllegalArgumentException("Project not found"));
        ensureProjectInWorkspace(project, workspace);
        ensureProjectMember(project, user);

        Sprint sprint = sprintRepository.findById(sprintId)
                .orElseThrow(() -> new IllegalArgumentException("Sprint not found"));
        ensureSprintInProject(sprint, project);

        // remove sprint assignment from tasks in this sprint
        List<Task> tasks = taskRepository.findByProject(project)
                .stream()
                .filter(t -> t.getSprint() != null && t.getSprint().getId().equals(sprint.getId()))
                .collect(Collectors.toList());
        for (Task task : tasks) {
            task.setSprint(null);
        }
        taskRepository.saveAll(tasks);

        sprintRepository.delete(sprint);
    }

    @Transactional
    public void assignTasksToSprint(
            String identifier,
            Long workspaceId,
            Long projectId,
            Long sprintId,
            SprintDtos.AssignTasksRequest request
    ) {
        User user = findByIdentifier(identifier);
        Workspace workspace = workspaceRepository.findById(workspaceId)
                .orElseThrow(() -> new IllegalArgumentException("Workspace not found"));
        ensureWorkspaceMember(workspace, user);

        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new IllegalArgumentException("Project not found"));
        ensureProjectInWorkspace(project, workspace);
        ensureProjectMember(project, user);

        Sprint sprint = sprintRepository.findById(sprintId)
                .orElseThrow(() -> new IllegalArgumentException("Sprint not found"));
        ensureSprintInProject(sprint, project);

        List<Task> tasks = taskRepository.findAllById(request.getTaskIds());
        Instant now = Instant.now();
        for (Task task : tasks) {
            if (!task.getProject().getId().equals(project.getId())) {
                continue;
            }
            task.setSprint(sprint);
            task.setUpdatedAt(now);
        }
        taskRepository.saveAll(tasks);
    }

    @Transactional
    public void removeTasksFromSprint(
            String identifier,
            Long workspaceId,
            Long projectId,
            Long sprintId,
            SprintDtos.AssignTasksRequest request
    ) {
        User user = findByIdentifier(identifier);
        Workspace workspace = workspaceRepository.findById(workspaceId)
                .orElseThrow(() -> new IllegalArgumentException("Workspace not found"));
        ensureWorkspaceMember(workspace, user);

        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new IllegalArgumentException("Project not found"));
        ensureProjectInWorkspace(project, workspace);
        ensureProjectMember(project, user);

        Sprint sprint = sprintRepository.findById(sprintId)
                .orElseThrow(() -> new IllegalArgumentException("Sprint not found"));
        ensureSprintInProject(sprint, project);

        List<Task> tasks = taskRepository.findAllById(request.getTaskIds());
        Instant now = Instant.now();
        for (Task task : tasks) {
            if (!task.getProject().getId().equals(project.getId())) {
                continue;
            }
            if (task.getSprint() != null && task.getSprint().getId().equals(sprint.getId())) {
                task.setSprint(null);
                task.setUpdatedAt(now);
            }
        }
        taskRepository.saveAll(tasks);
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

    private void ensureProjectMember(Project project, User user) {
        projectMemberRepository.findByProjectAndUser(project, user)
                .orElseThrow(() -> new IllegalArgumentException("You are not a member of this project"));
    }

    private void ensureProjectInWorkspace(Project project, Workspace workspace) {
        if (!project.getWorkspace().getId().equals(workspace.getId())) {
            throw new IllegalArgumentException("Project does not belong to this workspace");
        }
    }

    private void ensureSprintInProject(Sprint sprint, Project project) {
        if (!sprint.getProject().getId().equals(project.getId())) {
            throw new IllegalArgumentException("Sprint does not belong to this project");
        }
    }

    private SprintDtos.SprintResponse toResponse(Sprint sprint) {
        SprintDtos.SprintResponse dto = new SprintDtos.SprintResponse();
        dto.setId(sprint.getId());
        dto.setName(sprint.getName());
        dto.setGoal(sprint.getGoal());
        dto.setStatus(sprint.getStatus());
        dto.setStartDate(sprint.getStartDate());
        dto.setEndDate(sprint.getEndDate());
        dto.setProjectId(sprint.getProject().getId());
        return dto;
    }
}

