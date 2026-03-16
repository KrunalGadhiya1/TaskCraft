package com.taskcraft.controller;

import com.taskcraft.dto.TaskCollaborationDtos;
import com.taskcraft.service.TaskCollaborationService;
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
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/api/workspaces/{workspaceId}/projects/{projectId}/tasks/{taskId}")
public class TaskCollaborationController {

    private final TaskCollaborationService collaborationService;

    public TaskCollaborationController(TaskCollaborationService collaborationService) {
        this.collaborationService = collaborationService;
    }

    // Comments

    @PostMapping("/comments")
    public TaskCollaborationDtos.CommentResponse addComment(
            Authentication authentication,
            @PathVariable Long workspaceId,
            @PathVariable Long projectId,
            @PathVariable Long taskId,
            @Valid @RequestBody TaskCollaborationDtos.CreateCommentRequest request
    ) {
        String identifier = authentication.getName();
        return collaborationService.addComment(identifier, workspaceId, projectId, taskId, request);
    }

    @GetMapping("/comments")
    public List<TaskCollaborationDtos.CommentResponse> getComments(
            Authentication authentication,
            @PathVariable Long workspaceId,
            @PathVariable Long projectId,
            @PathVariable Long taskId
    ) {
        String identifier = authentication.getName();
        return collaborationService.getComments(identifier, workspaceId, projectId, taskId);
    }

    @PutMapping("/comments/{commentId}")
    public TaskCollaborationDtos.CommentResponse updateComment(
            Authentication authentication,
            @PathVariable Long workspaceId,
            @PathVariable Long projectId,
            @PathVariable Long taskId,
            @PathVariable Long commentId,
            @Valid @RequestBody TaskCollaborationDtos.UpdateCommentRequest request
    ) {
        String identifier = authentication.getName();
        return collaborationService.updateComment(identifier, workspaceId, projectId, taskId, commentId, request);
    }

    @DeleteMapping("/comments/{commentId}")
    public void deleteComment(
            Authentication authentication,
            @PathVariable Long workspaceId,
            @PathVariable Long projectId,
            @PathVariable Long taskId,
            @PathVariable Long commentId
    ) {
        String identifier = authentication.getName();
        collaborationService.deleteComment(identifier, workspaceId, projectId, taskId, commentId);
    }

    // Attachments (metadata only)

    @PostMapping("/attachments")
    public TaskCollaborationDtos.AttachmentResponse addAttachment(
            Authentication authentication,
            @PathVariable Long workspaceId,
            @PathVariable Long projectId,
            @PathVariable Long taskId,
            @Valid @RequestBody TaskCollaborationDtos.CreateAttachmentRequest request
    ) {
        String identifier = authentication.getName();
        return collaborationService.addAttachment(identifier, workspaceId, projectId, taskId, request);
    }

    @PostMapping(value = "/attachments/upload", consumes = "multipart/form-data")
    public TaskCollaborationDtos.AttachmentResponse uploadAttachment(
            Authentication authentication,
            @PathVariable Long workspaceId,
            @PathVariable Long projectId,
            @PathVariable Long taskId,
            @RequestPart("file") MultipartFile file
    ) {
        String identifier = authentication.getName();
        return collaborationService.uploadAttachment(identifier, workspaceId, projectId, taskId, file);
    }

    @GetMapping("/attachments")
    public List<TaskCollaborationDtos.AttachmentResponse> getAttachments(
            Authentication authentication,
            @PathVariable Long workspaceId,
            @PathVariable Long projectId,
            @PathVariable Long taskId
    ) {
        String identifier = authentication.getName();
        return collaborationService.getAttachments(identifier, workspaceId, projectId, taskId);
    }

    @DeleteMapping("/attachments/{attachmentId}")
    public void deleteAttachment(
            Authentication authentication,
            @PathVariable Long workspaceId,
            @PathVariable Long projectId,
            @PathVariable Long taskId,
            @PathVariable Long attachmentId
    ) {
        String identifier = authentication.getName();
        collaborationService.deleteAttachment(identifier, workspaceId, projectId, taskId, attachmentId);
    }
}

