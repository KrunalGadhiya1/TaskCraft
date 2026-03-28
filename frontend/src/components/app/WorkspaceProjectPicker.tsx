import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { getApiErrorMessage } from "../../lib/api";
import { useAppContext, type Project, type Workspace } from "../../app/AppContext";
import { getMyWorkspaces, createWorkspace } from "../../api/workspaces";
import { createProject, getProjects } from "../../api/projects";
import { Button } from "../ui/Button";
import { Input } from "../ui/Input";
import { Modal } from "../ui/Modal";
import { ChevronsUpDown, Layers } from "lucide-react";

export function WorkspaceProjectPicker({ forceOpen }: { forceOpen?: boolean }) {
  const { selection, setWorkspace, setProject } = useAppContext();
  const [open, setOpen] = useState(false);
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);

  const canClose = Boolean(selection.workspace && selection.project);
  const forcedOpen = Boolean(forceOpen && !canClose);
  const effectiveOpen = forcedOpen || open;

  const triggerLabel = useMemo(() => {
    if (selection.workspace && selection.project) return `${selection.workspace.key} / ${selection.project.key}`;
    if (selection.workspace) return `${selection.workspace.key} / …`;
    return "Select";
  }, [selection.workspace, selection.project]);

  // Auto-close the modal once both are selected/created.
  useEffect(() => {
    if (canClose) setOpen(false);
  }, [canClose, forceOpen]);

  useEffect(() => {
    if (!effectiveOpen) return;
    setLoading(true);
    setLoadError(null);
    getMyWorkspaces()
      .then((ws) => {
        setWorkspaces(ws);
        if (selection.workspace && !ws.find((w) => w.id === selection.workspace?.id)) {
          setWorkspace(null);
          setProject(null);
        }
      })
      .catch((e) => setLoadError(getApiErrorMessage(e)))
      .finally(() => setLoading(false));
  }, [effectiveOpen]);

  useEffect(() => {
    if (!effectiveOpen) return;
    if (!selection.workspace) return;
    setLoading(true);
    setLoadError(null);
    getProjects(selection.workspace.id)
      .then((ps) => setProjects(ps))
      .catch((e) => setLoadError(getApiErrorMessage(e)))
      .finally(() => setLoading(false));
  }, [effectiveOpen, selection.workspace]);

  return (
    <>
      <Button variant="ghost" size="sm" onClick={() => setOpen(true)} className="h-9 px-3">
        <Layers className="h-4 w-4" />
        <span className="hidden sm:inline">{triggerLabel}</span>
        <ChevronsUpDown className="h-4 w-4 opacity-70" />
      </Button>

      <Modal
        open={effectiveOpen}
        onClose={() => {
          setOpen(false);
        }}
        title="Select your workspace & project"
      >
        {loadError ? (
          <div className="mb-3 rounded-2xl border border-rose-300/20 bg-rose-500/10 p-3 text-sm text-rose-100">
            {loadError}
          </div>
        ) : null}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <div className="text-xs font-medium text-white/70">Workspaces</div>
            <div className="space-y-2">
              {workspaces.map((w) => (
                <button
                  key={w.id}
                  onClick={() => {
                    setWorkspace(w);
                    setProject(null);
                  }}
                  className={[
                    "w-full rounded-2xl border p-3 text-left transition",
                    selection.workspace?.id === w.id
                      ? "border-violet-300/40 bg-violet-400/10"
                      : "border-white/10 bg-white/5 hover:bg-white/10",
                  ].join(" ")}
                >
                  <div className="text-sm font-semibold text-white">{w.name}</div>
                  <div className="text-xs text-white/60">{w.key}</div>
                </button>
              ))}
              {!loading && workspaces.length === 0 ? (
                <div className="rounded-2xl border border-white/10 bg-white/5 p-3 text-sm text-white/60">
                  No workspaces yet. Create one below.
                </div>
              ) : null}
            </div>
            <CreateWorkspaceInline
              onCreated={(w) => {
                setWorkspaces((prev) => [w, ...prev]);
                setWorkspace(w);
                setProject(null);
              }}
            />
          </div>

          <div className="space-y-2">
            <div className="text-xs font-medium text-white/70">Projects</div>
            <div className="space-y-2">
              {projects.map((p) => (
                <button
                  key={p.id}
                  onClick={() => {
                    setProject(p);
                    if (!forceOpen) setOpen(false);
                  }}
                  className={[
                    "w-full rounded-2xl border p-3 text-left transition",
                    selection.project?.id === p.id
                      ? "border-sky-300/40 bg-sky-400/10"
                      : "border-white/10 bg-white/5 hover:bg-white/10",
                  ].join(" ")}
                  disabled={!selection.workspace}
                >
                  <div className="text-sm font-semibold text-white">{p.name}</div>
                  <div className="text-xs text-white/60">{p.key}</div>
                </button>
              ))}
              {!selection.workspace ? (
                <div className="rounded-2xl border border-white/10 bg-white/5 p-3 text-sm text-white/60">
                  Select a workspace first.
                </div>
              ) : null}
              {selection.workspace && !loading && projects.length === 0 ? (
                <div className="rounded-2xl border border-white/10 bg-white/5 p-3 text-sm text-white/60">
                  No projects in this workspace yet. Create one below.
                </div>
              ) : null}
            </div>
            <CreateProjectInline
              workspace={selection.workspace}
              onCreated={(p) => {
                setProjects((prev) => [p, ...prev]);
                setProject(p);
                if (!forceOpen) setOpen(false);
              }}
            />
          </div>
        </div>

        <div className="mt-5 flex items-center justify-end gap-2">
          <Button
            variant="ghost"
            onClick={() => {
              if (!canClose) {
                toast.error("Please select workspace + project");
                return;
              }
              setOpen(false);
            }}
          >
            Done
          </Button>
        </div>
      </Modal>
    </>
  );
}

