package com.taskcraft.repository;

import com.taskcraft.entity.Project;
import com.taskcraft.entity.Sprint;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface SprintRepository extends JpaRepository<Sprint, Long> {

    List<Sprint> findByProject(Project project);
}

