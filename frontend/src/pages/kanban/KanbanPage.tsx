import { useEffect, useMemo, useState } from "react";
import confetti from "canvas-confetti";
import { DndContext, PointerSensor, closestCenter, useDroppable, useDraggable, useSensor, useSensors } from "@dnd-kit/core";
import type { DragEndEvent } from "@dnd-kit/core";
import { motion } from "framer-motion";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import { useAppContext } from "../../app/AppContext";
import {
  createTask,
  getTasks,
  updateTaskStatus,
  updateTask,
  type TaskPriority,
  type TaskResponse,
  type TaskStatus,
  type TaskType,
} from "../../api/tasks";
import { getApiErrorMessage } from "../../lib/api";
import { Button } from "../../components/ui/Button";
import { Input } from "../../components/ui/Input";
import { Modal } from "../../components/ui/Modal";
import { SideDrawer } from "../../components/ui/SideDrawer";
import { cn } from "../../lib/cn";
import {
  addComment,
  getAttachments,
  getComments,
  uploadAttachment,
  type AttachmentResponse,
  type CommentResponse,
} from "../../api/taskCollaboration";

type ColumnId = "BACKLOG" | "TODO" | "IN_PROGRESS" | "IN_REVIEW" | "DONE";

const COLUMNS: { id: ColumnId; title: string }[] = [
  { id: "BACKLOG", title: "Backlog" },
  { id: "TODO", title: "To Do" },
  { id: "IN_PROGRESS", title: "In Progress" },
  { id: "IN_REVIEW", title: "In Review" },
  { id: "DONE", title: "Done" },
];

export function KanbanPage() {
  const { selection } = useAppContext();
  const [tasks, setTasks] = useState<TaskResponse[]>([]);
  const [loading, setLoading] = useState(false);
  const [createOpen, setCreateOpen] = useState(false);
  const [detailTask, setDetailTask] = useState<TaskResponse | null>(null);

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 6 } }));

  useEffect(() => {
    if (!selection.workspace || !selection.project) return;
    setLoading(true);
    getTasks(selection.workspace.id, selection.project.id)
      .then(setTasks)
      .catch((e) => toast.error(getApiErrorMessage(e)))
      .finally(() => setLoading(false));
  }, [selection.workspace, selection.project]);

  const byStatus = useMemo(() => {
    const map: Record<ColumnId, TaskResponse[]> = { BACKLOG: [], TODO: [], IN_PROGRESS: [], IN_REVIEW: [], DONE: [] };
    for (const t of tasks) {
      const s = t.status as ColumnId;
      if (map[s]) map[s].push(t);
    }
    return map;
  }, [tasks]);

  async function onDragEnd(e: DragEndEvent) {
    const taskId = Number(e.active.id);
    const overColumnId = e.over?.id ? String(e.over.id) : null;
    if (!overColumnId) return;
    if (!selection.workspace || !selection.project) return;

    const toStatus = overColumnId as ColumnId;
    const current = tasks.find((t) => t.id === taskId);
    if (!current) return;
    if (current.status === toStatus) return;

    const prevTasks = tasks;
    setTasks((prev) => prev.map((t) => (t.id === taskId ? { ...t, status: toStatus as TaskStatus } : t)));
    try {
      if (toStatus === "DONE") {
        confetti({
          particleCount: 150,
          spread: 80,
          origin: { y: 0.6 },
          colors: ['#6366f1', '#a855f7', '#ec4899', '#3b82f6', '#ffffff'],
          zIndex: 9999
        });
      }
      await updateTaskStatus(selection.workspace.id, selection.project.id, taskId, toStatus as TaskStatus);
      toast.success(`Moved to ${toStatus.replaceAll("_", " ")}`);
    } catch (err) {
      setTasks(prevTasks);
      toast.error(getApiErrorMessage(err));
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between gap-3">
        <div className="text-left">
          <div className="text-xl font-semibold text-white">Kanban</div>
          <div className="text-sm text-white/60">
            {loading ? "Syncing tasks..." : "Drag tasks across the universe"}
          </div>
        </div>
        <Button variant="ghost" size="sm" onClick={() => setCreateOpen(true)}>
          <Plus className="h-4 w-4" />
          New task
        </Button>
      </div>

      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={onDragEnd}>
        <div className="flex gap-4 overflow-x-auto pb-4 snap-x snap-mandatory hide-scrollbar md:grid md:grid-cols-5 md:overflow-visible md:snap-none">
          {COLUMNS.map((col) => {
            const columnTasks = byStatus[col.id];
            return (
              <KanbanColumn key={col.id} id={col.id}>
                <div className="mb-3 flex items-center justify-between">
                  <div className="text-sm font-semibold text-white">{col.title}</div>
                  <div className="text-xs text-white/50">{columnTasks.length}</div>
                </div>

                <div className="min-h-[120px]">
                  <motion.div layout className="space-y-2">
                    {columnTasks.map((t) => (
                      <KanbanCard key={t.id} task={t} onOpen={() => setDetailTask(t)} />
                    ))}
                  </motion.div>
                </div>
              </KanbanColumn>
            );
          })}
        </div>
      </DndContext>

      <CreateTaskModal
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        onCreated={(t) => setTasks((prev) => [t, ...prev])}
      />

      <TaskDetailsModal
        task={detailTask}
        onClose={() => setDetailTask(null)}
        onUpdated={(t) => setTasks((prev) => prev.map((x) => (x.id === t.id ? t : x)))}
      />
    </div>
  );
}

