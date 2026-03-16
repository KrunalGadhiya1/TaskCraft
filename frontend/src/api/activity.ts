import { api } from "../lib/api";

export type ActivityType =
  | "WORKSPACE_CREATED"
  | "WORKSPACE_MEMBER_ADDED"
  | "TEAM_CREATED"
  | "TEAM_MEMBER_ADDED"
  | "PROJECT_CREATED"
  | "PROJECT_MEMBER_ADDED"
  | "SPRINT_CREATED"
  | "SPRINT_STATUS_CHANGED"
  | "TASK_CREATED"
  | "TASK_UPDATED"
  | "TASK_STATUS_CHANGED"
  | "TASK_ASSIGNEE_CHANGED"
  | "TASK_COMMENTED"
  | "TASK_ATTACHMENT_ADDED";

export type ActivityResponse = {
  id: number;
  actorId: number;
  actorUsername: string;
  type: ActivityType;
  workspaceId?: number | null;
  projectId?: number | null;
  sprintId?: number | null;
  taskId?: number | null;
  message?: string | null;
  createdAt: string;
};

export async function getProjectActivity(projectId: number): Promise<ActivityResponse[]> {
  const res = await api.get(`/activity/projects/${projectId}`);
  return res.data;
}

