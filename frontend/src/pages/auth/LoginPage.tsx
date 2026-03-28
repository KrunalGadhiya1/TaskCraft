import { useState } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import { Button } from "../../components/ui/Button";
import { Input } from "../../components/ui/Input";
import { useAuth } from "../../auth/AuthContext";
import { getApiErrorMessage } from "../../lib/api";

export function LoginPage() {
  const { login } = useAuth();
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  return (
    <div className="min-h-full px-4 py-10">
      <div className="mx-auto max-w-md">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
          className="glass rounded-3xl p-6"
        >
          <div className="mb-6 text-left">
            <div className="text-2xl font-semibold text-white">Welcome back</div>
            <div className="text-sm text-white/60">Login to your galaxy workspace</div>
          </div>

          <form
            className="space-y-3"
            onSubmit={async (e) => {
              e.preventDefault();
              setLoading(true);
              try {
                await login(identifier, password);
                localStorage.removeItem("taskcraft_selection_v1");
                toast.success("Logged in");
                window.location.href = "/app/dashboard";
              } catch (err) {
                toast.error(getApiErrorMessage(err));
              } finally {
                setLoading(false);
              }
            }}
          >
            <div className="space-y-1 text-left">
              <div className="text-xs font-medium text-white/70">Username or Email</div>
              <Input value={identifier} onChange={(e) => setIdentifier(e.target.value)} placeholder="e.g. krunal or krunal@gmail.com" />
            </div>

            <div className="space-y-1 text-left">
              <div className="text-xs font-medium text-white/70">Password</div>
              <Input value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" type="password" />
            </div>

            <Button className="w-full" disabled={loading}>
              {loading ? "Signing in..." : "Sign in"}
            </Button>
          </form>

          <div className="mt-5 text-sm text-white/60">
            Don&apos;t have an account?{" "}
            <Link className="text-violet-200 hover:text-violet-100" to="/register">
              Create one
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

