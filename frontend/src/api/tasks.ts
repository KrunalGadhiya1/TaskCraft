import { api } from "../lib/api";

export type TaskType = "BUG" | "STORY" | "SUBTASK" | "TASK";
export type TaskStatus = "BACKLOG" | "TODO" | "IN_PROGRESS" | "IN_REVIEW" | "DONE" | "CANCELED";
export type TaskPriority = "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";

export type TaskResponse = {
  id: number;
  issueKey?: string | null;
  issueSeq?: number | null;
  title: string;
  description?: string | null;
  type: TaskType;
  status: TaskStatus;
  priority: TaskPriority;
  storyPoints?: number | null;
  dueDate?: string | null;
  projectId: number;
  sprintId?: number | null;
  reporterId: number;
  assigneeId?: number | null;
};

export async function getTasks(workspaceId: number, projectId: number): Promise<TaskResponse[]> {
  const res = await api.get(`/workspaces/${workspaceId}/projects/${projectId}/tasks`);
  return res.data;
}

export async function createTask(
  workspaceId: number,
  projectId: number,
  input: {
    title: string;
    description?: string;
    type: TaskType;
    priority: TaskPriority;
    storyPoints?: number;
    dueDate?: string;
    assigneeIdentifier?: string;
  },
): Promise<TaskResponse> {
  const res = await api.post(`/workspaces/${workspaceId}/projects/${projectId}/tasks`, input);
  return res.data;
}

export async function updateTaskStatus(
  workspaceId: number,
  projectId: number,
  taskId: number,
  status: TaskStatus,
): Promise<TaskResponse> {
  const res = await api.put(`/workspaces/${workspaceId}/projects/${projectId}/tasks/${taskId}/status`, { status });
  return res.data;
}

export async function updateTask(
  workspaceId: number,
  projectId: number,
  taskId: number,
  input: {
    title: string;
    description?: string;
    type: TaskType;
    priority: TaskPriority;
    storyPoints?: number;
    dueDate?: string;
  },
): Promise<TaskResponse> {
  const res = await api.put(`/workspaces/${workspaceId}/projects/${projectId}/tasks/${taskId}`, input);
  return res.data;
}

export async function updateAssignee(
  workspaceId: number,
  projectId: number,
  taskId: number,
  assigneeIdentifier: string | null,
): Promise<TaskResponse> {
  const res = await api.put(`/workspaces/${workspaceId}/projects/${projectId}/tasks/${taskId}/assignee`, {
    assigneeIdentifier,
  });
  return res.data;
}

