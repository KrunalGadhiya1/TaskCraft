# 🚀 TaskCraft: The Ultimate AI-Powered Project Management System

TaskCraft is a premium, Jira-inspired project management platform designed for modern teams. It combines a sophisticated **"Dark Galaxy"** aesthetic with a robust **Spring Boot** backend and a dynamic **React** frontend to deliver a seamless SaaS experience.

---

## 🏗️ Technical Architecture

| Layer | Technology |
| :--- | :--- |
| **Frontend** | React (Vite, TypeScript), Tailwind CSS, Framer Motion, ShadCN UI |
| **Backend** | Java 17, Spring Boot 3.3, Spring Security, JWT |
| **Database** | MySQL (Spring Data JPA) |
| **Real-time** | SSE (Server-Sent Events) for instant notifications |
| **DevOps** | Maven, NPM, Git |

---

## 📱 Application Pages

TaskCraft features a comprehensive suite of pages, each meticulously designed for specific project management workflows:

### 🏠 Main Dashboard
- **Dashboard Page**: A bento-style overview of project health, showing task status distributions, priority breakdowns, and quick stats (Total Tasks, Done Tasks, Completion %).

### 🔄 Scrum & Kanban
- **Backlog Page**: The planning hub where you manage the product backlog, create sprints, and move tasks from the backlog into active sprints.
- **Active Sprint Page**: A specialized board for the current sprint, featuring drag-and-drop task movement through the `TODO` → `DONE` workflow.
- **Kanban Board**: A continuous flow visualization board that allows teams to manage tasks across various custom statuses.

### 👥 Management & Operations
- **Workspaces Manage**: Top-level container management for different organizations or sectors.
- **Projects Manage**: Direct project administration, member assignment, and project-specific settings.
- **Teams Manage**: Create and manage cross-functional teams within a workspace.
- **Search Page**: Advanced task searching with filters for title, description, status, and priority.

### 🛡️ User & Security
- **Authentication (Login/Register)**: Secure JWT-based entry point with persistent sessions.
- **Profile Page**: Personal user settings, profile updates, and password management.
- **Admin Center**: (ADMIN ONLY) User management, role assignment, and system-wide status control.

### 📊 Insights & History
- **Reports Page**: Generate and export project data into JSON or CSV formats for external analysis.
- **Activity Timeline**: A comprehensive audit trail (Activity Log) for workspaces, projects, and individual tasks.
- **Notifications**: Dedicated center to manage real-time alerts for task assignments, due dates, and mentions.

---

## 🌟 Core Features

- **Jira-Style Issue Tracking**: Automatic generation of project keys (e.g., `PROJ-12`) and full issue lifecycle management.
- **Smart Sprints**: Lifecycle management for sprints (Planned → Active → Completed).
- **Real-time Engine**: SSE-powered instant notifications for mentions, updates, and deadline reminders.
- **Interactive Kanban**: High-performance drag-and-drop interface utilizing `dnd-kit`.
- **Bento & Motion UI**: A premium user experience with motion-based interactions and a state-of-the-art UI layout.
- **Document Collaboration**: Support for threaded comments and file/link attachments on every task.

---

## 🔮 Roadmap: What can be added next?

To take TaskCraft to the legendary tier, we can implement the following:

### 1. 🤖 AI Integration (The "AI-Powered" Promise)
- **AI Task Summarization**: Automatically generate brief summaries for long comment threads.
- **Smart Estimation**: Use past performance to suggest Story Points for new tasks.
- **Predictive Analytics**: Forecast sprint completion dates and potential bottlenecks.

### 2. 📡 Advanced Real-time Collaboration
- **WebSockets for Live Editing**: See cursors and live edits on task descriptions (like Google Docs).
- **Video Conferencing**: Integrate 1-click Jitsi or Zoom meetings within project/team views.

### 3. 🛠️ Productivity Boosters
- **Dark/Light Mode Toggle**: Add a "Nebula Light" theme for users who prefer light interfaces.
- **Third-Party Integrations**: Slack/Discord webhooks for automated status updates.
- **Custom Workflow Builder**: Allow teams to define their own status columns (e.g., `READY_FOR_PROD`).

### 4. 📈 Enhanced Reporting
- **Burndown Charts**: Visual representation of work remaining vs. time in a sprint.
- **Velocity Tracking**: Measure how much work a team can get through in a typical sprint.

---

*This document provides a 360-degree view of the TaskCraft ecosystem.*
