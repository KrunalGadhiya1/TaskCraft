import { useState } from "react";
import { toast } from "sonner";
import { Search } from "lucide-react";
import { useAppContext } from "../../app/AppContext";
import { Button } from "../../components/ui/Button";
import { Input } from "../../components/ui/Input";
import { getApiErrorMessage } from "../../lib/api";
import { searchTasks } from "../../api/search";
import type { TaskPriority, TaskResponse, TaskStatus } from "../../api/tasks";

export function SearchPage() {
  const { selection } = useAppContext();
  const [q, setQ] = useState("");
  const [status, setStatus] = useState<TaskStatus | "">("");
  const [priority, setPriority] = useState<TaskPriority | "">("");
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<TaskResponse[]>([]);

  return (
    <div className="space-y-4">
      <div className="text-left">
        <div className="text-xl font-semibold text-white">Search</div>
        <div className="text-sm text-white/60">Find tasks with filters</div>
      </div>

      <div className="glass rounded-2xl p-4">
        <div className="grid grid-cols-1 gap-3 md:grid-cols-4">
          <div className="md:col-span-2">
            <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search title or description..." />
          </div>
          <select
            className="h-10 rounded-xl border border-white/10 bg-white/5 px-3 text-sm"
            value={status}
            onChange={(e) => setStatus(e.target.value as any)}
          >
            <option value="">Any status</option>
            <option value="BACKLOG">BACKLOG</option>
            <option value="TODO">TODO</option>
            <option value="IN_PROGRESS">IN_PROGRESS</option>
            <option value="IN_REVIEW">IN_REVIEW</option>
            <option value="DONE">DONE</option>
            <option value="CANCELED">CANCELED</option>
          </select>
          <select
            className="h-10 rounded-xl border border-white/10 bg-white/5 px-3 text-sm"
            value={priority}
            onChange={(e) => setPriority(e.target.value as any)}
          >
            <option value="">Any priority</option>
            <option value="LOW">LOW</option>
            <option value="MEDIUM">MEDIUM</option>
            <option value="HIGH">HIGH</option>
            <option value="CRITICAL">CRITICAL</option>
          </select>
        </div>

        <div className="mt-3 flex justify-end">
          <Button
            disabled={loading}
            onClick={async () => {
              if (!selection.workspace || !selection.project) return;
              setLoading(true);
              try {
                const data = await searchTasks({
                  workspaceId: selection.workspace.id,
                  projectId: selection.project.id,
                  q: q || undefined,
                  status: (status || undefined) as any,
                  priority: (priority || undefined) as any,
                });
                setResults(data);
              } catch (e) {
                toast.error(getApiErrorMessage(e));
              } finally {
                setLoading(false);
              }
            }}
          >
            <Search className="h-4 w-4" />
            {loading ? "Searching..." : "Search"}
          </Button>
        </div>
      </div>

      <div className="glass rounded-2xl p-4">
        {results.length === 0 ? (
          <div className="text-sm text-white/60">No results.</div>
        ) : (
          <div className="space-y-2">
            {results.map((t) => (
              <div key={t.id} className="rounded-2xl border border-white/10 bg-white/5 p-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="text-left">
                    <div className="text-sm font-semibold text-white">{t.title}</div>
                    <div className="mt-1 text-xs text-white/60">
                      {t.status} · {t.type} · {t.priority}
                    </div>
                  </div>
                  <div className="text-xs text-white/50">#{t.id}</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

