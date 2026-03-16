import { useEffect, useState } from "react";
import { toast } from "sonner";
import { useAppContext } from "../../app/AppContext";
import { addTeamMembers, createTeam, getTeamMembers, getTeams, type TeamMemberResponse, type TeamResponse } from "../../api/teams";
import { Button } from "../../components/ui/Button";
import { Input } from "../../components/ui/Input";
import { Modal } from "../../components/ui/Modal";
import { getApiErrorMessage } from "../../lib/api";

export function TeamsManagePage() {
  const { selection } = useAppContext();
  const [items, setItems] = useState<TeamResponse[]>([]);
  const [loading, setLoading] = useState(false);
  const [createOpen, setCreateOpen] = useState(false);

  const [membersOpen, setMembersOpen] = useState(false);
  const [members, setMembers] = useState<TeamMemberResponse[]>([]);
  const [activeTeam, setActiveTeam] = useState<TeamResponse | null>(null);

  useEffect(() => {
    if (!selection.workspace) return;
    setLoading(true);
    getTeams(selection.workspace.id)
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
          <div className="text-lg font-semibold text-white">Teams</div>
          <div className="text-sm text-white/60">{loading ? "Loading..." : `Workspace: ${selection.workspace.key}`}</div>
        </div>
        <Button variant="ghost" size="sm" onClick={() => setCreateOpen(true)}>
          New team
        </Button>
      </div>

      <div className="glass rounded-2xl p-4">
        {items.length === 0 ? (
          <div className="text-sm text-white/60">No teams yet.</div>
        ) : (
          <div className="space-y-2">
            {items.map((t) => (
              <div key={t.id} className="rounded-2xl border border-white/10 bg-white/5 p-3">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="text-left">
                    <div className="text-sm font-semibold text-white">{t.name}</div>
                    {t.description ? <div className="mt-1 text-xs text-white/60">{t.description}</div> : null}
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={async () => {
                      try {
                        const m = await getTeamMembers(selection.workspace!.id, t.id);
                        setMembers(m);
                        setActiveTeam(t);
                        setMembersOpen(true);
                      } catch (e) {
                        toast.error(getApiErrorMessage(e));
                      }
                    }}
                  >
                    Members
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <CreateTeamModal
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        onCreated={(t) => setItems((prev) => [t, ...prev])}
      />

      <TeamMembersModal
        open={membersOpen}
        onClose={() => setMembersOpen(false)}
        workspaceId={selection.workspace.id}
        team={activeTeam}
        members={members}
        setMembers={setMembers}
      />
    </div>
  );
}

function CreateTeamModal({
  open,
  onClose,
  onCreated,
}: {
  open: boolean;
  onClose: () => void;
  onCreated: (t: TeamResponse) => void;
}) {
  const { selection } = useAppContext();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);

  return (
    <Modal open={open} onClose={onClose} title="Create team">
      <div className="space-y-3">
        <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Team name" />
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
                const t = await createTeam(selection.workspace.id, { name, description });
                toast.success("Team created");
                onClose();
                onCreated(t);
                setName("");
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

function TeamMembersModal({
  open,
  onClose,
  workspaceId,
  team,
  members,
  setMembers,
}: {
  open: boolean;
  onClose: () => void;
  workspaceId: number;
  team: TeamResponse | null;
  members: TeamMemberResponse[];
  setMembers: (m: TeamMemberResponse[]) => void;
}) {
  const [identifier, setIdentifier] = useState("");
  const [role, setRole] = useState("TEAM_MEMBER");
  const [loading, setLoading] = useState(false);

  return (
    <Modal open={open} onClose={onClose} title="Team members">
      {!team ? (
        <div className="text-sm text-white/60">Select a team.</div>
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
                <option value="TEAM_MEMBER">TEAM_MEMBER</option>
                <option value="TEAM_ADMIN">TEAM_ADMIN</option>
              </select>
              <Button
                disabled={loading}
                onClick={async () => {
                  setLoading(true);
                  try {
                    const updated = await addTeamMembers(workspaceId, team.id, [{ identifier, role }]);
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

