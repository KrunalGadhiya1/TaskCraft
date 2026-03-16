import { api } from "../lib/api";

export type TeamResponse = { id: number; name: string; description?: string | null; workspaceId: number };
export type TeamMemberResponse = { id: number; userId: number; username: string; email: string; role: string };

export async function getTeams(workspaceId: number): Promise<TeamResponse[]> {
  const res = await api.get(`/workspaces/${workspaceId}/teams`);
  return res.data;
}

export async function createTeam(workspaceId: number, input: { name: string; description?: string }): Promise<TeamResponse> {
  const res = await api.post(`/workspaces/${workspaceId}/teams`, input);
  return res.data;
}

export async function getTeamMembers(workspaceId: number, teamId: number): Promise<TeamMemberResponse[]> {
  const res = await api.get(`/workspaces/${workspaceId}/teams/${teamId}/members`);
  return res.data;
}

export async function addTeamMembers(
  workspaceId: number,
  teamId: number,
  members: { identifier: string; role: string }[],
): Promise<TeamMemberResponse[]> {
  const res = await api.post(`/workspaces/${workspaceId}/teams/${teamId}/members`, { members });
  return res.data;
}

