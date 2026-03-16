import { NavLink, Route, Routes } from "react-router-dom";
import { WorkspacesManagePage } from "./WorkspacesManagePage";
import { ProjectsManagePage } from "./ProjectsManagePage";
import { TeamsManagePage } from "./TeamsManagePage";

export function ManagePage() {
  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between gap-3">
        <div className="text-left">
          <div className="text-xl font-semibold text-white">Manage</div>
          <div className="text-sm text-white/60">Workspaces, projects, teams</div>
        </div>
      </div>

      <div className="glass rounded-2xl p-2">
        <div className="flex flex-wrap gap-2">
          <Tab to="/app/manage/workspaces" label="Workspaces" />
          <Tab to="/app/manage/projects" label="Projects" />
          <Tab to="/app/manage/teams" label="Teams" />
        </div>
      </div>

      <Routes>
        <Route index element={<WorkspacesManagePage />} />
        <Route path="workspaces" element={<WorkspacesManagePage />} />
        <Route path="projects" element={<ProjectsManagePage />} />
        <Route path="teams" element={<TeamsManagePage />} />
      </Routes>
    </div>
  );
}

function Tab({ to, label }: { to: string; label: string }) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        [
          "rounded-xl border px-3 py-2 text-xs font-medium transition",
          isActive ? "border-violet-300/30 bg-violet-400/10 text-white" : "border-white/10 bg-white/5 text-white/70 hover:bg-white/10",
        ].join(" ")
      }
      end
    >
      {label}
    </NavLink>
  );
}

