import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { Download } from "lucide-react";
import { useAppContext } from "../../app/AppContext";
import { Button } from "../../components/ui/Button";
import { getApiErrorMessage } from "../../lib/api";
import { downloadProjectReportCsv, getProjectReport, type ProjectReportResponse } from "../../api/reports";

export function ReportsPage() {
  const { selection } = useAppContext();
  const [data, setData] = useState<ProjectReportResponse | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!selection.workspace || !selection.project) return;
    setLoading(true);
    getProjectReport(selection.workspace.id, selection.project.id)
      .then(setData)
      .catch((e) => toast.error(getApiErrorMessage(e)))
      .finally(() => setLoading(false));
  }, [selection.workspace, selection.project]);

  const statusRows = useMemo(() => Object.entries(data?.tasksByStatus ?? {}), [data]);
  const prioRows = useMemo(() => Object.entries(data?.tasksByPriority ?? {}), [data]);

  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between gap-3">
        <div className="text-left">
          <div className="text-xl font-semibold text-white">Reports</div>
          <div className="text-sm text-white/60">Export-ready project stats</div>
        </div>
        <Button
          variant="ghost"
          size="sm"
          disabled={!selection.workspace || !selection.project}
          onClick={async () => {
            if (!selection.workspace || !selection.project) return;
            try {
              const blob = await downloadProjectReportCsv(selection.workspace.id, selection.project.id);
              const url = URL.createObjectURL(blob);
              const a = document.createElement("a");
              a.href = url;
              a.download = `taskcraft-project-${selection.project.key}-report.csv`;
              a.click();
              URL.revokeObjectURL(url);
            } catch (e) {
              toast.error(getApiErrorMessage(e));
            }
          }}
        >
          <Download className="h-4 w-4" />
          Download CSV
        </Button>
      </div>

      <div className="glass rounded-2xl p-4">
        {loading ? <div className="text-sm text-white/60">Loading report...</div> : null}
        {!loading && !data ? <div className="text-sm text-white/60">No data.</div> : null}
        {data ? (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="rounded-2xl border border-white/10 bg-white/5 p-3">
              <div className="text-sm font-semibold text-white">Summary</div>
              <div className="mt-2 text-sm text-white/70">
                Total: <span className="text-white">{data.totalTasks}</span>
              </div>
              <div className="text-sm text-white/70">
                Done: <span className="text-white">{data.doneTasks}</span>
              </div>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/5 p-3">
              <div className="text-sm font-semibold text-white">By Status</div>
              <div className="mt-2 space-y-1 text-sm text-white/70">
                {statusRows.length ? statusRows.map(([k, v]) => <Row key={k} k={k} v={v} />) : <div>No rows</div>}
              </div>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/5 p-3 md:col-span-2">
              <div className="text-sm font-semibold text-white">By Priority</div>
              <div className="mt-2 grid grid-cols-2 gap-2 text-sm text-white/70 md:grid-cols-4">
                {prioRows.length
                  ? prioRows.map(([k, v]) => (
                      <div key={k} className="rounded-2xl border border-white/10 bg-white/5 p-3">
                        <div className="text-xs text-white/60">{k}</div>
                        <div className="mt-1 text-lg font-semibold text-white">{v}</div>
                      </div>
                    ))
                  : null}
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}

function Row({ k, v }: { k: string; v: number }) {
  return (
    <div className="flex items-center justify-between rounded-xl border border-white/10 bg-white/5 px-3 py-2">
      <div className="text-xs text-white/70">{k}</div>
      <div className="text-sm font-semibold text-white">{v}</div>
    </div>
  );
}

