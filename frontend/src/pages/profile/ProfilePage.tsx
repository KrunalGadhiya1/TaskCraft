import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Button } from "../../components/ui/Button";
import { Input } from "../../components/ui/Input";
import { getApiErrorMessage } from "../../lib/api";
import { changeMyPassword, getMe, updateMe, type UserResponse } from "../../api/users";

export function ProfilePage() {
  const [me, setMe] = useState<UserResponse | null>(null);
  const [loading, setLoading] = useState(false);

  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");

  useEffect(() => {
    setLoading(true);
    getMe()
      .then((u) => {
        setMe(u);
        setUsername(u.username);
        setEmail(u.email);
      })
      .catch((e) => toast.error(getApiErrorMessage(e)))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-4">
      <div className="text-left">
        <div className="text-xl font-semibold text-white">Profile</div>
        <div className="text-sm text-white/60">Account settings</div>
      </div>

      <div className="glass rounded-2xl p-4">
        {loading ? <div className="text-sm text-white/60">Loading...</div> : null}
        {me ? (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="rounded-2xl border border-white/10 bg-white/5 p-3">
              <div className="text-sm font-semibold text-white">Details</div>
              <div className="mt-3 space-y-2">
                <Input value={username} onChange={(e) => setUsername(e.target.value)} />
                <Input value={email} onChange={(e) => setEmail(e.target.value)} />
                <Button
                  onClick={async () => {
                    try {
                      const updated = await updateMe({ username, email });
                      setMe(updated);
                      toast.success("Profile updated");
                    } catch (e) {
                      toast.error(getApiErrorMessage(e));
                    }
                  }}
                >
                  Save
                </Button>
              </div>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/5 p-3">
              <div className="text-sm font-semibold text-white">Change password</div>
              <div className="mt-3 space-y-2">
                <Input
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  type="password"
                  placeholder="Current password"
                />
                <Input
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  type="password"
                  placeholder="New password"
                />
                <Button
                  variant="ghost"
                  onClick={async () => {
                    try {
                      await changeMyPassword({ currentPassword, newPassword });
                      toast.success("Password changed");
                      setCurrentPassword("");
                      setNewPassword("");
                    } catch (e) {
                      toast.error(getApiErrorMessage(e));
                    }
                  }}
                >
                  Update password
                </Button>
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}

