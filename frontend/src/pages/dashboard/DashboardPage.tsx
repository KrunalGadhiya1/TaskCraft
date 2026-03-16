import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { useAppContext } from "../../app/AppContext";
import { getApiErrorMessage } from "../../lib/api";
import { getProjectSummary, type ProjectSummaryResponse } from "../../api/dashboard";
import { cn } from "../../lib/cn";

export function DashboardPage() {
  const { selection } = useAppContext();
  const [data, setData] = useState<ProjectSummaryResponse | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!selection.workspace || !selection.project) return;
    setLoading(true);
    getProjectSummary(selection.workspace.id, selection.project.id)
      .then((d) => setData(d))
      .catch((e) => toast.error(getApiErrorMessage(e)))
      .finally(() => setLoading(false));
  }, [selection.workspace, selection.project]);

  const completion = useMemo(() => {
    if (!data) return 0;
    if (!data.totalTasks) return 0;
    return Math.round((data.doneTasks / data.totalTasks) * 100);
  }, [data]);

  return (
    <div className="space-y-4">
      <div className="text-left">
        <div className="text-xl font-semibold text-white">Dashboard</div>
        <div className="text-sm text-white/60">Progress, signals, and momentum</div>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <Card title="Total tasks" value={loading ? "..." : String(data?.totalTasks ?? 0)} />
        <Card title="Done" value={loading ? "..." : String(data?.doneTasks ?? 0)} />
        <Card title="Completion" value={loading ? "..." : `${completion}%`} />
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <Panel title="By status">
          <KeyValueGrid map={data?.tasksByStatus ?? {}} emptyLabel={loading ? "Loading..." : "No data"} />
        </Panel>
        <Panel title="By priority">
          <KeyValueGrid map={data?.tasksByPriority ?? {}} emptyLabel={loading ? "Loading..." : "No data"} />
        </Panel>
      </div>
    </div>
  );
}

function Card({ title, value }: { title: string; value: string }) {
  return (
    <div className="glass rounded-2xl p-4">
      <div className="text-xs font-medium text-white/60">{title}</div>
      <div className="mt-2 text-2xl font-semibold text-white">{value}</div>
    </div>
  );
}

function Panel({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="glass rounded-2xl p-4">
      <div className="mb-3 text-sm font-semibold text-white">{title}</div>
      {children}
    </div>
  );
}

function KeyValueGrid({ map, emptyLabel }: { map: Record<string, number>; emptyLabel: string }) {
  const entries = Object.entries(map ?? {});
  if (!entries.length) return <div className="text-sm text-white/60">{emptyLabel}</div>;
  return (
    <div className="grid grid-cols-2 gap-2">
      {entries.map(([k, v]) => (
        <div key={k} className={cn("rounded-2xl border border-white/10 bg-white/5 p-3")}>
          <div className="text-xs text-white/60">{k}</div>
          <div className="mt-1 text-lg font-semibold text-white">{v}</div>
        </div>
      ))}
    </div>
  );
}

