import { useEffect, useState } from "react";
import { toast } from "sonner";
import { useAppContext } from "../../app/AppContext";
import {
  addProjectMembers,
  createProject,
  getProjectMembers,
  getProjects,
  type ProjectMemberResponse,
} from "../../api/projects";
import { Button } from "../../components/ui/Button";
import { Input } from "../../components/ui/Input";
import { Modal } from "../../components/ui/Modal";
import { getApiErrorMessage } from "../../lib/api";
import type { Project } from "../../app/AppContext";

export function ProjectsManagePage() {
  const { selection, setProject } = useAppContext();
  const [items, setItems] = useState<Project[]>([]);
  const [loading, setLoading] = useState(false);
  const [createOpen, setCreateOpen] = useState(false);

  const [membersOpen, setMembersOpen] = useState(false);
  const [members, setMembers] = useState<ProjectMemberResponse[]>([]);

  useEffect(() => {
    if (!selection.workspace) return;
    setLoading(true);
    getProjects(selection.workspace.id)
      .then(setItems)
      .catch((e) => toast.error(getApiErrorMessage(e)))
      .finally(() => setLoading(false));
  }, [selection.workspace]);

  if (!selection.workspace) {
    return <div className="glass rounded-2xl p-4 text-sm text-white/60">Select a workspace first.</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between gap-3">
        <div className="text-left">
          <div className="text-lg font-semibold text-white">Projects</div>
          <div className="text-sm text-white/60">{loading ? "Loading..." : `Workspace: ${selection.workspace.key}`}</div>
        </div>
        <Button variant="ghost" size="sm" onClick={() => setCreateOpen(true)}>
          New project
        </Button>
      </div>

      <div className="glass rounded-2xl p-4">
        {items.length === 0 ? (
          <div className="text-sm text-white/60">No projects yet.</div>
        ) : (
          <div className="space-y-2">
            {items.map((p) => (
              <div key={p.id} className="rounded-2xl border border-white/10 bg-white/5 p-3">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <button
                    className="text-left"
                    onClick={() => {
                      setProject(p);
                      toast.success(`Selected project ${p.key}`);
                    }}
                  >
                    <div className="text-sm font-semibold text-white">
                      {p.name} <span className="text-white/50">({p.key})</span>
                    </div>
                    <div className="mt-1 text-xs text-white/60">{p.status}</div>
                  </button>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={async () => {
                        try {
                          const m = await getProjectMembers(selection.workspace!.id, p.id);
                          setMembers(m);
                          setProject(p);
                          setMembersOpen(true);
                        } catch (e) {
                          toast.error(getApiErrorMessage(e));
                        }
                      }}
                    >
                      Members
                    </Button>
                    {selection.project?.id === p.id ? <div className="text-xs text-sky-200">Selected</div> : null}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <CreateProjectModal
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        onCreated={(p) => {
          setItems((prev) => [p, ...prev]);
          setProject(p);
        }}
      />

      <ProjectMembersModal
        open={membersOpen}
        onClose={() => setMembersOpen(false)}
        workspaceId={selection.workspace.id}
        project={selection.project}
        members={members}
        setMembers={setMembers}
      />
    </div>
  );
}

function CreateProjectModal({
  open,
  onClose,
  onCreated,
}: {
  open: boolean;
  onClose: () => void;
  onCreated: (p: Project) => void;
}) {
  const { selection } = useAppContext();
  const [name, setName] = useState("");
  const [key, setKey] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);

  return (
    <Modal open={open} onClose={onClose} title="Create project">
      <div className="space-y-3">
        <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Project name" />
        <Input value={key} onChange={(e) => setKey(e.target.value)} placeholder="Key (2-20 chars)" />
        <Input value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Description (optional)" />
        <div className="flex justify-end gap-2">
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button
            disabled={loading}
            onClick={async () => {
              if (!selection.workspace) return;
              setLoading(true);
              try {
                const p = await createProject(selection.workspace.id, { name, key, description });
                toast.success("Project created");
                onClose();
                onCreated(p);
                setName("");
                setKey("");
                setDescription("");
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

function ProjectMembersModal({
  open,
  onClose,
  workspaceId,
  project,
  members,
  setMembers,
}: {
  open: boolean;
  onClose: () => void;
  workspaceId: number;
  project: Project | null;
  members: ProjectMemberResponse[];
  setMembers: (m: ProjectMemberResponse[]) => void;
}) {
  const [identifier, setIdentifier] = useState("");
  const [role, setRole] = useState("PROJECT_MEMBER");
  const [loading, setLoading] = useState(false);

  return (
    <Modal open={open} onClose={onClose} title="Project members">
      {!project ? (
        <div className="text-sm text-white/60">Select a project.</div>
      ) : (
        <div className="space-y-3">
          <div className="space-y-2">
            {members.length === 0 ? (
              <div className="text-sm text-white/60">No members.</div>
            ) : (
              members.map((m) => (
                <div key={m.id} className="rounded-2xl border border-white/10 bg-white/5 p-3">
                  <div className="text-sm font-semibold text-white">{m.username}</div>
                  <div className="text-xs text-white/60">{m.email}</div>
                  <div className="mt-1 text-xs text-white/50">{m.role}</div>
                </div>
              ))
            )}
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/5 p-3">
            <div className="text-sm font-semibold text-white">Add member</div>
            <div className="mt-2 grid grid-cols-1 gap-2 md:grid-cols-3">
              <Input value={identifier} onChange={(e) => setIdentifier(e.target.value)} placeholder="username or email" />
              <select
                className="h-10 rounded-xl border border-white/10 bg-white/5 px-3 text-sm"
                value={role}
                onChange={(e) => setRole(e.target.value)}
              >
                <option value="PROJECT_MEMBER">PROJECT_MEMBER</option>
                <option value="PROJECT_OWNER">PROJECT_OWNER</option>
              </select>
              <Button
                disabled={loading}
                onClick={async () => {
                  setLoading(true);
                  try {
                    const updated = await addProjectMembers(workspaceId, project.id, [{ identifier, role }]);
                    setMembers(updated);
                    setIdentifier("");
                    toast.success("Member added/updated");
                  } catch (e) {
                    toast.error(getApiErrorMessage(e));
                  } finally {
                    setLoading(false);
                  }
                }}
              >
                Add
              </Button>
            </div>
          </div>
        </div>
      )}
    </Modal>
  );
}

