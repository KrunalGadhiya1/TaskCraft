# TaskCraft – AI Powered Project Management System (Jira‑Inspired)  
Production-style Final Year Project Report (Backend + Frontend)

## 1) Project overview
**TaskCraft** is a Jira‑inspired project management platform built with a modern “Dark Galaxy” UI and a clean-architecture backend.  
It supports collaborative workspaces, projects, teams, Scrum workflow (Backlog + Sprints), Kanban task tracking, real-time notifications, activity timeline, analytics dashboard, search/filtering, reporting, and collaboration on tasks (comments + attachments).

## 2) Tech stack
### Backend
- **Java 17**, **Spring Boot 3.3.x**
- **Spring Security** + **JWT (HS256)** authentication
- **Spring Data JPA** + **MySQL**
- Validation: `jakarta.validation`
- Real-time notifications: **SSE** (`SseEmitter`)
- File storage: local disk `uploads/` exposed via `/uploads/**`

### Frontend
- **React (Vite + TypeScript)**
- **Tailwind CSS** + custom glassmorphism theme
- **ShadCN-style UI components** (custom components folder)
- Animations: **Framer Motion**
- API: **Axios**
- Drag & drop: **dnd-kit**
- Toasts: **Sonner**

## 3) Architecture (high-level)
### Backend clean architecture packages
- `controller`: REST endpoints
- `service`: business logic + authorization checks
- `repository`: database access (JPA repositories)
- `entity`: DB entities
- `dto`: request/response objects
- `security`: JWT + user details service
- `config`: security, static resources, scheduling
- `exception`: global error handling
- `utils`: helpers (token generator etc.)

### Frontend structure
- `src/api/*`: typed API clients
- `src/pages/*`: feature pages (Dashboard, Kanban, Backlog, Active Sprint, Manage, etc.)
- `src/components/*`: reusable UI and layout components
- `src/auth/*`: auth context + token storage
- `src/app/*`: app context (workspace/project selection)
- `src/realtime/*`: SSE stream client for notifications

## 4) Core domain model
- **User**: credentials, role, enabled/disabled, password reset token
- **Workspace**: top-level collaboration container, owned by a user
- **WorkspaceMember**: user membership + role (owner/member)
- **Project**: inside a workspace, has members (owner/member)
- **ProjectMember**
- **Team**: inside a workspace, has members (admin/member)
- **TeamMember**
- **Sprint**: Scrum iteration inside a project (PLANNED/ACTIVE/COMPLETED/CANCELLED)
- **Task**: Jira-like issue with type/status/priority/story points/due date, optional assignee, optional sprint
  - Statuses: `BACKLOG`, `TODO`, `IN_PROGRESS`, `IN_REVIEW`, `DONE`, `CANCELED`
  - Issue key: Jira-like **`PROJECTKEY-SEQ`** (e.g. `NOVA-12`) generated per project
- **TaskComment**: threaded discussion per task
- **TaskAttachment**: attachments metadata and uploaded files
- **Notification**: user alerts + SSE streaming
- **ActivityLog**: timeline/audit history

## 5) Authentication & authorization
### Authentication (JWT)
- Users login with **username or email** + password.
- Backend returns a JWT access token.
- Frontend stores token in `localStorage` and adds `Authorization: Bearer <token>` for API calls.

### Authorization (RBAC + membership)
- **Global role** (e.g. `ROLE_ADMIN`) used for admin-only endpoints (user administration).
- **Workspace/project membership** enforced in services:
  - Must be a workspace member to read workspace data.
  - Must be a project member to access project/task/sprint data.
  - Owner-only actions:
    - Workspace owner: add workspace members, update/delete workspace
    - Project owner: add project members, update/delete project
- Permission failures for membership/owner rules return **403 Forbidden**.

## 6) Real-time features
### 6.1 Notifications (SSE)
- Backend exposes SSE stream endpoint:
  - `GET /api/notifications/stream`
- Frontend subscribes via `EventSourcePolyfill` and displays incoming notifications immediately.

### 6.2 Due date reminders (scheduled + SSE)
Backend scheduler periodically scans tasks and creates notifications:
- **Due soon** (within next 24 hours) → `TASK_DUE_SOON`
- **Overdue** → `TASK_OVERDUE`
- Anti-spam rules:
  - due soon: at most once per ~6 hours per task
  - overdue: at most once per day per task
