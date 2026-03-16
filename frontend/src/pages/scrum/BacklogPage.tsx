import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { ListTodo, Plus, Rocket } from "lucide-react";
import { useAppContext } from "../../app/AppContext";
import { getApiErrorMessage } from "../../lib/api";
import { getTasks, updateTaskStatus, type TaskResponse, type TaskStatus } from "../../api/tasks";
import { getSprints, assignTasksToSprint, type SprintResponse } from "../../api/sprints";
import { Button } from "../../components/ui/Button";
import { Input } from "../../components/ui/Input";
import { Modal } from "../../components/ui/Modal";

export function BacklogPage() {
  const { selection } = useAppContext();
  const [tasks, setTasks] = useState<TaskResponse[]>([]);
  const [loading, setLoading] = useState(false);
  const [query, setQuery] = useState("");
  const [planOpen, setPlanOpen] = useState<{ task: TaskResponse } | null>(null);

  useEffect(() => {
    if (!selection.workspace || !selection.project) return;
    setLoading(true);
    getTasks(selection.workspace.id, selection.project.id)
      .then(setTasks)
      .catch((e) => toast.error(getApiErrorMessage(e)))
      .finally(() => setLoading(false));
  }, [selection.workspace, selection.project]);

  const backlog = useMemo(() => {
    const q = query.trim().toLowerCase();
    return tasks
      .filter((t) => t.status === "BACKLOG")
      .filter((t) => (!q ? true : `${t.issueKey ?? ""} ${t.title} ${t.description ?? ""}`.toLowerCase().includes(q)));
  }, [tasks, query]);

  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between gap-3">
        <div className="text-left">
          <div className="text-xl font-semibold text-white">Backlog</div>
          <div className="text-sm text-white/60">{loading ? "Loading backlog..." : "Refine, prioritize, and prepare work"}</div>
        </div>
      </div>

      <div className="glass rounded-2xl p-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2 text-white/70">
            <ListTodo className="h-4 w-4" />
            <div className="text-sm">{backlog.length} items</div>
          </div>
          <div className="flex items-center gap-2">
            <Input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search backlog..." />
          </div>
        </div>

        <div className="mt-3 space-y-2">
          {backlog.length === 0 ? (
            <div className="text-sm text-white/60">No backlog items.</div>
          ) : (
            backlog.map((t) => (
              <div key={t.id} className="rounded-2xl border border-white/10 bg-white/5 p-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="text-left">
                    <div className="flex flex-wrap items-center gap-2">
                      {t.issueKey ? (
                        <div className="rounded-xl border border-white/10 bg-white/5 px-2 py-0.5 text-[10px] font-semibold text-white/80">
                          {t.issueKey}
                        </div>
                      ) : null}
                      <div className="text-sm font-semibold text-white">{t.title}</div>
                    </div>
                    {t.description ? <div className="mt-1 text-sm text-white/70">{t.description}</div> : null}
                    <div className="mt-2 text-xs text-white/50">
                      {t.type} · {t.priority}
                      {t.storyPoints != null ? ` · ${t.storyPoints} pts` : ""}
                    </div>
                  </div>
                  <div className="flex shrink-0 flex-col gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={async () => {
                        if (!selection.workspace || !selection.project) return;
                        try {
                          const updated = await updateTaskStatus(selection.workspace.id, selection.project.id, t.id, "TODO" as TaskStatus);
                          setTasks((prev) => prev.map((x) => (x.id === t.id ? updated : x)));
                          toast.success("Moved to TODO");
                        } catch (e) {
                          toast.error(getApiErrorMessage(e));
                        }
                      }}
                    >
                      <Rocket className="h-4 w-4" />
                      Start
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => setPlanOpen({ task: t })}>
                      <Plus className="h-4 w-4" />
                      Add to sprint
                    </Button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      <PlanIntoSprintModal
        open={Boolean(planOpen)}
        task={planOpen?.task ?? null}
        onClose={() => setPlanOpen(null)}
        onAssigned={(taskId, sprintId) =>
          setTasks((prev) => prev.map((x) => (x.id === taskId ? { ...x, sprintId } : x)))
        }
      />
    </div>
  );
}

function PlanIntoSprintModal({
  open,
  onClose,
  task,
  onAssigned,
}: {
  open: boolean;
  onClose: () => void;
  task: TaskResponse | null;
  onAssigned: (taskId: number, sprintId: number) => void;
}) {
  const { selection } = useAppContext();
  const [sprints, setSprints] = useState<SprintResponse[]>([]);
  const [sprintId, setSprintId] = useState<number | "">("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!open) return;
    if (!selection.workspace || !selection.project) return;
    setLoading(true);
    getSprints(selection.workspace.id, selection.project.id)
      .then((ss) => {
        setSprints(ss);
        const active = ss.find((x) => x.status === "ACTIVE") ?? ss[0];
        setSprintId(active ? active.id : "");
      })
      .catch((e) => toast.error(getApiErrorMessage(e)))
      .finally(() => setLoading(false));
  }, [open, selection.workspace, selection.project]);

  return (
    <Modal open={open} onClose={onClose} title={task ? `Add to sprint → ${task.issueKey ?? task.title}` : "Add to sprint"}>
      {!task ? (
        <div className="text-sm text-white/60">Select a backlog item.</div>
      ) : (
        <div className="space-y-3">
          <div className="text-sm text-white/70">
            Pick a sprint. For Scrum, backlog items should be planned into a sprint before execution.
          </div>
          <select
            className="h-10 w-full rounded-xl border border-white/10 bg-white/5 px-3 text-sm"
            value={sprintId}
            onChange={(e) => setSprintId(Number(e.target.value))}
            disabled={loading}
          >
            {sprints.length === 0 ? <option value="">No sprints</option> : null}
            {sprints.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name} ({s.status})
              </option>
            ))}
          </select>
          <div className="flex justify-end gap-2">
            <Button variant="ghost" onClick={onClose}>
              Close
            </Button>
            <Button
              onClick={async () => {
                if (!selection.workspace || !selection.project) return;
                if (!sprintId) return toast.error("Select a sprint");
                try {
                  await assignTasksToSprint(selection.workspace.id, selection.project.id, Number(sprintId), [task.id]);
                  onAssigned(task.id, Number(sprintId));
                  toast.success("Added to sprint");
                  onClose();
                } catch (e) {
                  toast.error(getApiErrorMessage(e));
                }
              }}
            >
              Add
            </Button>
          </div>
        </div>
      )}
    </Modal>
  );
}

