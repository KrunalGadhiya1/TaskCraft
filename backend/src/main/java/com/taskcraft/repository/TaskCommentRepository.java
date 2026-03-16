package com.taskcraft.repository;

import com.taskcraft.entity.Task;
import com.taskcraft.entity.TaskComment;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface TaskCommentRepository extends JpaRepository<TaskComment, Long> {

    List<TaskComment> findByTaskOrderByCreatedAtAsc(Task task);
}

