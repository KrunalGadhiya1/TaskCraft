import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { Button } from "../../components/ui/Button";
import { getApiErrorMessage } from "../../lib/api";
import {
  adminDeleteUser,
  adminGetAllUsers,
  adminUpdateUserRole,
  adminUpdateUserStatus,
  type UserResponse,
} from "../../api/users";

export function AdminUsersPage() {
  const [users, setUsers] = useState<UserResponse[]>([]);
  const [loading, setLoading] = useState(false);

  async function load() {
    setLoading(true);
    try {
      const data = await adminGetAllUsers();
      setUsers(data);
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
          <div className="text-xl font-semibold text-white">Admin Users</div>
          <div className="text-sm text-white/60">Roles and access control</div>
        </div>
        <Button variant="ghost" size="sm" onClick={load} disabled={loading}>
          Refresh
        </Button>
      </div>

      <div className="glass rounded-2xl p-4">
        {users.length === 0 ? (
          <div className="text-sm text-white/60">
            {loading ? "Loading..." : "No users or you are not ADMIN (403)."}
          </div>
        ) : (
          <motion.div
            className="space-y-2"
            initial="hidden"
            animate="visible"
            variants={{
              hidden: { opacity: 0 },
              visible: { opacity: 1, transition: { staggerChildren: 0.05 } },
            }}
          >
            {users.map((u) => (
              <motion.div
                key={u.id}
                variants={{
                  hidden: { opacity: 0, scale: 0.95 },
                  visible: { opacity: 1, scale: 1 },
                }}
                transition={{ type: "spring", damping: 25, stiffness: 300 }}
                className="rounded-2xl border border-white/10 bg-white/5 p-3 hover:bg-white/10 transition-colors group"
              >
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="text-left">
                    <div className="text-sm font-semibold text-white group-hover:text-violet-200 transition-colors">{u.username}</div>
                    <div className="text-xs text-white/60">{u.email}</div>
                  </div>

                  <div className="flex items-center gap-2">
                    <select
                      className="h-10 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 transition-colors px-3 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/50"
                      value={u.role}
                      onChange={async (e) => {
                        try {
                          const updated = await adminUpdateUserRole(u.id, e.target.value);
                          setUsers((prev) => prev.map((x) => (x.id === u.id ? updated : x)));
                          toast.success("Role updated");
                        } catch (err) {
                          toast.error(getApiErrorMessage(err));
                        }
                      }}
                    >
                      <option value="ROLE_ADMIN" className="bg-black text-white">ROLE_ADMIN</option>
                      <option value="ROLE_MANAGER" className="bg-black text-white">ROLE_MANAGER</option>
                      <option value="ROLE_MEMBER" className="bg-black text-white">ROLE_MEMBER</option>
                      <option value="ROLE_VIEWER" className="bg-black text-white">ROLE_VIEWER</option>
                      <option value="ROLE_USER" className="bg-black text-white">ROLE_USER</option>
                    </select>

                    <select
                      className="h-10 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 transition-colors px-3 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/50"
                      value={u.enabled ? "ENABLED" : "DISABLED"}
                      onChange={async (e) => {
                        const enabled = e.target.value === "ENABLED";
                        try {
                          const updated = await adminUpdateUserStatus(u.id, enabled);
                          setUsers((prev) => prev.map((x) => (x.id === u.id ? updated : x)));
                          toast.success("Status updated");
                        } catch (err) {
                          toast.error(getApiErrorMessage(err));
                        }
                      }}
                    >
                      <option value="ENABLED" className="bg-black text-white">ENABLED</option>
                      <option value="DISABLED" className="bg-black text-white">DISABLED</option>
                    </select>

                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={async () => {
                        try {
                          await adminDeleteUser(u.id);
                          setUsers((prev) => prev.filter((x) => x.id !== u.id));
                          toast.success("User deleted");
                        } catch (err) {
                          toast.error(getApiErrorMessage(err));
                        }
                      }}
                      className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
                    >
                      Delete
                    </Button>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>
    </div>
  );
}

