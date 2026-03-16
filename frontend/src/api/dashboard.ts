import { api } from "../lib/api";

export type ProjectSummaryResponse = {
  projectId: number;
  tasksByStatus: Record<string, number>;
  tasksByPriority: Record<string, number>;
  totalTasks: number;
  doneTasks: number;
};

export async function getProjectSummary(workspaceId: number, projectId: number): Promise<ProjectSummaryResponse> {
  const res = await api.get(`/workspaces/${workspaceId}/projects/${projectId}/dashboard/summary`);
  return res.data;
}

