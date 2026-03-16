package com.taskcraft.service;

import com.taskcraft.dto.TaskCollaborationDtos;
import com.taskcraft.entity.Project;
import com.taskcraft.entity.Task;
import com.taskcraft.entity.TaskAttachment;
import com.taskcraft.entity.TaskComment;
import com.taskcraft.entity.User;
import com.taskcraft.entity.Workspace;
import com.taskcraft.repository.ProjectMemberRepository;
import com.taskcraft.repository.ProjectRepository;
import com.taskcraft.repository.TaskAttachmentRepository;
import com.taskcraft.repository.TaskCommentRepository;
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
public class TaskCollaborationService {

    private final TaskRepository taskRepository;
    private final TaskCommentRepository commentRepository;
    private final TaskAttachmentRepository attachmentRepository;
    private final ProjectRepository projectRepository;
    private final ProjectMemberRepository projectMemberRepository;
    private final WorkspaceRepository workspaceRepository;
    private final WorkspaceMemberRepository workspaceMemberRepository;
    private final UserRepository userRepository;
    private final NotificationService notificationService;
    private final ActivityService activityService;
    private final FileStorageService fileStorageService;

    public TaskCollaborationService(
            TaskRepository taskRepository,
            TaskCommentRepository commentRepository,
            TaskAttachmentRepository attachmentRepository,
            ProjectRepository projectRepository,
            ProjectMemberRepository projectMemberRepository,
            WorkspaceRepository workspaceRepository,
            WorkspaceMemberRepository workspaceMemberRepository,
            UserRepository userRepository,
            NotificationService notificationService,
            ActivityService activityService,
            FileStorageService fileStorageService
    ) {
        this.taskRepository = taskRepository;
        this.commentRepository = commentRepository;
        this.attachmentRepository = attachmentRepository;
        this.projectRepository = projectRepository;
        this.projectMemberRepository = projectMemberRepository;
        this.workspaceRepository = workspaceRepository;
        this.workspaceMemberRepository = workspaceMemberRepository;
        this.userRepository = userRepository;
        this.notificationService = notificationService;
        this.activityService = activityService;
        this.fileStorageService = fileStorageService;
    }

    // Comments

    @Transactional
    public TaskCollaborationDtos.CommentResponse addComment(
            String identifier,
            Long workspaceId,
            Long projectId,
            Long taskId,
            TaskCollaborationDtos.CreateCommentRequest request
    ) {
        User author = findByIdentifier(identifier);
        Task task = loadAndAuthorizeTask(author, workspaceId, projectId, taskId);

        Instant now = Instant.now();

        TaskComment comment = new TaskComment();
        comment.setTask(task);
        comment.setAuthor(author);
        comment.setContent(request.getContent());
        comment.setCreatedAt(now);
        comment.setUpdatedAt(now);

        commentRepository.save(comment);
        notificationService.notifyTaskCommented(task, author);
        activityService.record(
                identifier,
                com.taskcraft.entity.ActivityLog.ActivityType.TASK_COMMENTED,
                workspaceId,
                projectId,
                null,
                taskId,
                "Commented on task: " + task.getTitle()
        );
        return toCommentResponse(comment);
    }

    @Transactional(readOnly = true)
    public List<TaskCollaborationDtos.CommentResponse> getComments(
            String identifier,
            Long workspaceId,
            Long projectId,
            Long taskId
    ) {
        User user = findByIdentifier(identifier);
        Task task = loadAndAuthorizeTask(user, workspaceId, projectId, taskId);

        return commentRepository.findByTaskOrderByCreatedAtAsc(task)
                .stream()
                .map(this::toCommentResponse)
                .collect(Collectors.toList());
    }

    @Transactional
    public TaskCollaborationDtos.CommentResponse updateComment(
            String identifier,
            Long workspaceId,
            Long projectId,
            Long taskId,
            Long commentId,
            TaskCollaborationDtos.UpdateCommentRequest request
    ) {
        User user = findByIdentifier(identifier);
        Task task = loadAndAuthorizeTask(user, workspaceId, projectId, taskId);

        TaskComment comment = commentRepository.findById(commentId)
                .orElseThrow(() -> new IllegalArgumentException("Comment not found"));
        if (!comment.getTask().getId().equals(task.getId())) {
            throw new IllegalArgumentException("Comment does not belong to this task");
        }
        if (!comment.getAuthor().getId().equals(user.getId())) {
            throw new IllegalArgumentException("You can only edit your own comments");
        }

        comment.setContent(request.getContent());
        comment.setUpdatedAt(Instant.now());

        commentRepository.save(comment);
        return toCommentResponse(comment);
    }

    @Transactional
    public void deleteComment(
            String identifier,
            Long workspaceId,
            Long projectId,
            Long taskId,
            Long commentId
    ) {
        User user = findByIdentifier(identifier);
        Task task = loadAndAuthorizeTask(user, workspaceId, projectId, taskId);

        TaskComment comment = commentRepository.findById(commentId)
                .orElseThrow(() -> new IllegalArgumentException("Comment not found"));
        if (!comment.getTask().getId().equals(task.getId())) {
            throw new IllegalArgumentException("Comment does not belong to this task");
        }
        if (!comment.getAuthor().getId().equals(user.getId())) {
            throw new IllegalArgumentException("You can only delete your own comments");
        }

        commentRepository.delete(comment);
    }

