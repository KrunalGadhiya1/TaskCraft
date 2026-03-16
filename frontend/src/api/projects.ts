import { api } from "../lib/api";
import type { Project } from "../app/AppContext";

export async function getProjects(workspaceId: number): Promise<Project[]> {
  const res = await api.get(`/workspaces/${workspaceId}/projects`);
  return res.data;
}

export async function createProject(
  workspaceId: number,
  input: { name: string; key: string; description?: string },
): Promise<Project> {
  const res = await api.post(`/workspaces/${workspaceId}/projects`, { ...input, status: "ACTIVE" });
  return res.data;
}

export type ProjectMemberResponse = { id: number; userId: number; username: string; email: string; role: string };

export async function getProjectMembers(workspaceId: number, projectId: number): Promise<ProjectMemberResponse[]> {
  const res = await api.get(`/workspaces/${workspaceId}/projects/${projectId}/members`);
  return res.data;
}

export async function addProjectMembers(
  workspaceId: number,
  projectId: number,
  members: { identifier: string; role: string }[],
): Promise<ProjectMemberResponse[]> {
  const res = await api.post(`/workspaces/${workspaceId}/projects/${projectId}/members`, { members });
  return res.data;
}