function KanbanColumn({
  id,
  children,
}: {
  id: ColumnId;
  children: React.ReactNode;
}) {
  const { setNodeRef, isOver } = useDroppable({ id });
  return (
    <div ref={setNodeRef} className={cn("glass rounded-2xl p-3 min-w-[85vw] shrink-0 snap-center md:min-w-0 flex flex-col h-full", isOver && "ring-2 ring-violet-300/25")}>
      {children}
    </div>
  );
}

function KanbanCard({ task, onOpen }: { task: TaskResponse; onOpen: () => void }) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({ id: task.id });
  const style = transform
    ? { transform: `translate3d(${transform.x}px, ${transform.y}px, 0)` }
    : undefined;

  const priorityColor = {
    CRITICAL: "bg-red-500/10 text-red-400 border-red-500/20",
    HIGH: "bg-orange-500/10 text-orange-400 border-orange-500/20",
    MEDIUM: "bg-blue-500/10 text-blue-400 border-blue-500/20",
    LOW: "bg-white/5 text-white/40 border-white/10",
  }[task.priority] || "bg-white/5 text-white/40 border-white/10";

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      className={cn(
        "rounded-xl border border-white/5 bg-[#1C1E24] p-3 text-left shadow-sm",
        "hover:border-white/10 hover:bg-[#23252C] transition-colors cursor-grab active:cursor-grabbing",
        isDragging && "opacity-60 ring-2 ring-indigo-500 scale-105 shadow-xl",
      )}
      onDoubleClick={onOpen}
    >
      <div className="flex items-start justify-between gap-2 mb-2">
        {task.issueKey ? (
          <div className="shrink-0 text-[10px] font-semibold tracking-wider text-white/40 group-hover:text-white/60 transition-colors">
            {task.issueKey}
          </div>
        ) : <div />}
        <div className={cn("shrink-0 rounded px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider border", priorityColor)}>
          {task.priority}
        </div>
      </div>
      <div className="text-sm font-medium text-white/90 leading-snug">{task.title}</div>
      <div className="mt-3 flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <div className="flex h-5 w-5 items-center justify-center rounded-full bg-indigo-500/20 text-[9px] font-bold text-indigo-300 ring-1 ring-indigo-500/30">
            {task.type.charAt(0)}
          </div>
          {task.storyPoints != null && (
            <div className="flex h-5 w-5 items-center justify-center rounded-full bg-white/5 text-[10px] font-medium text-white/50">
              {task.storyPoints}
            </div>
          )}
        </div>
        <div className="h-5 w-5 rounded-full bg-gradient-to-br from-purple-400 to-blue-500 ring-1 ring-white/10 shadow-inner" />
      </div>
    </div>
  );
}

