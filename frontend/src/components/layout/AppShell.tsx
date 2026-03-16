import { Outlet, NavLink, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "../ui/Button";
import { useAuth } from "../../auth/AuthContext";
import {
  Bell,
  LayoutDashboard,
  ListTodo,
  Flag,
  LayoutGrid,
  LogOut,
  Search,
  Sparkles,
  Timer,
  FileDown,
  Users,
  FolderKanban,
  Rocket,
  Settings,
} from "lucide-react";
import { WorkspaceProjectPicker } from "../app/WorkspaceProjectPicker";

export function AppShell() {
  const { logout } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="min-h-full">
      <header className="sticky top-0 z-40 border-b border-white/10 bg-black/10 backdrop-blur-xl">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
          <div className="flex items-center gap-3">
            <div className="glass grid h-10 w-10 place-items-center rounded-2xl">
              <Sparkles className="h-5 w-5 text-violet-200" />
            </div>
            <div className="text-left">
              <div className="text-sm font-semibold text-white">TaskCraft</div>
              <div className="text-xs text-white/50">Galaxy Command Center</div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <WorkspaceProjectPicker />
            <Button
              variant="ghost"
              size="sm"
              onClick={async () => {
                await logout();
                navigate("/login");
              }}
            >
              <LogOut className="h-4 w-4" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      <div className="mx-auto grid max-w-6xl grid-cols-12 gap-4 px-4 py-6">
        <aside className="col-span-12 md:col-span-3">
          <nav className="glass rounded-2xl p-3">
            <NavItem to="/app/dashboard" icon={<LayoutDashboard className="h-4 w-4" />} label="Dashboard" />
            <NavItem to="/app/backlog" icon={<ListTodo className="h-4 w-4" />} label="Backlog" />
            <NavItem to="/app/active-sprint" icon={<Flag className="h-4 w-4" />} label="Active Sprint" />
            <NavLink
              to="/app/kanban"
              className={({ isActive }) =>
                [
                  "flex items-center gap-2 rounded-xl px-3 py-2 text-sm transition",
                  isActive ? "bg-white/10 text-white" : "text-white/70 hover:bg-white/5",
                ].join(" ")
              }
            >
              <LayoutGrid className="h-4 w-4" />
              Kanban
            </NavLink>
            <NavItem to="/app/sprints" icon={<Rocket className="h-4 w-4" />} label="Sprints" />
            <NavItem to="/app/manage" icon={<FolderKanban className="h-4 w-4" />} label="Manage" />
            <NavItem to="/app/timeline" icon={<Timer className="h-4 w-4" />} label="Timeline" />
            <NavItem to="/app/notifications" icon={<Bell className="h-4 w-4" />} label="Notifications" />
            <NavItem to="/app/search" icon={<Search className="h-4 w-4" />} label="Search" />
            <NavItem to="/app/reports" icon={<FileDown className="h-4 w-4" />} label="Reports" />
            <div className="my-2 h-px bg-white/10" />
            <NavItem to="/app/profile" icon={<Settings className="h-4 w-4" />} label="Profile" />
            <NavItem to="/app/admin/users" icon={<Users className="h-4 w-4" />} label="Admin Users" />
          </nav>
        </aside>

        <main className="col-span-12 md:col-span-9">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25 }}
          >
            <Outlet />
          </motion.div>
        </main>
      </div>
    </div>
  );
}

function NavItem({ to, icon, label }: { to: string; icon: React.ReactNode; label: string }) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        [
          "flex items-center gap-2 rounded-xl px-3 py-2 text-sm transition",
          isActive ? "bg-white/10 text-white" : "text-white/70 hover:bg-white/5",
        ].join(" ")
      }
    >
      {icon}
      {label}
    </NavLink>
  );
}

