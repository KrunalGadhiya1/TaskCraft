import { useEffect, useState } from "react";
import { toast } from "sonner";
import { useAppContext } from "../../app/AppContext";
import { getApiErrorMessage } from "../../lib/api";
import {
  assignTasksToSprint,
  createSprint,
  getSprints,
  removeTasksFromSprint,
  updateSprintStatus,
  type SprintResponse,
  type SprintStatus,
} from "../../api/sprints";
import { getTasks, type TaskResponse } from "../../api/tasks";
import { Button } from "../../components/ui/Button";
import { Input } from "../../components/ui/Input";
import { Modal } from "../../components/ui/Modal";

export function SprintsPage() {
  const { selection } = useAppContext();
  const [items, setItems] = useState<SprintResponse[]>([]);
  const [loading, setLoading] = useState(false);
  const [createOpen, setCreateOpen] = useState(false);
  const [assignOpen, setAssignOpen] = useState<{ sprint: SprintResponse } | null>(null);

  useEffect(() => {
    if (!selection.workspace || !selection.project) return;
    setLoading(true);
    getSprints(selection.workspace.id, selection.project.id)
      .then(setItems)
      .catch((e) => toast.error(getApiErrorMessage(e)))
      .finally(() => setLoading(false));
  }, [selection.workspace, selection.project]);

  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between gap-3">
        <div className="text-left">
          <div className="text-xl font-semibold text-white">Sprints</div>
          <div className="text-sm text-white/60">{loading ? "Loading..." : "Plan and run iterations"}</div>
        </div>
        <Button variant="ghost" size="sm" onClick={() => setCreateOpen(true)}>
          New sprint
        </Button>
      </div>

      <div className="glass rounded-2xl p-4">
        {items.length === 0 ? (
          <div className="text-sm text-white/60">No sprints yet.</div>
        ) : (
          <div className="space-y-3">
            {items.map((s) => (
              <div key={s.id} className="rounded-2xl border border-white/10 bg-white/5 p-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="text-left">
                    <div className="text-sm font-semibold text-white">{s.name}</div>
                    {s.goal ? <div className="mt-1 text-sm text-white/70">{s.goal}</div> : null}
                    <div className="mt-2 text-xs text-white/50">
                      {new Date(s.startDate).toLocaleDateString()} → {new Date(s.endDate).toLocaleDateString()}
                    </div>
                  </div>
                <select
                    className="h-10 rounded-xl border border-white/10 bg-white/5 px-3 text-sm"
                    value={s.status}
                    onChange={async (e) => {
                      if (!selection.workspace || !selection.project) return;
                      const next = e.target.value as SprintStatus;
                      try {
                        const updated = await updateSprintStatus(selection.workspace.id, selection.project.id, s.id, next);
                        setItems((prev) => prev.map((x) => (x.id === s.id ? updated : x)));
                        toast.success("Sprint status updated");
                      } catch (err) {
                        toast.error(getApiErrorMessage(err));
                      }
                    }}
                  >
                    <option value="PLANNED">PLANNED</option>
                    <option value="ACTIVE">ACTIVE</option>
                    <option value="COMPLETED">COMPLETED</option>
                    <option value="CANCELLED">CANCELLED</option>
                  </select>
                </div>
                <div className="mt-3 flex justify-end">
                  <Button variant="ghost" size="sm" onClick={() => setAssignOpen({ sprint: s })}>
                    Assign tasks
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <CreateSprintModal
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        onCreated={(s) => setItems((prev) => [s, ...prev])}
      />

      <AssignTasksModal
        open={Boolean(assignOpen)}
        onClose={() => setAssignOpen(null)}
        sprint={assignOpen?.sprint ?? null}
      />
    </div>
  );
}

function CreateSprintModal({
  open,
  onClose,
  onCreated,
}: {
  open: boolean;
  onClose: () => void;
  onCreated: (s: SprintResponse) => void;
}) {
  const { selection } = useAppContext();
  const [name, setName] = useState("");
  const [goal, setGoal] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [loading, setLoading] = useState(false);

  return (
    <Modal open={open} onClose={onClose} title="Create sprint">
      <div className="space-y-3">
        <div className="space-y-1">
          <div className="text-xs font-medium text-white/70">Name</div>
          <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Sprint 1" />
        </div>
        <div className="space-y-1">
          <div className="text-xs font-medium text-white/70">Goal</div>
          <Input value={goal} onChange={(e) => setGoal(e.target.value)} placeholder="Release MVP" />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1">
            <div className="text-xs font-medium text-white/70">Start</div>
            <Input value={startDate} onChange={(e) => setStartDate(e.target.value)} type="date" />
          </div>
          <div className="space-y-1">
            <div className="text-xs font-medium text-white/70">End</div>
            <Input value={endDate} onChange={(e) => setEndDate(e.target.value)} type="date" />
          </div>
        </div>

        <div className="flex justify-end gap-2 pt-2">
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button
            disabled={loading}
            onClick={async () => {
              if (!selection.workspace || !selection.project) return;
              setLoading(true);
              try {
                const s = await createSprint(selection.workspace.id, selection.project.id, {
                  name,
                  goal,
                  startDate: new Date(startDate).toISOString(),
                  endDate: new Date(endDate).toISOString(),
                });
                toast.success("Sprint created");
                onClose();
                onCreated(s);
                setName("");
                setGoal("");
                setStartDate("");
                setEndDate("");
              } catch (e) {
                toast.error(getApiErrorMessage(e));
              } finally {
                setLoading(false);
              }
            }}
          >
            {loading ? "Creating..." : "Create"}
          </Button>
        </div>
      </div>
    </Modal>
  );
}

function AssignTasksModal({
  open,
  onClose,
  sprint,
}: {
  open: boolean;
  onClose: () => void;
  sprint: SprintResponse | null;
}) {
  const { selection } = useAppContext();
  const [tasks, setTasks] = useState<TaskResponse[]>([]);
  const [selected, setSelected] = useState<Record<number, boolean>>({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!open) return;
    if (!selection.workspace || !selection.project) return;
    setLoading(true);
    getTasks(selection.workspace.id, selection.project.id)
      .then((ts) => {
        setTasks(ts);
        const init: Record<number, boolean> = {};
        for (const t of ts) init[t.id] = Boolean(t.sprintId && sprint && t.sprintId === sprint.id);
        setSelected(init);
      })
      .catch((e) => toast.error(getApiErrorMessage(e)))
      .finally(() => setLoading(false));
  }, [open, selection.workspace, selection.project, sprint]);

  return (
    <Modal open={open} onClose={onClose} title={sprint ? `Assign tasks → ${sprint.name}` : "Assign tasks"}>
      {!sprint ? (
        <div className="text-sm text-white/60">Select a sprint.</div>
      ) : (
        <div className="space-y-3">
          {loading ? <div className="text-sm text-white/60">Loading tasks...</div> : null}
          <div className="max-h-[45vh] space-y-2 overflow-auto pr-1">
            {tasks.map((t) => (
              <label
                key={t.id}
                className="flex cursor-pointer items-start gap-3 rounded-2xl border border-white/10 bg-white/5 p-3 hover:bg-white/10"
              >
                <input
                  type="checkbox"
                  checked={Boolean(selected[t.id])}
                  onChange={(e) => setSelected((prev) => ({ ...prev, [t.id]: e.target.checked }))}
                />
                <div className="text-left">
                  <div className="text-sm font-semibold text-white">{t.title}</div>
                  <div className="text-xs text-white/60">
                    {t.status} · {t.priority} {t.sprintId ? `· sprintId=${t.sprintId}` : ""}
                  </div>
                </div>
              </label>
            ))}
            {tasks.length === 0 && !loading ? <div className="text-sm text-white/60">No tasks.</div> : null}
          </div>

          <div className="flex justify-end gap-2">
            <Button variant="ghost" onClick={onClose}>
              Close
            </Button>
            <Button
              onClick={async () => {
                if (!selection.workspace || !selection.project) return;
                const toAssign = tasks.filter((t) => selected[t.id] && t.sprintId !== sprint.id).map((t) => t.id);
                const toRemove = tasks.filter((t) => !selected[t.id] && t.sprintId === sprint.id).map((t) => t.id);
                try {
                  if (toAssign.length) {
                    await assignTasksToSprint(selection.workspace.id, selection.project.id, sprint.id, toAssign);
                  }
                  if (toRemove.length) {
                    await removeTasksFromSprint(selection.workspace.id, selection.project.id, sprint.id, toRemove);
                  }
                  toast.success("Sprint tasks updated");
                  onClose();
                } catch (e) {
                  toast.error(getApiErrorMessage(e));
                }
              }}
            >
              Save
            </Button>
          </div>
        </div>
      )}
    </Modal>
  );
}