These notifications are also pushed instantly through SSE.

## 7) Feature list (what users can do)
### 7.1 Workspace & collaboration
- Create workspaces
- View “my workspaces”
- Add workspace members (owner-only)

### 7.2 Projects
- Create projects inside workspace
- Add project members (project owner-only)
- View project list within a workspace

### 7.3 Teams
- Create teams in workspace
- Add team members

### 7.4 Tasks (Jira-like issues)
- Create tasks with:
  - title, description, type, priority, story points, due date, assignee
- View tasks by project
- Update:
  - task details (title, description, type, priority, points, due date)
  - status (drag/drop Kanban + Active Sprint board)
  - assignee
- Delete tasks
- Task has an **Issue Key** shown in UI

### 7.5 Kanban board
- Drag & drop tasks across statuses:
  - `BACKLOG`, `TODO`, `IN_PROGRESS`, `IN_REVIEW`, `DONE`
- Task detail modal includes:
  - comments
  - attachments (metadata + file upload)

### 7.6 Scrum (Backlog + Sprints)
- **Backlog page**
  - shows all backlog tasks
  - “Start” moves backlog item to `TODO`
  - “Add to sprint” plans backlog items into sprints
- **Sprints**
  - create sprints
  - change sprint status
  - assign/remove tasks to/from sprint
- **Active Sprint page**
  - auto-detects current ACTIVE sprint
  - sprint board with drag/drop among `TODO/IN_PROGRESS/IN_REVIEW/DONE`
  - sprint health metrics: points done/total, remaining points, due-soon count, overdue count

### 7.7 Collaboration
- Add/read/update/delete task comments
- Add attachments:
  - metadata links (URL)
  - upload real file to backend (`uploads/` served via `/uploads/**`)

### 7.8 Notifications center
- View notifications (all/unread)
- Mark one as read / mark all as read
- Real-time updates via SSE

### 7.9 Activity timeline
- View activity logs for workspace/project/task (audit trail)

### 7.10 Dashboard analytics
- Summary stats per project:
  - total tasks
  - done tasks
  - completion %
  - counts by status and priority

### 7.11 Search & filtering
- Search tasks in a project by:
  - query text (title/description)
  - status
  - priority

### 7.12 Reporting
- Project report as JSON
- Project report as CSV

### 7.13 User profile & admin
- Profile:
  - view/update profile
  - change password
- Admin users (ADMIN only):
  - list users
  - update role
  - enable/disable user
  - delete user

## 8) Backend API overview (by module)
Base URL: `http://localhost:8080/api`

### Public
- `POST /auth/register`
- `POST /auth/login`
- `POST /auth/forgot-password`
- `POST /auth/reset-password`
- `GET /health`

### Authenticated
**Workspaces**
- `POST /workspaces`
- `GET /workspaces`
- `GET /workspaces/{id}`
- `PUT /workspaces/{id}`
- `DELETE /workspaces/{id}`
- `GET /workspaces/{id}/members`
- `POST /workspaces/{id}/members`

**Projects**
- `POST /workspaces/{workspaceId}/projects`
- `GET /workspaces/{workspaceId}/projects`
- `GET /workspaces/{workspaceId}/projects/{projectId}`
- `PUT /workspaces/{workspaceId}/projects/{projectId}`
- `DELETE /workspaces/{workspaceId}/projects/{projectId}`
- `GET /workspaces/{workspaceId}/projects/{projectId}/members`
- `POST /workspaces/{workspaceId}/projects/{projectId}/members`

**Teams**
- `POST /workspaces/{workspaceId}/teams`
- `GET /workspaces/{workspaceId}/teams`
- `GET /workspaces/{workspaceId}/teams/{teamId}/members`
- `POST /workspaces/{workspaceId}/teams/{teamId}/members`

**Tasks**
- `POST /workspaces/{workspaceId}/projects/{projectId}/tasks`
- `GET /workspaces/{workspaceId}/projects/{projectId}/tasks`
- `GET /workspaces/{workspaceId}/projects/{projectId}/tasks/{taskId}`
- `PUT /workspaces/{workspaceId}/projects/{projectId}/tasks/{taskId}`
- `PUT /workspaces/{workspaceId}/projects/{projectId}/tasks/{taskId}/status`
- `PUT /workspaces/{workspaceId}/projects/{projectId}/tasks/{taskId}/assignee`
- `DELETE /workspaces/{workspaceId}/projects/{projectId}/tasks/{taskId}`

