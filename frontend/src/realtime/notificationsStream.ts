import { EventSourcePolyfill } from "event-source-polyfill";
import { getStoredToken } from "../auth/tokenStorage";

export function subscribeNotifications(onMessage: (data: any) => void) {
  const token = getStoredToken();
  const base = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8080/api";
  const url = `${base}/notifications/stream`;

  const es = new EventSourcePolyfill(url, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
    heartbeatTimeout: 45_000,
    withCredentials: false,
  });

  es.onmessage = (evt: MessageEvent) => {
    try {
      onMessage(JSON.parse(evt.data));
    } catch {
      onMessage(evt.data);
    }
  };

  return () => es.close();
}

