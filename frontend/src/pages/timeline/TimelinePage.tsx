import { useEffect, useState } from "react";
import { toast } from "sonner";
import { useAppContext } from "../../app/AppContext";
import { getApiErrorMessage } from "../../lib/api";
import { getProjectActivity, type ActivityResponse } from "../../api/activity";

export function TimelinePage() {
  const { selection } = useAppContext();
  const [items, setItems] = useState<ActivityResponse[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!selection.project) return;
    setLoading(true);
    getProjectActivity(selection.project.id)
      .then(setItems)
      .catch((e) => toast.error(getApiErrorMessage(e)))
      .finally(() => setLoading(false));
  }, [selection.project]);

  return (
    <div className="space-y-4">
      <div className="text-left">
        <div className="text-xl font-semibold text-white">Timeline</div>
        <div className="text-sm text-white/60">Audit trail across your project</div>
      </div>

      <div className="glass rounded-2xl p-4">
        {loading ? <div className="text-sm text-white/60">Loading activity...</div> : null}
        {!loading && items.length === 0 ? (
          <div className="text-sm text-white/60">No activity yet.</div>
        ) : (
          <div className="space-y-3">
            {items.map((a) => (
              <div key={a.id} className="rounded-2xl border border-white/10 bg-white/5 p-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="text-sm font-medium text-white">
                    {a.actorUsername} · <span className="text-white/70">{a.type}</span>
                  </div>
                  <div className="text-xs text-white/50">{new Date(a.createdAt).toLocaleString()}</div>
                </div>
                {a.message ? <div className="mt-1 text-sm text-white/70">{a.message}</div> : null}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

