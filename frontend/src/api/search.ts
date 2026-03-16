import { api } from "../lib/api";
import type { TaskPriority, TaskResponse, TaskStatus } from "./tasks";

export async function searchTasks(params: {
  workspaceId: number;
  projectId: number;
  q?: string;
  status?: TaskStatus;
  priority?: TaskPriority;
}): Promise<TaskResponse[]> {
  const { workspaceId, projectId, q, status, priority } = params;
  const res = await api.get(`/workspaces/${workspaceId}/projects/${projectId}/search/tasks`, {
    params: { q, status, priority },
  });
  return res.data;
}

