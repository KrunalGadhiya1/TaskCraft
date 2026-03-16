import { Navigate, Route, Routes } from "react-router-dom";
import { Toaster } from "sonner";
import { AuthProvider, useAuth } from "./auth/AuthContext";
import { AppShell } from "./components/layout/AppShell";
import { LoginPage } from "./pages/auth/LoginPage";
import { RegisterPage } from "./pages/auth/RegisterPage";
import { KanbanPage } from "./pages/kanban/KanbanPage";
import { AppProvider } from "./app/AppContext";
import { DashboardPage } from "./pages/dashboard/DashboardPage";
import { TimelinePage } from "./pages/timeline/TimelinePage";
import { NotificationsPage } from "./pages/notifications/NotificationsPage";
import { SearchPage } from "./pages/search/SearchPage";
import { ReportsPage } from "./pages/reports/ReportsPage";
import { ManagePage } from "./pages/manage/ManagePage";
import { SprintsPage } from "./pages/sprints/SprintsPage";
import { ProfilePage } from "./pages/profile/ProfilePage";
import { AdminUsersPage } from "./pages/admin/AdminUsersPage";
import { ErrorBoundary } from "./components/app/ErrorBoundary";
import { BacklogPage } from "./pages/scrum/BacklogPage";
import { ActiveSprintPage } from "./pages/scrum/ActiveSprintPage";

function Protected({ children }: { children: React.ReactNode }) {
  const { token } = useAuth();
  if (!token) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/app/dashboard" replace />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route
        path="/app/*"
        element={
          <Protected>
            <AppShell />
          </Protected>
        }
      >
        <Route path="dashboard" element={<DashboardPage />} />
        <Route path="backlog" element={<BacklogPage />} />
        <Route path="active-sprint" element={<ActiveSprintPage />} />
        <Route path="kanban" element={<KanbanPage />} />
        <Route path="sprints" element={<SprintsPage />} />
        <Route path="manage/*" element={<ManagePage />} />
        <Route path="timeline" element={<TimelinePage />} />
        <Route path="notifications" element={<NotificationsPage />} />
        <Route path="search" element={<SearchPage />} />
        <Route path="reports" element={<ReportsPage />} />
        <Route path="profile" element={<ProfilePage />} />
        <Route path="admin/users" element={<AdminUsersPage />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppProvider>
        <div className="galaxy-noise" />
        <Toaster richColors position="top-right" />
        <ErrorBoundary>
          <AppRoutes />
        </ErrorBoundary>
      </AppProvider>
    </AuthProvider>
  );
}
