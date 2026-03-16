import { api } from "../lib/api";

export type ProjectReportResponse = {
  workspaceId: number;
  projectId: number;
  tasksByStatus: Record<string, number>;
  tasksByPriority: Record<string, number>;
  totalTasks: number;
  doneTasks: number;
};

export async function getProjectReport(workspaceId: number, projectId: number): Promise<ProjectReportResponse> {
  const res = await api.get(`/workspaces/${workspaceId}/projects/${projectId}/reports/project`);
  return res.data;
}

export async function downloadProjectReportCsv(workspaceId: number, projectId: number): Promise<Blob> {
  const res = await api.get(`/workspaces/${workspaceId}/projects/${projectId}/reports/project.csv`, {
    responseType: "blob",
    headers: { Accept: "text/csv" },
  });
  return res.data as Blob;
}

