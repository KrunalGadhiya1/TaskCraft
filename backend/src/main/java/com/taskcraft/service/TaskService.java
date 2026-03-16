package com.taskcraft.service;

import com.taskcraft.dto.TaskDtos;
import com.taskcraft.entity.Project;
import com.taskcraft.entity.Task;
import com.taskcraft.entity.User;
import com.taskcraft.entity.Workspace;
import com.taskcraft.exception.ForbiddenException;
import com.taskcraft.repository.ProjectMemberRepository;
import com.taskcraft.repository.ProjectRepository;
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
public class TaskService {

    private final TaskRepository taskRepository;
    private final ProjectRepository projectRepository;
    private final ProjectMemberRepository projectMemberRepository;
    private final WorkspaceRepository workspaceRepository;
    private final WorkspaceMemberRepository workspaceMemberRepository;
    private final UserRepository userRepository;
    private final NotificationService notificationService;
    private final ActivityService activityService;

    public TaskService(
            TaskRepository taskRepository,
            ProjectRepository projectRepository,
            ProjectMemberRepository projectMemberRepository,
            WorkspaceRepository workspaceRepository,
            WorkspaceMemberRepository workspaceMemberRepository,
            UserRepository userRepository,
            NotificationService notificationService,
            ActivityService activityService
    ) {
        this.taskRepository = taskRepository;
        this.projectRepository = projectRepository;
        this.projectMemberRepository = projectMemberRepository;
        this.workspaceRepository = workspaceRepository;
        this.workspaceMemberRepository = workspaceMemberRepository;
        this.userRepository = userRepository;
        this.notificationService = notificationService;
        this.activityService = activityService;
    }

    @Transactional
    public TaskDtos.TaskResponse createTask(
            String identifier,
            Long workspaceId,
            Long projectId,
            TaskDtos.CreateTaskRequest request
    ) {
        User reporter = findByIdentifier(identifier);
        Workspace workspace = workspaceRepository.findById(workspaceId)
                .orElseThrow(() -> new IllegalArgumentException("Workspace not found"));
        ensureWorkspaceMember(workspace, reporter);

        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new IllegalArgumentException("Project not found"));
        ensureProjectInWorkspace(project, workspace);
        ensureProjectMember(project, reporter);

        Instant now = Instant.now();

        Integer maxSeq = taskRepository.findMaxIssueSeqForProject(project.getId());
        int nextSeq = (maxSeq == null ? 0 : maxSeq) + 1;
        String projectKey = project.getKey() != null && !project.getKey().isBlank() ? project.getKey().trim().toUpperCase() : "PROJ";

        Task task = new Task();
        task.setIssueSeq(nextSeq);
        task.setIssueKey(projectKey + "-" + nextSeq);
        task.setTitle(request.getTitle());
        task.setDescription(request.getDescription());
        task.setType(request.getType());
        task.setPriority(request.getPriority());
        task.setStatus(Task.TaskStatus.BACKLOG);
        task.setStoryPoints(request.getStoryPoints());
        task.setDueDate(request.getDueDate());
        task.setProject(project);
        task.setReporter(reporter);
        task.setCreatedAt(now);
        task.setUpdatedAt(now);

        if (request.getAssigneeIdentifier() != null && !request.getAssigneeIdentifier().isEmpty()) {
            User assignee = findByIdentifier(request.getAssigneeIdentifier());
            ensureProjectMember(project, assignee);
            task.setAssignee(assignee);
        }

        taskRepository.save(task);

        if (task.getAssignee() != null) {
            notificationService.notifyTaskAssigned(task, task.getAssignee());
        }

