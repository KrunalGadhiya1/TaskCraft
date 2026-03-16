package com.taskcraft.repository;

import com.taskcraft.entity.Project;
import com.taskcraft.entity.ProjectMember;
import com.taskcraft.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface ProjectMemberRepository extends JpaRepository<ProjectMember, Long> {

    List<ProjectMember> findByProject(Project project);

    Optional<ProjectMember> findByProjectAndUser(Project project, User user);
}

