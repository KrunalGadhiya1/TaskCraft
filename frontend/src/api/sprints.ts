import { api } from "../lib/api";

export type SprintStatus = "PLANNED" | "ACTIVE" | "COMPLETED" | "CANCELLED";
export type SprintResponse = {
  id: number;
  name: string;
  goal?: string | null;
  status: SprintStatus;
  startDate: string;
  endDate: string;
  projectId: number;
};

export async function getSprints(workspaceId: number, projectId: number): Promise<SprintResponse[]> {
  const res = await api.get(`/workspaces/${workspaceId}/projects/${projectId}/sprints`);
  return res.data;
}

export async function createSprint(
  workspaceId: number,
  projectId: number,
  input: { name: string; goal?: string; startDate: string; endDate: string },
): Promise<SprintResponse> {
  const res = await api.post(`/workspaces/${workspaceId}/projects/${projectId}/sprints`, input);
  return res.data;
}

export async function updateSprintStatus(
  workspaceId: number,
  projectId: number,
  sprintId: number,
  status: SprintStatus,
): Promise<SprintResponse> {
  const res = await api.put(`/workspaces/${workspaceId}/projects/${projectId}/sprints/${sprintId}/status`, { status });
  return res.data;
}

export async function assignTasksToSprint(
  workspaceId: number,
  projectId: number,
  sprintId: number,
  taskIds: number[],
): Promise<void> {
  await api.post(`/workspaces/${workspaceId}/projects/${projectId}/sprints/${sprintId}/tasks`, { taskIds });
}

export async function removeTasksFromSprint(
  workspaceId: number,
  projectId: number,
  sprintId: number,
  taskIds: number[],
): Promise<void> {
  await api.delete(`/workspaces/${workspaceId}/projects/${projectId}/sprints/${sprintId}/tasks`, { data: { taskIds } });
}

