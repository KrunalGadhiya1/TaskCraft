import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { Bell, Check, RefreshCcw } from "lucide-react";
import { Button } from "../../components/ui/Button";
import { getApiErrorMessage } from "../../lib/api";
import {
  getNotifications,
  markAllNotificationsRead,
  markNotificationRead,
  type NotificationResponse,
} from "../../api/notifications";
import { subscribeNotifications } from "../../realtime/notificationsStream";

export function NotificationsPage() {
  const [items, setItems] = useState<NotificationResponse[]>([]);
  const [unreadOnly, setUnreadOnly] = useState(true);
  const [loading, setLoading] = useState(false);

  const unreadCount = useMemo(() => items.filter((x) => !x.readFlag).length, [items]);

  async function load() {
    setLoading(true);
    try {
      const data = await getNotifications(unreadOnly);
      setItems(data);
    } catch (e) {
      toast.error(getApiErrorMessage(e));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    const unsubscribe = subscribeNotifications((payload) => {
      // backend sends NotificationResponse
      if (!payload || typeof payload !== "object") return;
      const n = payload as NotificationResponse;
      setItems((prev) => [n, ...prev]);
      toast.message(n.title, { description: n.message });
    });
    return () => unsubscribe();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [unreadOnly]);

  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between gap-3">
        <div className="text-left">
          <div className="text-xl font-semibold text-white">Notifications</div>
          <div className="text-sm text-white/60">Signals from your project galaxy</div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setUnreadOnly((v) => !v)}
          >
            <Bell className="h-4 w-4" />
            {unreadOnly ? `Unread (${unreadCount})` : "All"}
          </Button>
          <Button variant="ghost" size="sm" onClick={load} disabled={loading}>
            <RefreshCcw className="h-4 w-4" />
            Refresh
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={async () => {
              try {
                await markAllNotificationsRead();
                toast.success("All marked as read");
                load();
              } catch (e) {
                toast.error(getApiErrorMessage(e));
              }
            }}
          >
            <Check className="h-4 w-4" />
            Read all
          </Button>
        </div>
      </div>

      <div className="glass rounded-2xl p-4">
        {loading ? <div className="text-sm text-white/60">Loading...</div> : null}
        {!loading && items.length === 0 ? (
          <div className="text-sm text-white/60">No notifications.</div>
        ) : (
          <div className="space-y-3">
            {items.map((n) => (
              <div key={n.id} className="rounded-2xl border border-white/10 bg-white/5 p-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="text-left">
                    <div className="text-sm font-semibold text-white">{n.title}</div>
                    <div className="mt-1 text-sm text-white/70">{n.message}</div>
                    <div className="mt-2 text-xs text-white/50">
                      {n.type} · {new Date(n.createdAt).toLocaleString()}
                    </div>
                  </div>
                  {!n.readFlag ? (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={async () => {
                        try {
                          await markNotificationRead(n.id);
                          setItems((prev) => prev.map((x) => (x.id === n.id ? { ...x, readFlag: true } : x)));
                        } catch (e) {
                          toast.error(getApiErrorMessage(e));
                        }
                      }}
                    >
                      Mark read
                    </Button>
                  ) : (
                    <div className="text-xs text-white/50">Read</div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

