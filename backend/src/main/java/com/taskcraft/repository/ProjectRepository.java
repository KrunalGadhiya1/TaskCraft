package com.taskcraft.repository;

import com.taskcraft.entity.Project;
import com.taskcraft.entity.Workspace;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ProjectRepository extends JpaRepository<Project, Long> {

    List<Project> findByWorkspace(Workspace workspace);
}

