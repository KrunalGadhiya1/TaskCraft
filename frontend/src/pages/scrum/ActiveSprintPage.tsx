import { useEffect, useMemo, useState } from "react";
import { DndContext, PointerSensor, closestCenter, useDroppable, useDraggable, useSensor, useSensors } from "@dnd-kit/core";
import type { DragEndEvent } from "@dnd-kit/core";
import { toast } from "sonner";
import { Flame, Rocket, Timer, TriangleAlert } from "lucide-react";
import { motion } from "framer-motion";
import { useAppContext } from "../../app/AppContext";
import { getApiErrorMessage } from "../../lib/api";
import { getSprints, type SprintResponse } from "../../api/sprints";
import { getTasks, updateTaskStatus, type TaskResponse, type TaskStatus } from "../../api/tasks";
import { cn } from "../../lib/cn";
import { Button } from "../../components/ui/Button";

type SprintColumnId = "TODO" | "IN_PROGRESS" | "IN_REVIEW" | "DONE";

const COLUMNS: { id: SprintColumnId; title: string }[] = [
  { id: "TODO", title: "To Do" },
  { id: "IN_PROGRESS", title: "In Progress" },
  { id: "IN_REVIEW", title: "In Review" },
  { id: "DONE", title: "Done" },
];

export function ActiveSprintPage() {
  const { selection } = useAppContext();
  const [sprints, setSprints] = useState<SprintResponse[]>([]);
  const [tasks, setTasks] = useState<TaskResponse[]>([]);
  const [loading, setLoading] = useState(false);

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 6 } }));

  useEffect(() => {
    if (!selection.workspace || !selection.project) return;
    setLoading(true);
    Promise.all([
      getSprints(selection.workspace.id, selection.project.id),
      getTasks(selection.workspace.id, selection.project.id),
    ])
      .then(([ss, ts]) => {
        setSprints(ss);
        setTasks(ts);
      })
      .catch((e) => toast.error(getApiErrorMessage(e)))
      .finally(() => setLoading(false));
  }, [selection.workspace, selection.project]);

  const activeSprint = useMemo(() => {
    const actives = sprints.filter((s) => s.status === "ACTIVE");
    if (actives.length === 0) return null;
    // pick the one with latest startDate
    return actives.sort((a, b) => +new Date(b.startDate) - +new Date(a.startDate))[0];
  }, [sprints]);

  const sprintTasks = useMemo(() => {
    if (!activeSprint) return [];
    return tasks.filter((t) => t.sprintId === activeSprint.id && t.status !== "CANCELED");
  }, [tasks, activeSprint]);

  const byStatus = useMemo(() => {
    const map: Record<SprintColumnId, TaskResponse[]> = { TODO: [], IN_PROGRESS: [], IN_REVIEW: [], DONE: [] };
    for (const t of sprintTasks) {
      const s = t.status as SprintColumnId;
      if (map[s]) map[s].push(t);
    }
    return map;
  }, [sprintTasks]);

  const health = useMemo(() => {
    const totalPoints = sprintTasks.reduce((sum, t) => sum + (t.storyPoints ?? 0), 0);
    const donePoints = sprintTasks.filter((t) => t.status === "DONE").reduce((sum, t) => sum + (t.storyPoints ?? 0), 0);
    const remainingPoints = Math.max(0, totalPoints - donePoints);
    const now = Date.now();
    const overdueCount = sprintTasks.filter((t) => t.dueDate && new Date(t.dueDate).getTime() < now && t.status !== "DONE").length;
    const dueSoonCount = sprintTasks.filter((t) => {
      if (!t.dueDate) return false;
      const ms = new Date(t.dueDate).getTime() - now;
      return ms > 0 && ms <= 24 * 60 * 60 * 1000 && t.status !== "DONE";
    }).length;
    const completion = totalPoints ? Math.round((donePoints / totalPoints) * 100) : 0;
    return { totalPoints, donePoints, remainingPoints, overdueCount, dueSoonCount, completion };
  }, [sprintTasks]);

  async function onDragEnd(e: DragEndEvent) {
    const taskId = Number(e.active.id);
    const overColumnId = e.over?.id ? String(e.over.id) : null;
    if (!overColumnId) return;
    if (!selection.workspace || !selection.project) return;
    if (!activeSprint) return;

    const toStatus = overColumnId as SprintColumnId;
    const current = tasks.find((t) => t.id === taskId);
    if (!current) return;
    if (current.status === toStatus) return;

    const prev = tasks;
    setTasks((p) => p.map((t) => (t.id === taskId ? { ...t, status: toStatus as TaskStatus } : t)));
    try {
      const updated = await updateTaskStatus(selection.workspace.id, selection.project.id, taskId, toStatus as TaskStatus);
      setTasks((p) => p.map((t) => (t.id === taskId ? updated : t)));
      toast.success(`Moved to ${toStatus.replaceAll("_", " ")}`);
    } catch (err) {
      setTasks(prev);
      toast.error(getApiErrorMessage(err));
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between gap-3">
        <div className="text-left">
          <div className="text-xl font-semibold text-white">Active Sprint</div>
          <div className="text-sm text-white/60">
            {loading ? "Loading sprint..." : activeSprint ? `${activeSprint.name} · focus execution` : "No active sprint"}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" onClick={() => location.assign("/app/sprints")}>
            <Rocket className="h-4 w-4" />
            Sprints
          </Button>
          <Button variant="ghost" size="sm" onClick={() => location.assign("/app/backlog")}>
            <Flame className="h-4 w-4" />
            Backlog
          </Button>
        </div>
      </div>

      {activeSprint ? (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
          <HealthCard title="Story points" value={`${health.donePoints}/${health.totalPoints}`} sub={`${health.completion}% complete`} />
          <HealthCard title="Remaining" value={`${health.remainingPoints}`} sub="points left" />
          <HealthCard
            title="Due soon (24h)"
            value={`${health.dueSoonCount}`}
            sub={health.dueSoonCount ? "keep momentum" : "all clear"}
            tone={health.dueSoonCount ? "warn" : "ok"}
          />
          <HealthCard
            title="Overdue"
            value={`${health.overdueCount}`}
            sub={health.overdueCount ? "needs attention" : "no overdue tasks"}
            tone={health.overdueCount ? "danger" : "ok"}
          />
        </div>
      ) : null}

      {!activeSprint ? (
        <div className="glass rounded-2xl p-4">
          <div className="text-sm text-white/70">
            No ACTIVE sprint found. Go to <span className="font-semibold text-white">Sprints</span> and set one sprint status to{" "}
            <span className="font-semibold text-white">ACTIVE</span>.
          </div>
        </div>
      ) : (
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={onDragEnd}>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
            {COLUMNS.map((col) => (
              <SprintColumn key={col.id} id={col.id}>
                <div className="mb-3 flex items-center justify-between">
                  <div className="text-sm font-semibold text-white">{col.title}</div>
                  <div className="text-xs text-white/50">{byStatus[col.id].length}</div>
                </div>
                <div className="min-h-[140px]">
                  <motion.div layout className="space-y-2">
                    {byStatus[col.id].map((t) => (
                      <SprintCard key={t.id} task={t} />
                    ))}
                    {byStatus[col.id].length === 0 ? (
                      <div className="rounded-2xl border border-white/10 bg-white/5 p-3 text-xs text-white/50">
                        Drag tasks here
                      </div>
                    ) : null}
                  </motion.div>
                </div>
              </SprintColumn>
            ))}
          </div>
        </DndContext>
      )}
    </div>
  );
}