**Task collaboration (comments/attachments)**
- `GET /workspaces/{workspaceId}/projects/{projectId}/tasks/{taskId}/comments`
- `POST /workspaces/{workspaceId}/projects/{projectId}/tasks/{taskId}/comments`
- `PUT /workspaces/{workspaceId}/projects/{projectId}/tasks/{taskId}/comments/{commentId}`
- `DELETE /workspaces/{workspaceId}/projects/{projectId}/tasks/{taskId}/comments/{commentId}`

- `GET /workspaces/{workspaceId}/projects/{projectId}/tasks/{taskId}/attachments`
- `POST /workspaces/{workspaceId}/projects/{projectId}/tasks/{taskId}/attachments`
- `POST /workspaces/{workspaceId}/projects/{projectId}/tasks/{taskId}/attachments/upload` (multipart)
- `DELETE /workspaces/{workspaceId}/projects/{projectId}/tasks/{taskId}/attachments/{attachmentId}`

**Sprints**
- `POST /workspaces/{workspaceId}/projects/{projectId}/sprints`
- `GET /workspaces/{workspaceId}/projects/{projectId}/sprints`
- `PUT /workspaces/{workspaceId}/projects/{projectId}/sprints/{sprintId}`
- `PUT /workspaces/{workspaceId}/projects/{projectId}/sprints/{sprintId}/status`
- `DELETE /workspaces/{workspaceId}/projects/{projectId}/sprints/{sprintId}`
- `POST /workspaces/{workspaceId}/projects/{projectId}/sprints/{sprintId}/tasks` (assign)
- `DELETE /workspaces/{workspaceId}/projects/{projectId}/sprints/{sprintId}/tasks` (remove)

**Notifications**
- `GET /notifications`
- `GET /notifications/unread`
- `POST /notifications/{id}/read`
- `POST /notifications/read-all`
- `GET /notifications/stream` (SSE)

**Activity**
- `GET /activity/workspaces/{workspaceId}`
- `GET /activity/projects/{projectId}`
- `GET /activity/tasks/{taskId}`

**Dashboard**
- `GET /workspaces/{workspaceId}/projects/{projectId}/dashboard/summary`

**Search**
- `GET /workspaces/{workspaceId}/projects/{projectId}/search/tasks?q=...&status=...&priority=...`

**Reports**
- `GET /workspaces/{workspaceId}/projects/{projectId}/reports/project`
- `GET /workspaces/{workspaceId}/projects/{projectId}/reports/project.csv`

**Users**
- `GET /users/me`
- `PUT /users/me`
- `PUT /users/me/password`
- `GET /users` (ADMIN)
- `PUT /users/{id}/role` (ADMIN)
- `PUT /users/{id}/status` (ADMIN)
- `DELETE /users/{id}` (ADMIN)

## 9) How to run the project (local)
### 9.1 Backend (MySQL profile)
1. Ensure MySQL is running and database access is correct in:
   - `backend/src/main/resources/application-mysql.properties`
2. Start backend with mysql profile (PowerShell):

```powershell
cd D:\TaskCraft\backend
$env:SPRING_PROFILES_ACTIVE='mysql'
mvn -q clean package -DskipTests
mvn -q spring-boot:run
```

Expected: app starts on `http://localhost:8080/api/health`

### 9.2 Frontend
```powershell
cd D:\TaskCraft\frontend
npm install
npm run dev
```
Open: `http://localhost:5173`

## 10) How to use the system (typical flows)
1. Register a user → Login
2. Create a **Workspace**
3. Create a **Project** inside the workspace
4. Create tasks (they start as **BACKLOG**)
5. Use **Backlog** to plan tasks into a Sprint
6. Activate the Sprint (Sprints page)
7. Use **Active Sprint** board to execute and move work to DONE
8. Use **Kanban** for continuous flow visualization
9. Collaborate via **Comments** and **Attachments**
10. Watch **Notifications** (real-time SSE), and review **Timeline** for audit history
11. Use **Dashboard/Search/Reports** for monitoring and output

## 11) Notes / Known gaps (future improvements)
- Multi-user live updates for Kanban/Timeline/Active Sprint (beyond notifications) can be added by streaming task/activity events.
- Permission scheme can be expanded to more Jira-like roles (viewer/member/manager) with a permission matrix.

