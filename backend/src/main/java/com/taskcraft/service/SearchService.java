package com.taskcraft.service;

import com.taskcraft.dto.TaskDtos;
import com.taskcraft.entity.Project;
import com.taskcraft.entity.Task;
import com.taskcraft.entity.User;
import com.taskcraft.entity.Workspace;
import com.taskcraft.repository.ProjectMemberRepository;
import com.taskcraft.repository.ProjectRepository;
import com.taskcraft.repository.TaskRepository;
import com.taskcraft.repository.UserRepository;
import com.taskcraft.repository.WorkspaceMemberRepository;
import com.taskcraft.repository.WorkspaceRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class SearchService {

    private final TaskRepository taskRepository;
    private final ProjectRepository projectRepository;
    private final WorkspaceRepository workspaceRepository;
    private final WorkspaceMemberRepository workspaceMemberRepository;
    private final ProjectMemberRepository projectMemberRepository;
    private final UserRepository userRepository;

    public SearchService(
            TaskRepository taskRepository,
            ProjectRepository projectRepository,
            WorkspaceRepository workspaceRepository,
            WorkspaceMemberRepository workspaceMemberRepository,
            ProjectMemberRepository projectMemberRepository,
            UserRepository userRepository
    ) {
        this.taskRepository = taskRepository;
        this.projectRepository = projectRepository;
        this.workspaceRepository = workspaceRepository;
        this.workspaceMemberRepository = workspaceMemberRepository;
        this.projectMemberRepository = projectMemberRepository;
        this.userRepository = userRepository;
    }

    @Transactional(readOnly = true)
    public List<TaskDtos.TaskResponse> searchTasks(
            String identifier,
            Long workspaceId,
            Long projectId,
            String q,
            Task.TaskStatus status,
            Task.TaskPriority priority
    ) {
        User user = findByIdentifier(identifier);
        Workspace workspace = workspaceRepository.findById(workspaceId)
                .orElseThrow(() -> new IllegalArgumentException("Workspace not found"));
        workspaceMemberRepository.findByWorkspaceAndUser(workspace, user)
                .orElseThrow(() -> new IllegalArgumentException("You are not a member of this workspace"));

        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new IllegalArgumentException("Project not found"));
        if (!project.getWorkspace().getId().equals(workspace.getId())) {
            throw new IllegalArgumentException("Project does not belong to this workspace");
        }
        projectMemberRepository.findByProjectAndUser(project, user)
                .orElseThrow(() -> new IllegalArgumentException("You are not a member of this project"));

        String normalizedQ = (q == null || q.isBlank()) ? null : q.trim();
        List<Task> results = taskRepository.searchTasks(projectId, normalizedQ, status, priority);
        return results.stream().map(this::toResponse).collect(Collectors.toList());
    }

    private User findByIdentifier(String identifier) {
        if (identifier.contains("@")) {
            return userRepository.findByEmail(identifier.toLowerCase())
                    .orElseThrow(() -> new IllegalArgumentException("User not found"));
        }
        return userRepository.findByUsername(identifier)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));
    }

    private TaskDtos.TaskResponse toResponse(Task task) {
        TaskDtos.TaskResponse dto = new TaskDtos.TaskResponse();
        dto.setId(task.getId());
        dto.setTitle(task.getTitle());
        dto.setDescription(task.getDescription());
        dto.setType(task.getType());
        dto.setStatus(task.getStatus());
        dto.setPriority(task.getPriority());
        dto.setStoryPoints(task.getStoryPoints());
        dto.setDueDate(task.getDueDate());
        dto.setProjectId(task.getProject().getId());
        dto.setSprintId(task.getSprint() == null ? null : task.getSprint().getId());
        dto.setReporterId(task.getReporter().getId());
        dto.setAssigneeId(task.getAssignee() == null ? null : task.getAssignee().getId());
        return dto;
    }
}

