import { useState } from "react";
import { motion } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Button } from "../../components/ui/Button";
import { Input } from "../../components/ui/Input";
import { useAuth } from "../../auth/AuthContext";
import { getApiErrorMessage } from "../../lib/api";

export function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
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
            <div className="text-2xl font-semibold text-white">Create account</div>
            <div className="text-sm text-white/60">Enter the galaxy with your crew</div>
          </div>

          <form
            className="space-y-3"
            onSubmit={async (e) => {
              e.preventDefault();
              setLoading(true);
              try {
                await register(username, email, password);
                toast.success("Account created. Please login.");
                navigate("/login");
              } catch (err) {
                toast.error(getApiErrorMessage(err));
              } finally {
                setLoading(false);
              }
            }}
          >
            <div className="space-y-1 text-left">
              <div className="text-xs font-medium text-white/70">Username</div>
              <Input value={username} onChange={(e) => setUsername(e.target.value)} placeholder="e.g. krunal" />
            </div>
            <div className="space-y-1 text-left">
              <div className="text-xs font-medium text-white/70">Email</div>
              <Input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="e.g. krunal@gmail.com" />
            </div>
            <div className="space-y-1 text-left">
              <div className="text-xs font-medium text-white/70">Password</div>
              <Input value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" type="password" />
            </div>
            <Button className="w-full" disabled={loading}>
              {loading ? "Creating..." : "Create account"}
            </Button>
          </form>

          <div className="mt-5 text-sm text-white/60">
            Already have an account?{" "}
            <Link className="text-violet-200 hover:text-violet-100" to="/login">
              Login
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