function CreateWorkspaceInline({ onCreated }: { onCreated: (w: Workspace) => void }) {
  const [name, setName] = useState("");
  const [key, setKey] = useState("");
  const [loading, setLoading] = useState(false);

  return (
    <div className="mt-3 rounded-2xl border border-white/10 bg-white/5 p-3">
      <div className="mb-2 text-xs font-medium text-white/70">Create workspace</div>
      <div className="space-y-2">
        <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Workspace name" />
        <Input value={key} onChange={(e) => setKey(e.target.value)} placeholder="Key (e.g. TC)" />
        <Button
          className="w-full"
          disabled={loading}
          onClick={async () => {
            setLoading(true);
            try {
              const w = await createWorkspace({ name, key, description: "" });
              toast.success("Workspace created");
              setName("");
              setKey("");
              onCreated(w);
            } catch (e) {
              toast.error(getApiErrorMessage(e));
            } finally {
              setLoading(false);
            }
          }}
        >
          {loading ? "Creating..." : "Create workspace"}
        </Button>
      </div>
    </div>
  );
}

function CreateProjectInline({ workspace, onCreated }: { workspace: Workspace | null; onCreated: (p: Project) => void }) {
  const [name, setName] = useState("");
  const [key, setKey] = useState("");
  const [loading, setLoading] = useState(false);

  return (
    <div className="mt-3 rounded-2xl border border-white/10 bg-white/5 p-3">
      <div className="mb-2 text-xs font-medium text-white/70">Create project</div>
      <div className="space-y-2">
        <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Project name" disabled={!workspace} />
        <Input value={key} onChange={(e) => setKey(e.target.value)} placeholder="Key (e.g. APP)" disabled={!workspace} />
        <Button
          className="w-full"
          disabled={loading || !workspace}
          onClick={async () => {
            if (!workspace) return;
            setLoading(true);
            try {
              const p = await createProject(workspace.id, { name, key, description: "" });
              toast.success("Project created");
              setName("");
              setKey("");
              onCreated(p);
            } catch (e) {
              toast.error(getApiErrorMessage(e));
            } finally {
              setLoading(false);
            }
          }}
        >
          {loading ? "Creating..." : "Create project"}
        </Button>
      </div>
    </div>
  );
}

