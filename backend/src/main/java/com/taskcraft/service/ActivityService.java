package com.taskcraft.service;

import com.taskcraft.dto.ActivityDtos;
import com.taskcraft.entity.ActivityLog;
import com.taskcraft.entity.User;
import com.taskcraft.repository.ActivityLogRepository;
import com.taskcraft.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class ActivityService {

    private final ActivityLogRepository activityLogRepository;
    private final UserRepository userRepository;

    public ActivityService(ActivityLogRepository activityLogRepository, UserRepository userRepository) {
        this.activityLogRepository = activityLogRepository;
        this.userRepository = userRepository;
    }

    @Transactional
    public void record(
            String actorIdentifier,
            ActivityLog.ActivityType type,
            Long workspaceId,
            Long projectId,
            Long sprintId,
            Long taskId,
            String message
    ) {
        User actor = findByIdentifier(actorIdentifier);

        ActivityLog log = new ActivityLog();
        log.setActor(actor);
        log.setType(type);
        log.setWorkspaceId(workspaceId);
        log.setProjectId(projectId);
        log.setSprintId(sprintId);
        log.setTaskId(taskId);
        log.setMessage(message);
        log.setCreatedAt(Instant.now());

        activityLogRepository.save(log);
    }

    @Transactional(readOnly = true)
    public List<ActivityDtos.ActivityResponse> getByWorkspace(Long workspaceId) {
        return activityLogRepository.findByWorkspaceIdOrderByCreatedAtDesc(workspaceId)
                .stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<ActivityDtos.ActivityResponse> getByProject(Long projectId) {
        return activityLogRepository.findByProjectIdOrderByCreatedAtDesc(projectId)
                .stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<ActivityDtos.ActivityResponse> getByTask(Long taskId) {
        return activityLogRepository.findByTaskIdOrderByCreatedAtDesc(taskId)
                .stream()
                .map(this::toResponse)
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

    private ActivityDtos.ActivityResponse toResponse(ActivityLog log) {
        ActivityDtos.ActivityResponse dto = new ActivityDtos.ActivityResponse();
        dto.setId(log.getId());
        dto.setActorId(log.getActor().getId());
        dto.setActorUsername(log.getActor().getUsername());
        dto.setType(log.getType());
        dto.setWorkspaceId(log.getWorkspaceId());
        dto.setProjectId(log.getProjectId());
        dto.setSprintId(log.getSprintId());
        dto.setTaskId(log.getTaskId());
        dto.setMessage(log.getMessage());
        dto.setCreatedAt(log.getCreatedAt());
        return dto;
    }
}

