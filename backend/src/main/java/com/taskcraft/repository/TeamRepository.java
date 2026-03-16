package com.taskcraft.repository;

import com.taskcraft.entity.Team;
import com.taskcraft.entity.Workspace;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface TeamRepository extends JpaRepository<Team, Long> {

    List<Team> findByWorkspace(Workspace workspace);
}

