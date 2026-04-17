# Project Report On "TaskCraft (Project Management System)"

**Prepared by:** Krunal Gadhiya (22DCE030)  
**Under the Supervision of:** [Supervisor Name]  
**Submitted to:** Devang Patel Institute of Advance Technology and Research (DEPSTAR)  
Faculty of Technology & Engineering (FTE), CHARUSAT  

---

## TABLE OF CONTENTS
- [Chapter 1: Introduction](#chapter-1-introduction)
- [Chapter 2: Project Management](#chapter-2-project-management)
- [Chapter 3: System Requirements Study](#chapter-3-system-requirements-study)
- [Chapter 4: System Analysis](#chapter-4-system-analysis)
- [Chapter 5: System Design](#chapter-5-system-design)
- [Chapter 6: Implementation Planning](#chapter-6-implementation-planning)
- [Chapter 7: Testing](#chapter-7-testing)
- [Chapter 8: Conclusion and Discussion](#chapter-8-conclusion-and-discussion)
- [Chapter 9: Limitation and Future Enhancement](#chapter-9-limitation-and-future-enhancement)
- [Bibliography](#bibliography)

---

## Chapter 1: Introduction

### Project Summary
TaskCraft is a comprehensive, modern Project Management SaaS application designed to streamline workflows, enhance team collaboration, and track project life cycles efficiently. It features a robust bento-grid dashboard, real-time Kanban boards, sprint tracking, and a unified workspace environment to handle complex agile methodologies.

### Purpose
The primary purpose of TaskCraft is to provide teams with a centralized, highly responsive, and premium-tier platform to manage their software development lifecycle (SDLC) or generic task pipelines. It aims to eliminate communication silos and scattered tooling by integrating sprints, backlogs, and real-time task movement into a single intuitive interface.

### Objective
- To deliver a highly scalable full-stack application utilizing a React frontend and a Java Spring Boot backend.
- To implement highly responsive, motion-rich user interfaces using Tailwind CSS and Framer Motion.
- To securely handle user authentication, workspace segregation, and role-based access control.
- To deploy the application in a production-ready cloud environment (Vercel and Railway).

### Scope
TaskCraft caters to agile teams, project managers, and freelance professionals. Its scope covers managing multiple workspaces, creating and assigning tasks, executing sprints with timeline tracking, and providing analytics via a dashboard. Future scope includes integrations with third-party tools like GitHub and Slack.

### Tools & Technology Used
- **Frontend:** React (Vite), TypeScript, Tailwind CSS, Framer Motion, Lucide Icons, Axios.
- **Backend:** Java 17, Spring Boot, Spring Security (JWT), Hibernate/JPA.
- **Database:** MySQL.
- **Deployment:** Vercel (Frontend), Railway.app (Backend & DB), Docker.
- **Version Control:** Git & GitHub.

---

## Chapter 2: Project Management

### Project Planning
Project planning involved dividing the application into core epics: Authentication, Workspace/Project Architecture, Core Task Management (Kanban), and UI/UX Modernization. A 4-phase agile methodology was adopted.

### Project Development Approach and Justification
An Agile iterative approach was selected because requirements for UI/UX often shift based on usability testing. The backend was developed as a RESTful monolith using Spring Boot to ensure rapid development, while the frontend utilized React for high interactivity and state management.

### Project Effort and Time, Cost Estimation
- **Time:** The project span covered roughly 12 weeks, with sprints divided bi-weekly.
- **Effort:** 800+ person-hours spanning database design, API construction, frontend component building, and deployment orchestration.
- **Cost Estimation:** Utilized open-source frameworks (React, Spring Boot) and free deployment tiers (Railway/Vercel) to maintain a zero-cost infrastructure during development.

### Roles and Responsibilities
- **Frontend Development:** UI/UX design, component architecture, state management, API integration.
- **Backend Development:** Database schema modeling, REST API endpoints, security, business logic.
- **DevOps:** Dockerizing the backend, configuring CI/CD pipelines, managing environment variables, and cloud deployment.

### Group Dependencies
The frontend development heavily depended on the readiness of the backend REST APIs. Postman was used to mock API requests when the backend was still under construction.

### Project Work Scheduling
1. **Week 1-2:** Requirement analysis and UI wireframing.
2. **Week 3-5:** Database design, Spring Boot APIs, and JWT Authentication.
3. **Week 6-8:** Frontend React components, Kanban drag-and-drop, App shell.
4. **Week 9-10:** UI/UX Polish, dark theme, animations.
5. **Week 11-12:** Testing, Deployment (Railway & Vercel), and final reporting.

---

## Chapter 3: System Requirements Study

### User Characteristics
Users vary from highly technical software engineers to non-technical project managers. The interface must be intuitive, requiring zero onboarding for basic operations, while supporting power-user features (Command Palette `Cmd+K`, keyboard shortcuts).

### Hardware and Software Requirement
- **Hardware:** Standard PC/Mac or Mobile device with an internet connection.
- **Software:** Any modern web browser (Chrome, Firefox, Safari, Edge).
- **Server:** Minimum 1GB RAM, 1 vCPU for the Spring Boot application (Dockerized container). MySQL Database server.

### Assumptions and Dependencies
- Users are assumed to have stable internet access.
- The system depends on a stable backend cloud host (Railway) ensuring high availability of the database.

---

## Chapter 4: System Analysis

### Study of Current System
Current legacy project management tools are often bloated, slow, and lack modern aesthetic appeal, requiring extensive training.

### Problem and Weaknesses of Current System
- High cognitive load with cluttered interfaces.
- Sluggish performance on client-side state updates.
- Poor mobile responsiveness for complex views like Kanban boards.

### Requirements of New System
The new system requires a real-time reactive interface, deep dark mode support out of the box, instantaneous drag-and-drop mechanics, and a simplified bento-grid dashboard.

### Functional Requirements
- **User Management:** Registration, login, JWT issuance, profile settings.
- **Workspace Navigation:** Create workspaces and distinct projects within them.
- **Task Lifecycle:** Create, edit, assign, prioritize, and move tasks through states (TODO, IN PROGRESS, REVIEW, DONE).
- **Sprint Tracking:** Ability to start sprints, move backlog items into active sprints, and monitor progress.

### Non-Functional Requirements
- **Performance:** APIs must respond in under 200ms.
- **Security:** Passwords encrypted using BCrypt. Stateless session management via JWT.
- **Usability:** Fully responsive layout (collapsible sidebars, horizontal snapping columns on mobile).

### Feasibility Study
- **Technical Feasibility:** Highly feasible. React and Spring Boot are industry standards with vast community support.
- **Schedule Feasibility:** The 12-week timeline was sufficient to deliver the MVP.
- **Integration Feasibility:** REST APIs ensure the backend can be consumed by any future client (e.g., a native mobile app).

### Use Case Diagram & Class Diagram
*(Diagrams can be attached here in the final Word Document printout)*
- **Actors:** User, Admin.
- **Primary Use Cases:** Manage Task, Manage Sprint, View Dashboard.
- **Entities:** User, Workspace, Project, Task, Sprint, Notification.

---

## Chapter 5: System Design

### System Application Design
TaskCraft uses a modern Client-Server Architecture. The client is a Single Page Application (SPA). The backend follows a standard Controller-Service-Repository pattern.

### Pseudo code
**Task Movement Logic:**
```
IF task.newStatus == DONE THEN
   updateTaskStatus(task.id, DONE)
   triggerConfettiAnimation()
   return SUCCESS
END IF
```

### Input/Output and Interface Design
Inputs are validated through React controlled components and backend DTO constraints (`@NotBlank`, `@Email`). Outputs are standardized JSON payload wrappers structured as:
`{ "message": "...", "data": {...} }`

---

## Chapter 6: Implementation Planning

### Implementation Environment
- Local Environment: VS Code (Frontend) and IntelliJ IDEA (Backend).
- Local Server: Node.js (Vite Dev Server) and Apache Tomcat (Embedded in Spring Boot).

### Program/Modules Specification
- **Auth Module:** Handles standard login and registration flows.
- **Kanban Module:** Powered by `dnd-kit` for sensory-based drag and drop events.
- **Layout Module:** Uses `Framer Motion` for side-drawer sliding and splash screen transitions.

### Security Features
- Endpoints secured by `JwtAuthenticationFilter`.
- CORS configurations rigorously set to accept requests only from verified domains.
- SQL Injection prevention achieved natively via Hibernate ORM parameters.

### Coding Standards
- Frontend: Strict ESLint, Prettier, and absolute imports where applicable. TypeScript strict mode enabled.
- Backend: Java naming conventions, proper packaging (`com.taskcraft.controller`, `com.taskcraft.service`), and dependency injection.

---

## Chapter 7: Testing

### Testing Plan
The system underwent Unit Testing, Integration Testing, and User Acceptance Testing (UAT).

### Testing Strategy
- **Frontend:** Manual visual regression testing across Desktop, Tablet, and Mobile viewports.
- **Backend:** Postman collections heavily utilized to hit all CRUD operations and verify JWT Bearer token rejection on restricted endpoints.

### Test Cases
1. **TC01:** Login with invalid credentials. *Expected:* 401 Unauthorized, toast error displayed. *Result:* Pass.
2. **TC02:** Drag task to new column. *Expected:* Backend updates column ID, frontend snaps to new grid. *Result:* Pass.
3. **TC03:** Mobile sidebar test. *Expected:* Sidebar hides on screens < 768px and relies on hamburger menu. *Result:* Pass.

---

## Chapter 8: Conclusion and Discussion

### Self Analysis of Project Viabilities
TaskCraft successfully met its objectives, proving to be a highly viable solution for small to mid-sized teams looking for a fast, aesthetically pleasing project tracker.

### Problem Encountered and Possible Solutions
- **Problem:** Deployment crashes on Railway due to missing email environment variables.
- **Solution:** Configured `application-prod.properties` to adopt default placeholder variables (`MAIL_HOST:localhost`) ensuring the application boots successfully even when certain features aren't used.
- **Problem:** Docker Image conflicts (`maven:3.8.1-eclipse-temurin-17-alpine` missing from registry).
- **Solution:** Migrated the build stage to standard `openjdk-17-slim` images.

### Summary of Project Work
In conclusion, TaskCraft evolved from a base concept into a fully-fledged, production-ready SaaS platform. It incorporates modern UX paradigms—such as command palettes, side-drawers, and gamified task completions—setting it apart from legacy software.

---

## Chapter 9: Limitation and Future Enhancement

### Limitations
- Currently lacks native mobile app wrappers (iOS/Android), although the web view is highly responsive.
- Notification system is currently polling/refresh based rather than utilizing true WebSockets for real-time pushing.

### Future Enhancement
- Implement WebSockets (`SockJS/STOMP`) for immediate real-time updates when multiple users edit the same Kanban board.
- Integrate third-party webhooks (e.g., closing a Task automatically triggers a notification in a Slack channel).
- Add advanced analytical charting (Velocity charts, Cumulative Flow Diagrams) beyond the current burn-up chart.

---

## Bibliography
1. Spring Boot Documentation: https://spring.io/projects/spring-boot
2. React & Vite Documentation: https://react.dev/, https://vitejs.dev/
3. Tailwind CSS: https://tailwindcss.com/
4. Framer Motion API: https://www.framer.com/motion/
5. dnd-kit (Drag and Drop): https://dndkit.com/
