import { api } from "../lib/api";
import type { Workspace } from "../app/AppContext";

export async function getMyWorkspaces(): Promise<Workspace[]> {
  const res = await api.get("/workspaces");
  return res.data;
}

export async function createWorkspace(input: { name: string; key: string; description?: string }): Promise<Workspace> {
  const res = await api.post("/workspaces", input);
  return res.data;
}

export type WorkspaceMemberResponse = { id: number; userId: number; username: string; email: string; role: string };

export async function getWorkspaceMembers(workspaceId: number): Promise<WorkspaceMemberResponse[]> {
  const res = await api.get(`/workspaces/${workspaceId}/members`);
  return res.data;
}

export async function addWorkspaceMembers(
  workspaceId: number,
  members: { identifier: string; role: string }[],
): Promise<WorkspaceMemberResponse[]> {
  const res = await api.post(`/workspaces/${workspaceId}/members`, { members });
  return res.data;
}