    // Attachments (metadata only: URL, fileName, etc.)

    @Transactional
    public TaskCollaborationDtos.AttachmentResponse addAttachment(
            String identifier,
            Long workspaceId,
            Long projectId,
            Long taskId,
            TaskCollaborationDtos.CreateAttachmentRequest request
    ) {
        User uploader = findByIdentifier(identifier);
        Task task = loadAndAuthorizeTask(uploader, workspaceId, projectId, taskId);

        Instant now = Instant.now();

        TaskAttachment attachment = new TaskAttachment();
        attachment.setTask(task);
        attachment.setUploadedBy(uploader);
        attachment.setFileName(request.getFileName());
        attachment.setUrl(request.getUrl());
        attachment.setContentType(request.getContentType());
        attachment.setSizeBytes(request.getSizeBytes());
        attachment.setCreatedAt(now);

        attachmentRepository.save(attachment);
        notificationService.notifyTaskAttachmentAdded(task, uploader);
        activityService.record(
                identifier,
                com.taskcraft.entity.ActivityLog.ActivityType.TASK_ATTACHMENT_ADDED,
                workspaceId,
                projectId,
                null,
                taskId,
                "Added attachment to task: " + task.getTitle()
        );
        return toAttachmentResponse(attachment);
    }

    @Transactional
    public TaskCollaborationDtos.AttachmentResponse uploadAttachment(
            String identifier,
            Long workspaceId,
            Long projectId,
            Long taskId,
            org.springframework.web.multipart.MultipartFile file
    ) {
        User uploader = findByIdentifier(identifier);
        loadAndAuthorizeTask(uploader, workspaceId, projectId, taskId);

        FileStorageService.StoredFile stored = fileStorageService.store(file);

        TaskCollaborationDtos.CreateAttachmentRequest req = new TaskCollaborationDtos.CreateAttachmentRequest();
        req.setFileName(stored.getOriginalFileName() != null ? stored.getOriginalFileName() : stored.getStoredFileName());
        req.setUrl("/uploads/" + stored.getStoredFileName());
        req.setContentType(stored.getContentType());
        req.setSizeBytes(stored.getSizeBytes());

        return addAttachment(identifier, workspaceId, projectId, taskId, req);
    }

    @Transactional(readOnly = true)
    public List<TaskCollaborationDtos.AttachmentResponse> getAttachments(
            String identifier,
            Long workspaceId,
            Long projectId,
            Long taskId
    ) {
        User user = findByIdentifier(identifier);
        Task task = loadAndAuthorizeTask(user, workspaceId, projectId, taskId);

        return attachmentRepository.findByTask(task)
                .stream()
                .map(this::toAttachmentResponse)
                .collect(Collectors.toList());
    }

    @Transactional
    public void deleteAttachment(
            String identifier,
            Long workspaceId,
            Long projectId,
            Long taskId,
            Long attachmentId
    ) {
        User user = findByIdentifier(identifier);
        Task task = loadAndAuthorizeTask(user, workspaceId, projectId, taskId);

        TaskAttachment attachment = attachmentRepository.findById(attachmentId)
                .orElseThrow(() -> new IllegalArgumentException("Attachment not found"));
        if (!attachment.getTask().getId().equals(task.getId())) {
            throw new IllegalArgumentException("Attachment does not belong to this task");
        }
        if (!attachment.getUploadedBy().getId().equals(user.getId())) {
            throw new IllegalArgumentException("You can only delete your own attachments");
        }

        attachmentRepository.delete(attachment);
    }

    // Helpers

    private Task loadAndAuthorizeTask(User user, Long workspaceId, Long projectId, Long taskId) {
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
        return task;
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

    private TaskCollaborationDtos.CommentResponse toCommentResponse(TaskComment comment) {
        TaskCollaborationDtos.CommentResponse dto = new TaskCollaborationDtos.CommentResponse();
        dto.setId(comment.getId());
        dto.setAuthorId(comment.getAuthor().getId());
        dto.setAuthorUsername(comment.getAuthor().getUsername());
        dto.setContent(comment.getContent());
        dto.setCreatedAt(comment.getCreatedAt());
        dto.setUpdatedAt(comment.getUpdatedAt());
        return dto;
    }

    private TaskCollaborationDtos.AttachmentResponse toAttachmentResponse(TaskAttachment attachment) {
        TaskCollaborationDtos.AttachmentResponse dto = new TaskCollaborationDtos.AttachmentResponse();
        dto.setId(attachment.getId());
        dto.setUploadedById(attachment.getUploadedBy().getId());
        dto.setUploadedByUsername(attachment.getUploadedBy().getUsername());
        dto.setFileName(attachment.getFileName());
        dto.setUrl(attachment.getUrl());
        dto.setContentType(attachment.getContentType());
        dto.setSizeBytes(attachment.getSizeBytes());
        dto.setCreatedAt(attachment.getCreatedAt());
        return dto;
    }
}

