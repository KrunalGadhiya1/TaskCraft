package com.taskcraft.repository;

import com.taskcraft.entity.ActivityLog;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ActivityLogRepository extends JpaRepository<ActivityLog, Long> {

    List<ActivityLog> findByProjectIdOrderByCreatedAtDesc(Long projectId);

    List<ActivityLog> findByTaskIdOrderByCreatedAtDesc(Long taskId);

    List<ActivityLog> findByWorkspaceIdOrderByCreatedAtDesc(Long workspaceId);
}

