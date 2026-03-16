import { api } from "../lib/api";

export type NotificationType = "TASK_ASSIGNED" | "TASK_ATTACHMENT_ADDED" | "TASK_COMMENTED" | "TASK_STATUS_CHANGED";

export type NotificationResponse = {
  id: number;
  type: NotificationType;
  title: string;
  message: string;
  projectId?: number | null;
  taskId?: number | null;
  readFlag: boolean;
  createdAt: string;
};

export async function getNotifications(unreadOnly: boolean): Promise<NotificationResponse[]> {
  const res = await api.get(unreadOnly ? "/notifications/unread" : "/notifications");
  return res.data;
}

export async function markNotificationRead(id: number): Promise<void> {
  await api.post(`/notifications/${id}/read`);
}

export async function markAllNotificationsRead(): Promise<void> {
  await api.post(`/notifications/read-all`);
}

