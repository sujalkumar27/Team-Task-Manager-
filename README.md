# Team Task Manager

A full-stack web application where teams plan projects, assign tasks with due dates, and track progress on a personal dashboard. Built with Next.js, PostgreSQL, and Prisma. Role-based access (Admin / Member) is per project.

**Live demo:** https://team-task-managers.up.railway.app

**Repository:** https://github.com/sujalkumar27/Team-Task-Manager

---

## About the project

Whoever creates a project automatically becomes its Admin. The Admin can invite teammates by email and assign them the Admin or Member role. The same user can be an Admin in one project and a Member in another.

Each user gets a personal dashboard showing their open tasks across every project they belong to, with stat cards for To Do, In Progress, Done, and Overdue tasks.

## Tech stack

- **Frontend and backend:** Next.js 16 (App Router, TypeScript) — single Node service
- **Database:** PostgreSQL with Prisma ORM
- **Authentication:** Hand-written JWT in an httpOnly cookie, passwords hashed with bcrypt
- **Validation:** Zod on every API route
- **Styling:** Tailwind CSS 4
- **Deployment:** Railway

## Features

- Sign up, log in, log out (email and password)
- Create projects (creator automatically becomes Admin)
- Invite teammates by email and assign them as Admin or Member
- Promote, demote, or remove members (last Admin cannot be removed or demoted)
- Create tasks with title, description, status, priority, due date, and a single assignee
- Edit and delete tasks with proper permission checks
- Filter tasks by status, "Assigned to me", or Overdue
- Personal dashboard with stat cards and your open tasks across all projects
- Fully responsive — works on mobile (375px) up to desktop
- Inline form validation, empty states, friendly error pages

## Roles and permissions

| Action | Admin | Member |
|---|---|---|
| View the project | Yes | Yes |
| Create tasks | Yes | Yes |
| Edit any task | Yes | Only if assignee or creator |
| Delete any task | Yes | Only if creator |
| Invite or remove members | Yes | No |
| Change member roles | Yes | No |
| Rename or delete the project | Yes | No |

Every permission is enforced on the server, not just hidden in the UI.

## Try the live demo

1. Open https://team-task-managers.up.railway.app in your browser.
2. Click **Sign up** and create an account.
3. Click **Projects** → **New project** → give it a name → **Create**. You are now the Admin.
4. Open the project → **Tasks** tab → **New task** → fill the form → **Create task**.
5. Click **Edit** on the task, change Status to **Done**, and save. The dashboard reflects the change.

For the team flow, open a second browser (incognito), sign up with a different email, then from the first browser go to the project's **Members** tab and invite that email.

## Running the project locally

### Prerequisites

- Node.js 20 or newer
- A PostgreSQL database (a free account at https://neon.tech works)

### Setup

Clone the repository and install dependencies:

```bash
git clone https://github.com/sujalkumar27/Team-Task-Manager.git
cd Team-Task-Manager
npm install
```

Create your environment file:

```bash
cp .env.example .env
```

Open `.env` and set both values:

- `DATABASE_URL` — your PostgreSQL connection string
- `JWT_SECRET` — a random 32+ character string. Generate one with:

  ```bash
  node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
  ```

Create the database schema:

```bash
npx prisma migrate dev --name init
```

Start the dev server:

```bash
npm run dev
```

Open http://localhost:3000 in your browser.

## Environment variables

| Name | Description |
|---|---|
| `DATABASE_URL` | PostgreSQL connection string |
| `JWT_SECRET` | Random 32+ character string used to sign session JWTs |

## REST API

All endpoints return JSON. Non-auth endpoints require a valid session cookie.

| Method | Path | Description |
|---|---|---|
| POST | `/api/auth/signup` | Create an account |
| POST | `/api/auth/login` | Log in |
| POST | `/api/auth/logout` | Log out |
| GET | `/api/auth/me` | Get the current user |
| GET | `/api/projects` | List my projects |
| POST | `/api/projects` | Create a project (creator becomes Admin) |
| GET | `/api/projects/:id` | Get project details |
| PATCH | `/api/projects/:id` | Update project (Admin only) |
| DELETE | `/api/projects/:id` | Delete project (Admin only) |
| GET | `/api/projects/:id/members` | List members |
| POST | `/api/projects/:id/members` | Add a member by email (Admin only) |
| PATCH | `/api/projects/:id/members/:userId` | Change role (Admin only) |
| DELETE | `/api/projects/:id/members/:userId` | Remove member (Admin only) |
| GET | `/api/projects/:id/tasks` | List tasks (supports `?status=`, `?assignee=me`, `?overdue=true`) |
| POST | `/api/projects/:id/tasks` | Create a task |
| GET | `/api/tasks/:id` | Get a task |
| PATCH | `/api/tasks/:id` | Update a task |
| DELETE | `/api/tasks/:id` | Delete a task |
| GET | `/api/dashboard` | Dashboard stats and tasks |

## Project structure

```
app/
  (auth)/login/, signup/                  Public auth pages
  (app)/                                  Authenticated shell
    dashboard/page.tsx                    Personal dashboard
    projects/page.tsx                     Projects list
    projects/[id]/page.tsx                Project detail with tabs
  api/                                    REST endpoints (see table above)
lib/
  auth.ts                                 JWT + bcrypt helpers
  db.ts                                   Prisma client singleton
  permissions.ts                          Authorization guards
  validation.ts                           Zod schemas
  api-helpers.ts                          Typed errors and JSON helpers
  dates.ts                                Date formatting helpers
components/
  ui/                                     Button, Input, Modal, Card, etc.
  Navbar.tsx, ProjectCard.tsx,
  ProjectTabsNav.tsx, TaskCard.tsx,
  TaskFormModal.tsx, StatusBadge.tsx
prisma/schema.prisma                      Database schema
proxy.ts                                  Redirects unauthenticated users
```

## Deployment

The app is deployed on Railway with a managed PostgreSQL service. The build command runs `next build`, and the start command runs `prisma migrate deploy && next start` so any pending database migrations are applied automatically on each deploy.

## Author

**Sujal Kumar** — https://github.com/sujalkumar27
