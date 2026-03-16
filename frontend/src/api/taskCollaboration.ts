import { api } from "../lib/api";

export type CommentResponse = {
  id: number;
  authorId: number;
  authorUsername: string;
  content: string;
  createdAt: string;
  updatedAt?: string | null;
};

export type AttachmentResponse = {
  id: number;
  uploadedById: number;
  uploadedByUsername: string;
  fileName: string;
  url: string;
  contentType?: string | null;
  sizeBytes?: number | null;
  createdAt: string;
};

export async function getComments(workspaceId: number, projectId: number, taskId: number): Promise<CommentResponse[]> {
  const res = await api.get(`/workspaces/${workspaceId}/projects/${projectId}/tasks/${taskId}/comments`);
  return res.data;
}

export async function addComment(
  workspaceId: number,
  projectId: number,
  taskId: number,
  content: string,
): Promise<CommentResponse> {
  const res = await api.post(`/workspaces/${workspaceId}/projects/${projectId}/tasks/${taskId}/comments`, { content });
  return res.data;
}

export async function getAttachments(
  workspaceId: number,
  projectId: number,
  taskId: number,
): Promise<AttachmentResponse[]> {
  const res = await api.get(`/workspaces/${workspaceId}/projects/${projectId}/tasks/${taskId}/attachments`);
  return res.data;
}

export async function addAttachment(
  workspaceId: number,
  projectId: number,
  taskId: number,
  input: { fileName: string; url: string; contentType?: string; sizeBytes?: number },
): Promise<AttachmentResponse> {
  const res = await api.post(`/workspaces/${workspaceId}/projects/${projectId}/tasks/${taskId}/attachments`, input);
  return res.data;
}

export async function uploadAttachment(
  workspaceId: number,
  projectId: number,
  taskId: number,
  file: File,
): Promise<AttachmentResponse> {
  const form = new FormData();
  form.append("file", file);
  const res = await api.post(
    `/workspaces/${workspaceId}/projects/${projectId}/tasks/${taskId}/attachments/upload`,
    form,
    { headers: { "Content-Type": "multipart/form-data" } },
  );
  return res.data;
}

