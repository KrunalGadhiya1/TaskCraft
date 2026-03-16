package com.taskcraft.controller;

import com.taskcraft.dto.TaskDtos;
import com.taskcraft.service.TaskService;
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
@RequestMapping("/api/workspaces/{workspaceId}/projects/{projectId}/tasks")
public class TaskController {

    private final TaskService taskService;

    public TaskController(TaskService taskService) {
        this.taskService = taskService;
    }

    @PostMapping
    public TaskDtos.TaskResponse createTask(
            Authentication authentication,
            @PathVariable Long workspaceId,
            @PathVariable Long projectId,
            @Valid @RequestBody TaskDtos.CreateTaskRequest request
    ) {
        String identifier = authentication.getName();
        return taskService.createTask(identifier, workspaceId, projectId, request);
    }

    @GetMapping
    public List<TaskDtos.TaskResponse> getTasks(
            Authentication authentication,
            @PathVariable Long workspaceId,
            @PathVariable Long projectId
    ) {
        String identifier = authentication.getName();
        return taskService.getTasks(identifier, workspaceId, projectId);
    }

    @GetMapping("/{taskId}")
    public TaskDtos.TaskResponse getTask(
            Authentication authentication,
            @PathVariable Long workspaceId,
            @PathVariable Long projectId,
            @PathVariable Long taskId
    ) {
        String identifier = authentication.getName();
        return taskService.getTask(identifier, workspaceId, projectId, taskId);
    }

    @PutMapping("/{taskId}")
    public TaskDtos.TaskResponse updateTask(
            Authentication authentication,
            @PathVariable Long workspaceId,
            @PathVariable Long projectId,
            @PathVariable Long taskId,
            @Valid @RequestBody TaskDtos.UpdateTaskRequest request
    ) {
        String identifier = authentication.getName();
        return taskService.updateTask(identifier, workspaceId, projectId, taskId, request);
    }

    @PutMapping("/{taskId}/status")
    public TaskDtos.TaskResponse updateStatus(
            Authentication authentication,
            @PathVariable Long workspaceId,
            @PathVariable Long projectId,
            @PathVariable Long taskId,
            @Valid @RequestBody TaskDtos.UpdateTaskStatusRequest request
    ) {
        String identifier = authentication.getName();
        return taskService.updateStatus(identifier, workspaceId, projectId, taskId, request);
    }

    @PutMapping("/{taskId}/assignee")
    public TaskDtos.TaskResponse updateAssignee(
            Authentication authentication,
            @PathVariable Long workspaceId,
            @PathVariable Long projectId,
            @PathVariable Long taskId,
            @Valid @RequestBody TaskDtos.UpdateTaskAssigneeRequest request
    ) {
        String identifier = authentication.getName();
        return taskService.updateAssignee(identifier, workspaceId, projectId, taskId, request);
    }

    @DeleteMapping("/{taskId}")
    public void deleteTask(
            Authentication authentication,
            @PathVariable Long workspaceId,
            @PathVariable Long projectId,
            @PathVariable Long taskId
    ) {
        String identifier = authentication.getName();
        taskService.deleteTask(identifier, workspaceId, projectId, taskId);
    }
}

