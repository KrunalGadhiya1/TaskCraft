import { useEffect, useMemo, useState } from "react";
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
import { cn } from "../../lib/cn";
import {
  addAttachment,
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
        <div className="grid grid-cols-1 gap-4 md:grid-cols-5">
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
    <div ref={setNodeRef} className={cn("glass rounded-2xl p-3", isOver && "ring-2 ring-violet-300/25")}>
      {children}
    </div>
  );
}

function KanbanCard({ task, onOpen }: { task: TaskResponse; onOpen: () => void }) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({ id: task.id });
  const style = transform
    ? { transform: `translate3d(${transform.x}px, ${transform.y}px, 0)` }
    : undefined;

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
      onDoubleClick={onOpen}
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
        {task.type} · Priority: {task.priority}
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
  const [attName, setAttName] = useState("");
  const [attUrl, setAttUrl] = useState("");

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
    <Modal open={Boolean(task)} onClose={onClose} title={task ? `Task #${task.id}` : "Task"}>
      {!task ? null : (
        <div className="space-y-3">
          <div className="flex items-center gap-2">
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
            <div className="space-y-3">
              <div className="space-y-1">
                <div className="text-xs font-medium text-white/70">Title</div>
                <Input value={title} onChange={(e) => setTitle(e.target.value)} />
              </div>
              <div className="space-y-1">
                <div className="text-xs font-medium text-white/70">Description</div>
                <textarea
                  className="min-h-[110px] w-full rounded-xl border border-white/10 bg-white/5 p-3 text-sm text-white outline-none focus:ring-2 focus:ring-violet-400/30"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <div className="text-xs font-medium text-white/70">Type</div>
                  <select
                    className="h-10 w-full rounded-xl border border-white/10 bg-white/5 px-3 text-sm text-white"
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
                    className="h-10 w-full rounded-xl border border-white/10 bg-white/5 px-3 text-sm text-white"
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
              <div className="flex justify-end gap-2 pt-1">
                <Button variant="ghost" onClick={onClose}>
                  Close
                </Button>
                <Button
                  disabled={saving}
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
                      toast.success("Task updated");
                      onUpdated(updated);
                      onClose();
                    } catch (e) {
                      toast.error(getApiErrorMessage(e));
                    } finally {
                      setSaving(false);
                    }
                  }}
                >
                  {saving ? "Saving..." : "Save"}
                </Button>
              </div>
            </div>
          ) : null}

          {tab === "comments" ? (
            <div className="space-y-3">
              <div className="space-y-2">
                {comments.length === 0 ? (
                  <div className="text-sm text-white/60">No comments.</div>
                ) : (
                  comments.map((c) => (
                    <div key={c.id} className="rounded-2xl border border-white/10 bg-white/5 p-3">
                      <div className="flex items-start justify-between gap-3">
                        <div className="text-sm font-semibold text-white">{c.authorUsername}</div>
                        <div className="text-xs text-white/50">{new Date(c.createdAt).toLocaleString()}</div>
                      </div>
                      <div className="mt-1 text-sm text-white/70">{c.content}</div>
                    </div>
                  ))
                )}
              </div>

              <div className="space-y-2">
                <textarea
                  className="min-h-[90px] w-full rounded-xl border border-white/10 bg-white/5 p-3 text-sm text-white outline-none focus:ring-2 focus:ring-violet-400/30"
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  placeholder="Write a comment..."
                />
                <div className="flex justify-end">
                  <Button
                    variant="ghost"
                    onClick={async () => {
                      if (!selection.workspace || !selection.project) return;
                      try {
                        const created = await addComment(selection.workspace.id, selection.project.id, task.id, commentText);
                        setComments((prev) => [...prev, created]);
                        setCommentText("");
                        toast.success("Comment added");
                      } catch (e) {
                        toast.error(getApiErrorMessage(e));
                      }
                    }}
                  >
                    Add comment
                  </Button>
                </div>
              </div>
            </div>
          ) : null}

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
                      className="block rounded-2xl border border-white/10 bg-white/5 p-3 text-left hover:bg-white/10"
                      rel="noreferrer"
                    >
                      <div className="text-sm font-semibold text-white">{a.fileName}</div>
                      <div className="mt-1 text-xs text-white/60">{a.url}</div>
                    </a>
                  ))
                )}
              </div>

              <div className="rounded-2xl border border-white/10 bg-white/5 p-3">
                <div className="text-sm font-semibold text-white">Add attachment (metadata)</div>
                <div className="mt-2 space-y-2">
                  <Input value={attName} onChange={(e) => setAttName(e.target.value)} placeholder="File name" />
                  <Input value={attUrl} onChange={(e) => setAttUrl(e.target.value)} placeholder="URL (e.g. Drive link)" />
                  <div className="flex justify-end">
                    <Button
                      variant="ghost"
                      onClick={async () => {
                        if (!selection.workspace || !selection.project) return;
                        try {
                          const created = await addAttachment(selection.workspace.id, selection.project.id, task.id, {
                            fileName: attName,
                            url: attUrl,
                          });
                          setAttachments((prev) => [created, ...prev]);
                          setAttName("");
                          setAttUrl("");
                          toast.success("Attachment added");
                        } catch (e) {
                          toast.error(getApiErrorMessage(e));
                        }
                      }}
                    >
                      Add
                    </Button>
                  </div>
                </div>
              </div>

              <div className="rounded-2xl border border-white/10 bg-white/5 p-3">
                <div className="text-sm font-semibold text-white">Upload file</div>
                <div className="mt-2 flex flex-wrap items-center gap-2">
                  <input
                    type="file"
                    className="text-sm text-white/70"
                    onChange={async (e) => {
                      const file = e.target.files?.[0];
                      if (!file) return;
                      if (!selection.workspace || !selection.project) return;
                      try {
                        const created = await uploadAttachment(selection.workspace.id, selection.project.id, task.id, file);
                        setAttachments((prev) => [created, ...prev]);
                        toast.success("File uploaded");
                        e.currentTarget.value = "";
                      } catch (err) {
                        toast.error(getApiErrorMessage(err));
                      }
                    }}
                  />
                </div>
                <div className="mt-2 text-xs text-white/50">
                  Files are stored in backend `uploads/` and exposed at `/uploads/...`
                </div>
              </div>
            </div>
          ) : null}
        </div>
      )}
    </Modal>
  );
}

function TabButton({ active, children, onClick }: { active: boolean; children: React.ReactNode; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={[
        "rounded-xl border px-3 py-2 text-xs font-medium transition",
        active ? "border-violet-300/30 bg-violet-400/10 text-white" : "border-white/10 bg-white/5 text-white/70 hover:bg-white/10",
      ].join(" ")}
    >
      {children}
    </button>
  );
}

