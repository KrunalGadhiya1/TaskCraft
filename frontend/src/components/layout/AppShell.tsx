import { useState, useEffect } from "react";
import { Outlet, NavLink, useLocation, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "../../auth/AuthContext";
import {
  Bell,
  LayoutDashboard,
  ListTodo,
  Flag,
  LayoutGrid,
  LogOut,
  Search,
  Timer,
  FileDown,
  Users,
  FolderKanban,
  Rocket,
  Settings,
  ChevronLeft,
  ChevronRight,
  Command,
  CircleUserRound,
  Menu,
  X,
} from "lucide-react";
import { WorkspaceProjectPicker } from "../app/WorkspaceProjectPicker";

export function AppShell() {
  const { logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [cmdOpen, setCmdOpen] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setCmdOpen((o) => !o);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <div className="flex h-screen w-full overflow-hidden bg-[#0A0A0C] text-[#EDEDED] antialiased selection:bg-indigo-500/30">
      {/* Desktop Sidebar */}
      <motion.aside
        initial={false}
        animate={{ width: isSidebarCollapsed ? 80 : 260 }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        className="relative z-20 hidden h-full flex-col border-r border-white/5 bg-[#101114] md:flex"
      >
        <div className="flex h-14 items-center justify-between px-4">
          <AnimatePresence mode="popLayout">
            {!isSidebarCollapsed && (
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                className="flex items-center gap-3 font-semibold text-white/90"
              >
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-500 text-white shadow-inner">
                  <Command className="h-4 w-4" />
                </div>
                TaskCraft
              </motion.div>
            )}
          </AnimatePresence>
          {isSidebarCollapsed && (
            <div className="mx-auto flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-500 text-white">
              <Command className="h-4 w-4" />
            </div>
          )}
        </div>

        <button
          onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
          className="absolute -right-3 top-16 z-30 flex h-6 w-6 items-center justify-center rounded-full border border-white/10 bg-[#1A1C20] text-white/50 shadow-sm hover:text-white"
        >
          {isSidebarCollapsed ? <ChevronRight className="h-3 w-3" /> : <ChevronLeft className="h-3 w-3" />}
        </button>

        <SidebarContent collapsed={isSidebarCollapsed} onNavItemClick={() => {}} />
      </motion.aside>

      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileMenuOpen(false)}
              className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm md:hidden"
            />
            <motion.aside
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r border-white/5 bg-[#101114] md:hidden"
            >
              <div className="flex h-14 items-center justify-between px-4 border-b border-white/5">
                <div className="flex items-center gap-3 font-semibold text-white/90">
                  <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-500 text-white shadow-inner">
                    <Command className="h-4 w-4" />
                  </div>
                  TaskCraft
                </div>
                <button onClick={() => setIsMobileMenuOpen(false)} className="rounded-lg p-1 text-white/50 hover:bg-white/5 hover:text-white">
                  <X className="h-5 w-5" />
                </button>
              </div>
              <SidebarContent collapsed={false} onNavItemClick={() => setIsMobileMenuOpen(false)} />
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Main App Area */}
      <div className="flex flex-1 flex-col overflow-hidden relative">
        {/* Top Navbar */}
        <header className="z-10 flex h-14 shrink-0 items-center justify-between border-b border-white/5 bg-[#0A0A0C]/80 px-4 md:px-6 backdrop-blur-md">
          <div className="flex items-center gap-3 md:gap-4">
            <button 
              onClick={() => setIsMobileMenuOpen(true)}
              className="flex items-center justify-center rounded-lg p-2 text-white/60 hover:bg-white/5 hover:text-white md:hidden"
            >
              <Menu className="h-5 w-5" />
            </button>
            <WorkspaceProjectPicker />
          </div>
          
          <div className="flex items-center gap-4">
            <button
              onClick={() => setCmdOpen(true)}
              className="flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-sm text-white/50 transition-colors hover:bg-white/10 hover:text-white/80"
            >
              <Search className="h-4 w-4" />
              <span className="hidden sm:inline">Search...</span>
              <span className="hidden rounded bg-white/10 px-1.5 py-0.5 text-[10px] font-mono sm:inline">⌘K</span>
            </button>
            <div className="h-4 w-px bg-white/10" />
            <button 
              onClick={() => navigate("/app/notifications")}
              className="relative flex h-8 w-8 items-center justify-center rounded-lg text-white/50 hover:bg-white/5 hover:text-white transition-colors"
            >
              <Bell className="h-4 w-4" />
              <div className="absolute right-2 top-2 h-1.5 w-1.5 rounded-full bg-indigo-500 ring-2 ring-[#0A0A0C]" />
            </button>
            <div className="group relative">
              <button className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-500/20 text-indigo-300 hover:bg-indigo-500/30 transition-colors">
                <CircleUserRound className="h-5 w-5" />
              </button>
              {/* Invisible bridge to maintain hover state */}
              <div className="absolute right-0 top-full pt-2 w-48 hidden group-hover:block">
                <div className="rounded-xl border border-white/10 bg-[#16181D] p-1 shadow-2xl">
                  <button
                    onClick={() => navigate("/app/profile")}
                    className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-white/70 hover:bg-white/5 hover:text-white transition-colors"
                  >
                    <Settings className="h-4 w-4" />
                    Profile Settings
                  </button>
                  <div className="my-1 h-px bg-white/5" />
                  <button
                    onClick={async () => {
                      await logout();
                      window.location.href = "/login";
                    }}
                    className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-red-400/80 hover:bg-red-500/10 hover:text-red-400 transition-colors"
                  >
                    <LogOut className="h-4 w-4" />
                    Sign out
                  </button>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Content Area */}
        <main className="flex-1 overflow-y-auto overflow-x-hidden p-6">
          <div className="mx-auto max-w-7xl">
            <AnimatePresence mode="wait">
              <motion.div
                key={location.pathname}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2, ease: "easeInOut" }}
                className="h-full"
              >
                <Outlet />
              </motion.div>
            </AnimatePresence>
          </div>
        </main>
      </div>

      {/* Command Palette Mockup */}
      <AnimatePresence>
        {cmdOpen && (
          <div className="fixed inset-0 z-50 flex items-start justify-center pt-32">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm"
              onClick={() => setCmdOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: -20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -20 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="relative w-full max-w-lg overflow-hidden rounded-2xl border border-white/10 bg-[#16181D] shadow-2xl"
            >
              <div className="flex items-center border-b border-white/10 px-4">
                <Search className="h-5 w-5 text-white/40" />
                <input 
                  autoFocus 
                  placeholder="Type a command or search..." 
                  className="w-full bg-transparent px-4 py-4 text-sm text-white outline-none placeholder:text-white/40"
                />
                <button onClick={() => setCmdOpen(false)} className="rounded bg-white/5 px-2 py-1 text-[10px] text-white/50 hover:bg-white/10 hover:text-white">ESC</button>
              </div>
              <div className="max-h-[300px] overflow-y-auto p-2">
                <div className="px-2 pb-2 pt-1 text-[10px] font-semibold uppercase tracking-widest text-white/40">Suggestions</div>
                <CmdItem icon={<LayoutGrid />} label="Go to Kanban Board" onAction={() => { setCmdOpen(false); navigate("/app/kanban"); }} />
                <CmdItem icon={<Flag />} label="View Active Sprint" onAction={() => { setCmdOpen(false); navigate("/app/active-sprint"); }} />
                <CmdItem icon={<Rocket />} label="Plan new sprint" onAction={() => { setCmdOpen(false); navigate("/app/sprints"); }} />
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

function SidebarContent({ collapsed, onNavItemClick }: { collapsed: boolean; onNavItemClick: () => void }) {
  return (
    <>
      <div className="flex-1 overflow-y-auto px-3 py-4 scrollbar-thin scrollbar-track-transparent scrollbar-thumb-white/10">
        <div className="space-y-1">
          <NavItem collapsed={collapsed} to="/app/dashboard" icon={<LayoutDashboard />} label="Dashboard" onClick={onNavItemClick} />
          <NavItem collapsed={collapsed} to="/app/active-sprint" icon={<Flag />} label="Active Sprint" onClick={onNavItemClick} />
          <NavItem collapsed={collapsed} to="/app/kanban" icon={<LayoutGrid />} label="Kanban" onClick={onNavItemClick} />
          <NavItem collapsed={collapsed} to="/app/sprints" icon={<Rocket />} label="Sprints" onClick={onNavItemClick} />
          <NavItem collapsed={collapsed} to="/app/backlog" icon={<ListTodo />} label="Backlog" onClick={onNavItemClick} />
        </div>
        
        <div className="mt-6 mb-2 px-3 text-[10px] font-semibold uppercase tracking-wider text-white/40">
          {!collapsed && "Planning"}
        </div>
        <div className="space-y-1">
          <NavItem collapsed={collapsed} to="/app/manage" icon={<FolderKanban />} label="Manage" onClick={onNavItemClick} />
          <NavItem collapsed={collapsed} to="/app/timeline" icon={<Timer />} label="Timeline" onClick={onNavItemClick} />
          <NavItem collapsed={collapsed} to="/app/reports" icon={<FileDown />} label="Reports" onClick={onNavItemClick} />
        </div>
      </div>

      <div className="border-t border-white/5 p-3">
        <NavItem collapsed={collapsed} to="/app/admin/users" icon={<Users />} label="Team Directory" onClick={onNavItemClick} />
        <NavItem collapsed={collapsed} to="/app/profile" icon={<Settings />} label="Settings" onClick={onNavItemClick} />
      </div>
    </>
  );
}

function CmdItem({ icon, label, onAction }: { icon: React.ReactNode; label: string; onAction: () => void }) {
  return (
    <button 
      onClick={onAction}
      className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm text-white/70 transition-colors hover:bg-white/5 hover:text-white"
    >
      <div className="[&>svg]:h-4 [&>svg]:w-4 [&>svg]:text-white/40">{icon}</div>
      {label}
    </button>
  );
}

function NavItem({ to, icon, label, collapsed, onClick }: { to: string; icon: React.ReactNode; label: string; collapsed: boolean; onClick?: () => void }) {
  return (
    <NavLink
      to={to}
      title={collapsed ? label : undefined}
      onClick={onClick}
      className={({ isActive }) =>
        [
          "group relative flex items-center rounded-xl transition-all duration-200",
          collapsed ? "h-10 w-10 justify-center mx-auto" : "px-3 py-2 w-full gap-3",
          isActive ? "text-white font-medium" : "text-white/60 hover:text-white",
        ].join(" ")
      }
    >
      {({ isActive }) => (
        <>
          {isActive && (
            <motion.div
              layoutId="sidebar-active-pill"
              className="absolute inset-0 z-0 rounded-xl bg-white/10"
              transition={{ type: "spring", stiffness: 400, damping: 30 }}
            />
          )}
          <div className="relative z-10 flex items-center justify-center [&>svg]:h-4 [&>svg]:w-4">
            {icon}
          </div>
          <AnimatePresence>
            {!collapsed && (
              <motion.span 
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: 1, width: "auto" }}
                exit={{ opacity: 0, width: 0 }}
                className="relative z-10 whitespace-nowrap text-sm overflow-hidden"
              >
                {label}
              </motion.span>
            )}
          </AnimatePresence>
          <div className="absolute inset-0 z-0 rounded-xl bg-white/0 transition-colors duration-200 group-hover:bg-white/5" />
        </>
      )}
    </NavLink>
  );
}
