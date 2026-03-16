import { useEffect, useState } from "react";
import { toast } from "sonner";
import { useAppContext } from "../../app/AppContext";
import { addWorkspaceMembers, createWorkspace, getMyWorkspaces, getWorkspaceMembers, type WorkspaceMemberResponse } from "../../api/workspaces";
import { Button } from "../../components/ui/Button";
import { Input } from "../../components/ui/Input";
import { Modal } from "../../components/ui/Modal";
import { getApiErrorMessage } from "../../lib/api";
import type { Workspace } from "../../app/AppContext";

export function WorkspacesManagePage() {
  const { selection, setWorkspace, setProject } = useAppContext();
  const [items, setItems] = useState<Workspace[]>([]);
  const [loading, setLoading] = useState(false);
  const [createOpen, setCreateOpen] = useState(false);

  const [membersOpen, setMembersOpen] = useState(false);
  const [members, setMembers] = useState<WorkspaceMemberResponse[]>([]);

  async function load() {
    setLoading(true);
    try {
      const ws = await getMyWorkspaces();
      setItems(ws);
    } catch (e) {
      toast.error(getApiErrorMessage(e));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between gap-3">
        <div className="text-left">
          <div className="text-xl font-semibold text-white">Workspaces</div>
          <div className="text-sm text-white/60">{loading ? "Loading..." : "Your collaboration universes"}</div>
        </div>
        <Button variant="ghost" size="sm" onClick={() => setCreateOpen(true)}>
          New workspace
        </Button>
      </div>

      <div className="glass rounded-2xl p-4">
        {items.length === 0 ? (
          <div className="text-sm text-white/60">No workspaces yet.</div>
        ) : (
          <div className="space-y-2">
            {items.map((w) => (
              <div key={w.id} className="rounded-2xl border border-white/10 bg-white/5 p-3">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <button
                    className="text-left"
                    onClick={() => {
                      setWorkspace(w);
                      setProject(null);
                      toast.success(`Selected workspace ${w.key}`);
                    }}
                  >
                    <div className="text-sm font-semibold text-white">
                      {w.name} <span className="text-white/50">({w.key})</span>
                    </div>
                    {w.description ? <div className="mt-1 text-xs text-white/60">{w.description}</div> : null}
                  </button>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={async () => {
                        try {
                          const m = await getWorkspaceMembers(w.id);
                          setMembers(m);
                          setWorkspace(w);
                          setProject(null);
                          setMembersOpen(true);
                        } catch (e) {
                          toast.error(getApiErrorMessage(e));
                        }
                      }}
                    >
                      Members
                    </Button>
                    {selection.workspace?.id === w.id ? (
                      <div className="text-xs text-violet-200">Selected</div>
                    ) : null}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <CreateWorkspaceModal
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        onCreated={(w) => {
          setItems((prev) => [w, ...prev]);
          setWorkspace(w);
          setProject(null);
        }}
      />

      <WorkspaceMembersModal
        open={membersOpen}
        onClose={() => setMembersOpen(false)}
        workspace={selection.workspace}
        members={members}
        setMembers={setMembers}
      />
    </div>
  );
}

function CreateWorkspaceModal({
  open,
  onClose,
  onCreated,
}: {
  open: boolean;
  onClose: () => void;
  onCreated: (w: Workspace) => void;
}) {
  const [name, setName] = useState("");
  const [key, setKey] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);

  return (
    <Modal open={open} onClose={onClose} title="Create workspace">
      <div className="space-y-3">
        <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Workspace name" />
        <Input value={key} onChange={(e) => setKey(e.target.value)} placeholder="Key (2-20 chars)" />
        <Input value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Description (optional)" />
        <div className="flex justify-end gap-2">
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button
            disabled={loading}
            onClick={async () => {
              setLoading(true);
              try {
                const w = await createWorkspace({ name, key, description });
                toast.success("Workspace created");
                onClose();
                onCreated(w);
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

function WorkspaceMembersModal({
  open,
  onClose,
  workspace,
  members,
  setMembers,
}: {
  open: boolean;
  onClose: () => void;
  workspace: Workspace | null;
  members: WorkspaceMemberResponse[];
  setMembers: (m: WorkspaceMemberResponse[]) => void;
}) {
  const [identifier, setIdentifier] = useState("");
  const [role, setRole] = useState("WORKSPACE_MEMBER");
  const [loading, setLoading] = useState(false);

  return (
    <Modal open={open} onClose={onClose} title="Workspace members">
      {!workspace ? (
        <div className="text-sm text-white/60">Select a workspace.</div>
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
                <option value="WORKSPACE_MEMBER">WORKSPACE_MEMBER</option>
                <option value="WORKSPACE_OWNER">WORKSPACE_OWNER</option>
              </select>
              <Button
                disabled={loading || !identifier.trim()}
                onClick={async () => {
                  setLoading(true);
                  try {
                    const trimmed = identifier.trim();
                    // basic guard: avoid sending incomplete email
                    if (trimmed.includes("@") && !trimmed.includes(".")) {
                      toast.error("Please enter a valid email");
                      return;
                    }
                    const updated = await addWorkspaceMembers(workspace.id, [{ identifier: trimmed, role }]);
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