function CreateTaskModal({
  open,
  onClose,
  onCreated,
}: {
  open: boolean;
  onClose: () => void;
  onCreated: (t: TaskResponse) => void;
}) {
  const { selection } = useAppContext();
  const [title, setTitle] = useState("");
  const [priority, setPriority] = useState<TaskPriority>("MEDIUM");
  const [type, setType] = useState<TaskType>("TASK");
  const [loading, setLoading] = useState(false);

  return (
    <Modal open={open} onClose={onClose} title="Create task">
      <div className="space-y-3">
        <div className="space-y-1">
          <div className="text-xs font-medium text-white/70">Title</div>
          <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Implement notifications" />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1">
            <div className="text-xs font-medium text-white/70">Type</div>
            <select
              className="h-10 w-full rounded-xl border border-white/10 bg-white/5 px-3 text-sm"
              value={type}
              onChange={(e) => setType(e.target.value as TaskType)}
            >
              <option value="TASK">TASK</option>
              <option value="BUG">BUG</option>
              <option value="STORY">STORY</option>
              <option value="SUBTASK">SUBTASK</option>
            </select>
          </div>
          <div className="space-y-1">
            <div className="text-xs font-medium text-white/70">Priority</div>
            <select
              className="h-10 w-full rounded-xl border border-white/10 bg-white/5 px-3 text-sm"
              value={priority}
              onChange={(e) => setPriority(e.target.value as TaskPriority)}
            >
              <option value="LOW">LOW</option>
              <option value="MEDIUM">MEDIUM</option>
              <option value="HIGH">HIGH</option>
              <option value="CRITICAL">CRITICAL</option>
            </select>
          </div>
        </div>

        <div className="flex items-center justify-end gap-2 pt-2">
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button
            disabled={loading}
            onClick={async () => {
              if (!selection.workspace || !selection.project) return;
              setLoading(true);
              try {
                const created = await createTask(selection.workspace.id, selection.project.id, {
                  title,
                  description: "",
                  type,
                  priority,
                });
                toast.success("Task created");
                setTitle("");
                setPriority("MEDIUM");
                setType("TASK");
                onClose();
                onCreated(created);
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

function TaskDetailsModal({
  task,
  onClose,
  onUpdated,
}: {
  task: TaskResponse | null;
  onClose: () => void;
  onUpdated: (t: TaskResponse) => void;
}) {
  const { selection } = useAppContext();
  const [tab, setTab] = useState<"details" | "comments" | "attachments">("details");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [type, setType] = useState<TaskType>("TASK");
  const [priority, setPriority] = useState<TaskPriority>("MEDIUM");
  const [saving, setSaving] = useState(false);

  const [comments, setComments] = useState<CommentResponse[]>([]);
  const [commentText, setCommentText] = useState("");
  const [attachments, setAttachments] = useState<AttachmentResponse[]>([]);

  useEffect(() => {
    if (!task) return;
    setTitle(task.title);
    setDescription(task.description ?? "");
    setType(task.type);
    setPriority(task.priority);
    setTab("details");
  }, [task]);

  useEffect(() => {
    if (!task || !selection.workspace || !selection.project) return;
    if (tab === "comments") {
      getComments(selection.workspace.id, selection.project.id, task.id)
        .then(setComments)
        .catch((e) => toast.error(getApiErrorMessage(e)));
    }
    if (tab === "attachments") {
      getAttachments(selection.workspace.id, selection.project.id, task.id)
        .then(setAttachments)
        .catch((e) => toast.error(getApiErrorMessage(e)));
    }
  }, [tab, task, selection.workspace, selection.project]);
  return (
    <SideDrawer open={Boolean(task)} onClose={onClose} title={task ? `Task ${task.issueKey || `#${task.id}`}` : "Task Details"}>
      {!task ? null : (
        <div className="space-y-6">
          <div className="flex items-center gap-2 border-b border-white/5 pb-2">
            <TabButton active={tab === "details"} onClick={() => setTab("details")}>
              Details
            </TabButton>
            <TabButton active={tab === "comments"} onClick={() => setTab("comments")}>
              Comments
            </TabButton>
            <TabButton active={tab === "attachments"} onClick={() => setTab("attachments")}>
              Attachments
            </TabButton>
          </div>

          {tab === "details" ? (
            <div className="space-y-5">
              <div className="space-y-2">
                <div className="text-xs font-semibold text-white/50 uppercase tracking-widest">Title</div>
                <input
                  className="w-full bg-transparent text-xl font-semibold text-white outline-none placeholder:text-white/20"
                  value={title}
                  placeholder="Task title"
                  onChange={(e) => setTitle(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <div className="text-xs font-semibold text-white/50 uppercase tracking-widest">Description</div>
                <textarea
                  className="min-h-[150px] w-full resize-none rounded-xl border border-white/5 bg-[#1A1C20] p-3 text-sm text-white/80 outline-none transition-colors focus:border-indigo-500/50 focus:bg-[#1C1E24]"
                  value={description}
                  placeholder="Add a more detailed description..."
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div className="text-xs font-semibold text-white/50 uppercase tracking-widest">Type</div>
                  <select
                    className="h-10 w-full rounded-lg border border-white/5 bg-[#1A1C20] px-3 justify-between text-sm text-white outline-none"
                    value={type}
                    onChange={(e) => setType(e.target.value as TaskType)}
                  >
                    <option value="TASK">Task</option>
                    <option value="BUG">Bug</option>
                    <option value="STORY">Story</option>
                    <option value="SUBTASK">Subtask</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <div className="text-xs font-semibold text-white/50 uppercase tracking-widest">Priority</div>
                  <select
                    className="h-10 w-full rounded-lg border border-white/5 bg-[#1A1C20] px-3 text-sm text-white outline-none"
                    value={priority}
                    onChange={(e) => setPriority(e.target.value as TaskPriority)}
                  >
                    <option value="LOW">Low</option>
                    <option value="MEDIUM">Medium</option>
                    <option value="HIGH">High</option>
                    <option value="CRITICAL">Critical</option>
                  </select>
                </div>
              </div>
              <div className="flex justify-end gap-3 pt-4 border-t border-white/5 mt-4">
                <button
                  className="rounded-lg px-4 py-2 text-sm font-medium text-white/60 hover:bg-white/5 hover:text-white transition-colors"
                  onClick={onClose}
                >
                  Cancel
                </button>
                <button
                  disabled={saving}
                  className="rounded-lg bg-indigo-500 px-6 py-2 text-sm font-medium text-white hover:bg-indigo-600 transition-colors disabled:opacity-50"
                  onClick={async () => {
                    if (!selection.workspace || !selection.project) return;
                    setSaving(true);
                    try {
                      const updated = await updateTask(selection.workspace.id, selection.project.id, task.id, {
                        title,
                        description,
                        type,
                        priority,
                        storyPoints: undefined,
                        dueDate: undefined,
                      });
                      toast.success("Task saved");
                      onUpdated(updated);
                      onClose();
                    } catch (e) {
                      toast.error(getApiErrorMessage(e));
                    } finally {
                      setSaving(false);
                    }
                  }}
                >
                  {saving ? "Saving..." : "Save changes"}
                </button>
              </div>
            </div>
          ) : null}

          {tab === "comments" ? (
            <div className="space-y-5">
              <div className="space-y-3">
                <textarea
                  className="min-h-[100px] w-full resize-none rounded-xl border border-white/5 bg-[#1A1C20] p-3 text-sm text-white/80 outline-none transition-colors focus:border-indigo-500/50"
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  placeholder="Drop a comment..."
                />
                <div className="flex justify-end">
                  <button
                    className="rounded-lg bg-white/10 px-4 py-2 text-sm font-medium text-white hover:bg-white/20 transition-colors"
                    onClick={async () => {
                      if (!selection.workspace || !selection.project) return;
                      try {
                        const created = await addComment(selection.workspace.id, selection.project.id, task.id, commentText);
                        setComments((prev) => [created, ...prev]);
                        setCommentText("");
                        toast.success("Comment added");
                      } catch (e) {
                        toast.error(getApiErrorMessage(e));
                      }
                    }}
                  >
                    Post comment
                  </button>
                </div>
              </div>

              <div className="space-y-4 pt-4 border-t border-white/5">
                {comments.length === 0 ? (
                  <div className="py-8 text-center text-sm text-white/40">No activity yet.</div>
                ) : (
                  comments.map((c) => (
                    <div key={c.id} className="flex gap-3">
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-indigo-500/20 text-xs font-bold text-indigo-300">
                        {c.authorUsername.charAt(0).toUpperCase()}
                      </div>
                      <div className="flex-1 space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-semibold text-white/90">{c.authorUsername}</span>
                          <span className="text-[10px] text-white/40">{new Date(c.createdAt).toLocaleString()}</span>
                        </div>
                        <div className="text-sm text-white/70 bg-[#1A1C20] p-3 rounded-tr-xl rounded-b-xl border border-white/5 inline-block">
                          {c.content}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          ) : null}

          {/* Attachments UI (leaving existing logic mostly, just styling) */}
          {tab === "attachments" ? (
             <div className="space-y-3">
               <div className="space-y-2">
                 {attachments.length === 0 ? (
                   <div className="text-sm text-white/60">No attachments.</div>
                 ) : (
                   attachments.map((a) => (
                     <a
                       key={a.id}
                       href={a.url.startsWith("http") ? a.url : `${import.meta.env.VITE_API_BASE_URL?.replace("/api", "") ?? "http://localhost:8080"}${a.url}`}
                       target="_blank"
                       className="block rounded-xl border border-white/5 bg-[#1A1C20] p-3 text-left hover:border-white/20 transition-colors"
                       rel="noreferrer"
                     >
                       <div className="text-sm font-semibold text-white/90">{a.fileName}</div>
                       <div className="mt-1 text-xs text-white/40 truncate">{a.url}</div>
                     </a>
                   ))
                 )}
               </div>
               
               <div className="pt-4 border-t border-white/5 space-y-3">
                 <input type="file" className="text-sm text-white/60 file:mr-4 file:rounded-full file:border-0 file:bg-white/10 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-white hover:file:bg-white/20 cursor-pointer" 
                   onChange={async (e) => {
                       const target = e.target;
                       const file = target.files?.[0];
                       if (!file) return;
                       if (!selection.workspace || !selection.project) return;
                       try {
                         const created = await uploadAttachment(selection.workspace.id, selection.project.id, task.id, file);
                         setAttachments((prev) => [created, ...prev]);
                         toast.success("File uploaded");
                         target.value = "";
                       } catch (err) {
                         toast.error(getApiErrorMessage(err));
                       }
                     }}
                 />
               </div>
             </div>
          ) : null}

        </div>
      )}
    </SideDrawer>
  );
}

function TabButton({ active, children, onClick }: { active: boolean; children: React.ReactNode; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={[
        "relative rounded px-3 py-1.5 text-xs font-semibold uppercase tracking-wider transition-colors",
        active ? "text-white" : "text-white/40 hover:text-white/80",
      ].join(" ")}
    >
      {active && (
        <motion.div
          layoutId="tab"
          className="absolute inset-0 z-[-1] rounded bg-white/10"
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
        />
      )}
      {children}
    </button>
  );
}

