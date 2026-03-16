package com.taskcraft.repository;

import com.taskcraft.entity.Task;
import com.taskcraft.entity.TaskAttachment;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface TaskAttachmentRepository extends JpaRepository<TaskAttachment, Long> {

    List<TaskAttachment> findByTask(Task task);
}

