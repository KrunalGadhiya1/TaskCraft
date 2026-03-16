package com.taskcraft.repository;

import com.taskcraft.entity.Project;
import com.taskcraft.entity.Task;
import com.taskcraft.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.Instant;
import java.util.List;

public interface TaskRepository extends JpaRepository<Task, Long> {

    List<Task> findByProject(Project project);

    List<Task> findByProjectAndAssignee(Project project, User assignee);

    @Query("""
            select t
            from Task t
            where t.assignee is not null
              and t.dueDate is not null
              and t.status not in :closed
              and t.dueDate > :now
              and t.dueDate <= :soon
            """)
    List<Task> findDueSoon(
            @Param("now") Instant now,
            @Param("soon") Instant soon,
            @Param("closed") List<Task.TaskStatus> closed
    );

    @Query("""
            select t
            from Task t
            where t.assignee is not null
              and t.dueDate is not null
              and t.status not in :closed
              and t.dueDate <= :now
            """)
    List<Task> findOverdue(
            @Param("now") Instant now,
            @Param("closed") List<Task.TaskStatus> closed
    );

    @Query("select coalesce(max(t.issueSeq), 0) from Task t where t.project.id = :projectId")
    Integer findMaxIssueSeqForProject(@Param("projectId") Long projectId);

    @Query("""
            select t.status as status, count(t) as cnt
            from Task t
            where t.project.id = :projectId
            group by t.status
            """)
    List<Object[]> countByStatusForProject(@Param("projectId") Long projectId);

    @Query("""
            select t.priority as priority, count(t) as cnt
            from Task t
            where t.project.id = :projectId
            group by t.priority
            """)
    List<Object[]> countByPriorityForProject(@Param("projectId") Long projectId);

    @Query("""
            select t
            from Task t
            where t.project.id = :projectId
              and (:q is null or lower(t.title) like lower(concat('%', :q, '%')) or lower(t.description) like lower(concat('%', :q, '%')))
              and (:status is null or t.status = :status)
              and (:priority is null or t.priority = :priority)
            """)
    List<Task> searchTasks(
            @Param("projectId") Long projectId,
            @Param("q") String q,
            @Param("status") Task.TaskStatus status,
            @Param("priority") Task.TaskPriority priority
    );
}

