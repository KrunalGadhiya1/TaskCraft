import axios from "axios";
import { toast } from "sonner";
import { clearStoredToken, getStoredToken } from "../auth/tokenStorage";

const baseURL = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8083/api";

export const api = axios.create({
  baseURL,
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use((config) => {
  const token = getStoredToken();
  if (token) {
    config.headers = config.headers ?? {};
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    const status: number | undefined = err?.response?.status;
    if (status === 401 || status === 403) {
      const alreadyHandling = sessionStorage.getItem("taskcraft_auth_redirect") === "1";
      if (!alreadyHandling) {
        sessionStorage.setItem("taskcraft_auth_redirect", "1");
        clearStoredToken();
        toast.error("Session expired or unauthorized. Please login again.");
        // give the toast a moment to render before redirect
        setTimeout(() => {
          sessionStorage.removeItem("taskcraft_auth_redirect");
          window.location.href = "/login";
        }, 600);
      }
    }
    return Promise.reject(err);
  },
);

export function getApiErrorMessage(err: unknown): string {
  if (!err) return "Unknown error";
  if (typeof err === "string") return err;
  // axios
  const anyErr = err as any;
  const msg =
    anyErr?.response?.data?.message ??
    anyErr?.response?.data?.error ??
    anyErr?.response?.data ??
    anyErr?.message;
  if (typeof msg === "string" && msg.trim().length) return msg;
  if (typeof msg === "object" && msg) return JSON.stringify(msg);
  if (typeof anyErr?.message === "string" && anyErr.message.trim().length) return anyErr.message;
  return "Request failed";
}