function HealthCard({
  title,
  value,
  sub,
  tone,
}: {
  title: string;
  value: string;
  sub: string;
  tone?: "ok" | "warn" | "danger";
}) {
  const icon =
    tone === "danger" ? (
      <TriangleAlert className="h-4 w-4 text-rose-200" />
    ) : tone === "warn" ? (
      <Timer className="h-4 w-4 text-amber-200" />
    ) : (
      <Flame className="h-4 w-4 text-violet-200" />
    );

  return (
    <div className="glass rounded-2xl p-4">
      <div className="flex items-center justify-between gap-2">
        <div className="text-xs font-medium text-white/60">{title}</div>
        {icon}
      </div>
      <div className="mt-2 text-2xl font-semibold text-white">{value}</div>
      <div className="mt-1 text-xs text-white/50">{sub}</div>
    </div>
  );
}

function SprintColumn({ id, children }: { id: SprintColumnId; children: React.ReactNode }) {
  const { setNodeRef, isOver } = useDroppable({ id });
  return <div ref={setNodeRef} className={cn("glass rounded-2xl p-3", isOver && "ring-2 ring-violet-300/25")}>{children}</div>;
}

function SprintCard({ task }: { task: TaskResponse }) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({ id: task.id });
  const style = transform ? { transform: `translate3d(${transform.x}px, ${transform.y}px, 0)` } : undefined;

  const dueLabel = useMemo(() => {
    if (!task.dueDate) return null;
    const d = new Date(task.dueDate);
    if (Number.isNaN(d.getTime())) return null;
    return d.toLocaleString();
  }, [task.dueDate]);

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      className={cn(
        "rounded-2xl border border-white/10 bg-white/5 p-3 text-left",
        "hover:bg-white/[0.08] transition",
        isDragging && "opacity-70",
      )}
      title="Drag to move status"
    >
      <div className="flex items-start justify-between gap-2">
        <div className="text-sm font-medium text-white">{task.title}</div>
        {task.issueKey ? (
          <div className="shrink-0 rounded-xl border border-white/10 bg-white/5 px-2 py-0.5 text-[10px] font-semibold text-white/80">
            {task.issueKey}
          </div>
        ) : null}
      </div>
      <div className="mt-1 text-xs text-white/60">
        {task.type} · {task.priority}
        {task.storyPoints != null ? ` · ${task.storyPoints} pts` : ""}
      </div>
      {dueLabel ? <div className="mt-1 text-[11px] text-white/50">Due: {dueLabel}</div> : null}
    </div>
  );
}

