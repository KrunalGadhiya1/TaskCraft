package com.taskcraft.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

import java.util.List;

public class WorkspaceDtos {

    public static class WorkspaceResponse {
        private Long id;
        private String name;
        private String key;
        private String description;
        private Long ownerId;

        public Long getId() {
            return id;
        }

        public void setId(Long id) {
            this.id = id;
        }

        public String getName() {
            return name;
        }

        public void setName(String name) {
            this.name = name;
        }

        public String getKey() {
            return key;
        }

        public void setKey(String key) {
            this.key = key;
        }

        public String getDescription() {
            return description;
        }

        public void setDescription(String description) {
            this.description = description;
        }

        public Long getOwnerId() {
            return ownerId;
        }

        public void setOwnerId(Long ownerId) {
            this.ownerId = ownerId;
        }
    }

    public static class WorkspaceMemberResponse {
        private Long id;
        private Long userId;
        private String username;
        private String email;
        private String role;

        public Long getId() {
            return id;
        }

        public void setId(Long id) {
            this.id = id;
        }

        public Long getUserId() {
            return userId;
        }

        public void setUserId(Long userId) {
            this.userId = userId;
        }

        public String getUsername() {
            return username;
        }

        public void setUsername(String username) {
            this.username = username;
        }

        public String getEmail() {
            return email;
        }

        public void setEmail(String email) {
            this.email = email;
        }

        public String getRole() {
            return role;
        }

        public void setRole(String role) {
            this.role = role;
        }
    }

    public static class CreateWorkspaceRequest {

        @NotBlank
        @Size(min = 3, max = 150)
        private String name;

        @NotBlank
        @Size(min = 2, max = 20)
        private String key;

        @Size(max = 500)
        private String description;

        public String getName() {
            return name;
        }

        public void setName(String name) {
            this.name = name;
        }

        public String getKey() {
            return key;
        }

        public void setKey(String key) {
            this.key = key;
        }

        public String getDescription() {
            return description;
        }

        public void setDescription(String description) {
            this.description = description;
        }
    }

    public static class UpdateWorkspaceRequest {

        @NotBlank
        @Size(min = 3, max = 150)
        private String name;

        @Size(max = 500)
        private String description;

        public String getName() {
            return name;
        }

        public void setName(String name) {
            this.name = name;
        }

        public String getDescription() {
            return description;
        }

        public void setDescription(String description) {
            this.description = description;
        }
    }

    public static class AddWorkspaceMemberRequest {

        @NotBlank
        private String identifier;

        @NotBlank
        private String role;

        public String getIdentifier() {
            return identifier;
        }

        public void setIdentifier(String identifier) {
            this.identifier = identifier;
        }

        public String getRole() {
            return role;
        }

        public void setRole(String role) {
            this.role = role;
        }
    }

    public static class BulkAddWorkspaceMembersRequest {

        private List<AddWorkspaceMemberRequest> members;

        public List<AddWorkspaceMemberRequest> getMembers() {
            return members;
        }

        public void setMembers(List<AddWorkspaceMemberRequest> members) {
            this.members = members;
        }
    }
}

