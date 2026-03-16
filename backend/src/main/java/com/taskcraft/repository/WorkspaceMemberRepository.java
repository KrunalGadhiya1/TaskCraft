package com.taskcraft.repository;

import com.taskcraft.entity.User;
import com.taskcraft.entity.Workspace;
import com.taskcraft.entity.WorkspaceMember;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface WorkspaceMemberRepository extends JpaRepository<WorkspaceMember, Long> {

    List<WorkspaceMember> findByWorkspace(Workspace workspace);

    Optional<WorkspaceMember> findByWorkspaceAndUser(Workspace workspace, User user);
}