        activityService.record(
                identifier,
                com.taskcraft.entity.ActivityLog.ActivityType.TASK_CREATED,
                workspaceId,
                projectId,
                null,
                task.getId(),
                "Created task: " + task.getTitle()
        );
        return toResponse(task);
    }

    @Transactional(readOnly = true)
    public List<TaskDtos.TaskResponse> getTasks(
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

        return taskRepository.findByProject(project)
                .stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public TaskDtos.TaskResponse getTask(
            String identifier,
            Long workspaceId,
            Long projectId,
            Long taskId
    ) {
        User user = findByIdentifier(identifier);
        Workspace workspace = workspaceRepository.findById(workspaceId)
                .orElseThrow(() -> new IllegalArgumentException("Workspace not found"));
        ensureWorkspaceMember(workspace, user);

        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new IllegalArgumentException("Project not found"));
        ensureProjectInWorkspace(project, workspace);
        ensureProjectMember(project, user);

        Task task = taskRepository.findById(taskId)
                .orElseThrow(() -> new IllegalArgumentException("Task not found"));
        if (!task.getProject().getId().equals(project.getId())) {
            throw new IllegalArgumentException("Task does not belong to this project");
        }

        return toResponse(task);
    }

    @Transactional
    public TaskDtos.TaskResponse updateTask(
            String identifier,
            Long workspaceId,
            Long projectId,
            Long taskId,
            TaskDtos.UpdateTaskRequest request
    ) {
        User user = findByIdentifier(identifier);
        Workspace workspace = workspaceRepository.findById(workspaceId)
                .orElseThrow(() -> new IllegalArgumentException("Workspace not found"));
        ensureWorkspaceMember(workspace, user);

        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new IllegalArgumentException("Project not found"));
        ensureProjectInWorkspace(project, workspace);
        ensureProjectMember(project, user);

        Task task = taskRepository.findById(taskId)
                .orElseThrow(() -> new IllegalArgumentException("Task not found"));
        if (!task.getProject().getId().equals(project.getId())) {
            throw new IllegalArgumentException("Task does not belong to this project");
        }

        task.setTitle(request.getTitle());
        task.setDescription(request.getDescription());
        task.setType(request.getType());
        task.setPriority(request.getPriority());
        task.setStoryPoints(request.getStoryPoints());
        task.setDueDate(request.getDueDate());
        task.setUpdatedAt(Instant.now());

        taskRepository.save(task);
        activityService.record(
                identifier,
                com.taskcraft.entity.ActivityLog.ActivityType.TASK_UPDATED,
                workspaceId,
                projectId,
                null,
                task.getId(),
                "Updated task: " + task.getTitle()
        );
        return toResponse(task);
    }

    @Transactional
    public TaskDtos.TaskResponse updateStatus(
            String identifier,
            Long workspaceId,
            Long projectId,
            Long taskId,
            TaskDtos.UpdateTaskStatusRequest request
    ) {
        User user = findByIdentifier(identifier);
        Workspace workspace = workspaceRepository.findById(workspaceId)
                .orElseThrow(() -> new IllegalArgumentException("Workspace not found"));
        ensureWorkspaceMember(workspace, user);

        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new IllegalArgumentException("Project not found"));
        ensureProjectInWorkspace(project, workspace);
        ensureProjectMember(project, user);

        Task task = taskRepository.findById(taskId)
                .orElseThrow(() -> new IllegalArgumentException("Task not found"));
        if (!task.getProject().getId().equals(project.getId())) {
            throw new IllegalArgumentException("Task does not belong to this project");
        }

        task.setStatus(request.getStatus());
        task.setUpdatedAt(Instant.now());

        taskRepository.save(task);
        notificationService.notifyTaskStatusChanged(task, user);
        activityService.record(
                identifier,
                com.taskcraft.entity.ActivityLog.ActivityType.TASK_STATUS_CHANGED,
                workspaceId,
                projectId,
                null,
                task.getId(),
                "Changed status to " + task.getStatus() + " for task: " + task.getTitle()
        );
        return toResponse(task);
    }

    @Transactional
    public TaskDtos.TaskResponse updateAssignee(
            String identifier,
            Long workspaceId,
            Long projectId,
            Long taskId,
            TaskDtos.UpdateTaskAssigneeRequest request
    ) {
        User user = findByIdentifier(identifier);
        Workspace workspace = workspaceRepository.findById(workspaceId)
                .orElseThrow(() -> new IllegalArgumentException("Workspace not found"));
        ensureWorkspaceMember(workspace, user);

        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new IllegalArgumentException("Project not found"));
        ensureProjectInWorkspace(project, workspace);
        ensureProjectMember(project, user);

        Task task = taskRepository.findById(taskId)
                .orElseThrow(() -> new IllegalArgumentException("Task not found"));
        if (!task.getProject().getId().equals(project.getId())) {
            throw new IllegalArgumentException("Task does not belong to this project");
        }

        User previousAssignee = task.getAssignee();

        if (request.getAssigneeIdentifier() == null || request.getAssigneeIdentifier().isEmpty()) {
            task.setAssignee(null);
        } else {
            User assignee = findByIdentifier(request.getAssigneeIdentifier());
            ensureProjectMember(project, assignee);
            task.setAssignee(assignee);
        }

        task.setUpdatedAt(Instant.now());

        taskRepository.save(task);

        if (task.getAssignee() != null
                && (previousAssignee == null || !previousAssignee.getId().equals(task.getAssignee().getId()))) {
            notificationService.notifyTaskAssigned(task, task.getAssignee());
        }

        activityService.record(
                identifier,
                com.taskcraft.entity.ActivityLog.ActivityType.TASK_ASSIGNEE_CHANGED,
                workspaceId,
                projectId,
                null,
                task.getId(),
                "Changed assignee for task: " + task.getTitle()
        );

        return toResponse(task);
    }

    @Transactional
    public void deleteTask(
            String identifier,
            Long workspaceId,
            Long projectId,
            Long taskId
    ) {
        User user = findByIdentifier(identifier);
        Workspace workspace = workspaceRepository.findById(workspaceId)
                .orElseThrow(() -> new IllegalArgumentException("Workspace not found"));
        ensureWorkspaceMember(workspace, user);

        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new IllegalArgumentException("Project not found"));
        ensureProjectInWorkspace(project, workspace);
        ensureProjectMember(project, user);

        Task task = taskRepository.findById(taskId)
                .orElseThrow(() -> new IllegalArgumentException("Task not found"));
        if (!task.getProject().getId().equals(project.getId())) {
            throw new IllegalArgumentException("Task does not belong to this project");
        }

        taskRepository.delete(task);
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

    private void ensureProjectInWorkspace(Project project, Workspace workspace) {
        if (!project.getWorkspace().getId().equals(workspace.getId())) {
            throw new IllegalArgumentException("Project does not belong to this workspace");
        }
    }

    private TaskDtos.TaskResponse toResponse(Task task) {
        TaskDtos.TaskResponse dto = new TaskDtos.TaskResponse();
        dto.setId(task.getId());
        dto.setIssueKey(task.getIssueKey());
        dto.setIssueSeq(task.getIssueSeq());
        dto.setTitle(task.getTitle());
        dto.setDescription(task.getDescription());
        dto.setType(task.getType());
        dto.setStatus(task.getStatus());
        dto.setPriority(task.getPriority());
        dto.setStoryPoints(task.getStoryPoints());
        dto.setDueDate(task.getDueDate());
        dto.setProjectId(task.getProject().getId());
        dto.setSprintId(task.getSprint() != null ? task.getSprint().getId() : null);
        dto.setReporterId(task.getReporter().getId());
        dto.setAssigneeId(task.getAssignee() != null ? task.getAssignee().getId() : null);
        return dto;
    }
}

