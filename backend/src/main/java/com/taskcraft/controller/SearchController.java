package com.taskcraft.controller;

import com.taskcraft.dto.TaskDtos;
import com.taskcraft.entity.Task;
import com.taskcraft.service.SearchService;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/workspaces/{workspaceId}/projects/{projectId}/search")
public class SearchController {

    private final SearchService searchService;

    public SearchController(SearchService searchService) {
        this.searchService = searchService;
    }

    @GetMapping("/tasks")
    public List<TaskDtos.TaskResponse> searchTasks(
            Authentication authentication,
            @PathVariable Long workspaceId,
            @PathVariable Long projectId,
            @RequestParam(required = false) String q,
            @RequestParam(required = false) Task.TaskStatus status,
            @RequestParam(required = false) Task.TaskPriority priority
    ) {
        String identifier = authentication.getName();
        return searchService.searchTasks(identifier, workspaceId, projectId, q, status, priority);
    }
}

