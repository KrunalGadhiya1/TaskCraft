package com.taskcraft.service;

import com.taskcraft.dto.DashboardDtos;
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

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class DashboardService {

    private final TaskRepository taskRepository;
    private final ProjectRepository projectRepository;
    private final WorkspaceRepository workspaceRepository;
    private final WorkspaceMemberRepository workspaceMemberRepository;
    private final ProjectMemberRepository projectMemberRepository;
    private final UserRepository userRepository;

    public DashboardService(
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
    public DashboardDtos.ProjectSummaryResponse getProjectSummary(
            String identifier,
            Long workspaceId,
            Long projectId
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

        Map<String, Long> byStatus = toCountMap(taskRepository.countByStatusForProject(projectId));
        Map<String, Long> byPriority = toCountMap(taskRepository.countByPriorityForProject(projectId));

        long total = byStatus.values().stream().mapToLong(Long::longValue).sum();
        long done = byStatus.getOrDefault(Task.TaskStatus.DONE.name(), 0L);

        DashboardDtos.ProjectSummaryResponse dto = new DashboardDtos.ProjectSummaryResponse();
        dto.setProjectId(projectId);
        dto.setTasksByStatus(byStatus);
        dto.setTasksByPriority(byPriority);
        dto.setTotalTasks(total);
        dto.setDoneTasks(done);
        return dto;
    }

    private Map<String, Long> toCountMap(List<Object[]> rows) {
        Map<String, Long> map = new HashMap<>();
        for (Object[] row : rows) {
            Object k = row[0];
            Object v = row[1];
            map.put(String.valueOf(k), ((Number) v).longValue());
        }
        return map;
    }

    private User findByIdentifier(String identifier) {
        if (identifier.contains("@")) {
            return userRepository.findByEmail(identifier.toLowerCase())
                    .orElseThrow(() -> new IllegalArgumentException("User not found"));
        }
        return userRepository.findByUsername(identifier)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));
    }
}

