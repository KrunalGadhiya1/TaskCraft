import { api } from "../lib/api";

export type UserResponse = { id: number; username: string; email: string; role: string; enabled: boolean };

export async function getMe(): Promise<UserResponse> {
  const res = await api.get("/users/me");
  return res.data;
}

export async function updateMe(input: { username: string; email: string }): Promise<UserResponse> {
  const res = await api.put("/users/me", input);
  return res.data;
}

export async function changeMyPassword(input: { currentPassword: string; newPassword: string }): Promise<void> {
  await api.put("/users/me/password", input);
}

export async function adminGetAllUsers(): Promise<UserResponse[]> {
  const res = await api.get("/users");
  return res.data;
}

export async function adminUpdateUserRole(id: number, role: string): Promise<UserResponse> {
  const res = await api.put(`/users/${id}/role`, { role });
  return res.data;
}

export async function adminUpdateUserStatus(id: number, enabled: boolean): Promise<UserResponse> {
  const res = await api.put(`/users/${id}/status`, { enabled });
  return res.data;
}

export async function adminDeleteUser(id: number): Promise<void> {
  await api.delete(`/users/${id}`);
}

