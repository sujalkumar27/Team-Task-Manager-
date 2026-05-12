# Team Task Manager

A web app for teams to plan projects, assign tasks with due dates, and track progress on a personal dashboard. Roles are per-project: whoever creates a project becomes its Admin and invites others as Admins or Members. Each user can be an Admin in one project and a Member in another.

## Tech stack

- **Next.js 16** (App Router, TypeScript) — UI and REST API in one Node service
- **PostgreSQL** with **Prisma 7** ORM
- **JWT auth** in an `httpOnly` cookie with bcrypt-hashed passwords
- **Zod** input validation on every API route
- **Tailwind CSS 4** for styling

## Features

- Email + password sign up / log in / log out
- Create projects; the creator is automatically the project Admin
- Invite existing users by email; assign role (Admin or Member)
- Promote / demote members; safe last-admin guard (you can't remove or demote the only admin)
- Create tasks with title, description, status, priority, due date, and a single assignee (must be a project member)
- Per-project role gating: admins can rename and delete the project; members can view
- Per-task auth: admins, the assignee, or the creator can edit; admins or creator can delete
- Filter tasks by status, "assigned to me", or overdue
- Dashboard with four stat cards (To Do / In Progress / Done / Overdue) and your open tasks across all projects
- Responsive UI (works down to a 375px viewport)
- Inline form validation, friendly empty states, error and not-found pages

## Screenshots

Add screenshots after running locally — suggested:

- `/login` and `/signup`
- `/dashboard` with stat cards
- `/projects` (project list)
- `/projects/[id]` Tasks tab with filter chips
- `/projects/[id]?tab=members` (admin view with role dropdowns)

## Quick start

You'll need:

- **Node.js 20** or newer (`node --version` to check)
- **A PostgreSQL database** — pick one of the two options in step 2 below

### 1. Clone and install

```bash
git clone https://github.com/<your-username>/team-task-manager.git
cd team-task-manager
npm install
```

`npm install` triggers `prisma generate` automatically via the `postinstall` script.

### 2. Get a PostgreSQL database

Pick whichever is easier for you. Both work for local development.

**Option A — Neon (free hosted, no local install)**

1. Sign up at https://neon.tech (no credit card required)
2. Create a project (any name, pick a region near you)
3. Copy the connection string. It looks like:
   ```
   postgresql://user:pass@ep-xxx.region.aws.neon.tech/neondb?sslmode=require
   ```

**Option B — Local Postgres via Docker**

You'll need Docker Desktop installed. Then run:

```bash
docker run -d --name ttm-postgres -e POSTGRES_PASSWORD=postgres -e POSTGRES_DB=teamtaskmanager -p 5432:5432 postgres:16
```

Your connection string is:

```
postgresql://postgres:postgres@localhost:5432/teamtaskmanager?schema=public
```

### 3. Configure environment variables

Copy the example file:

```bash
cp .env.example .env
```

Open `.env` and set both values:

- `DATABASE_URL` — paste the connection string from step 2
- `JWT_SECRET` — generate a strong random string:

  ```bash
  node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
  ```

  Paste the output as the value (32+ characters).

### 4. Create the database schema

```bash
npx prisma migrate dev --name init
```

This creates the four tables (`User`, `Project`, `ProjectMember`, `Task`) and applies all indexes.

### 5. Start the dev server

```bash
npm run dev
```

Open http://localhost:3000. You'll be redirected to `/login`. Click "Sign up" to create your first account.

### 6. Try it end-to-end

1. Sign up an account (call it Alice). You'll land on the dashboard.
2. Open `/projects` → **New project** → call it "Demo". You're now the Admin.
3. Open a private/incognito window, go to http://localhost:3000/signup, and sign up a second account (call it Bob).
4. Switch back to Alice → **Members** tab on the Demo project → enter Bob's email → role **Member** → **Add**.
5. Go to **Tasks** tab → **New task** → title, due date, assign to Bob, **Create**.
6. Switch to Bob's window → his dashboard shows the task in "My tasks" and the **To Do** stat card increments.
7. Bob opens the project → notice **no Settings tab** (he's not Admin) → click **Edit** on his task → change status to **Done**.
8. Switch back to Alice → her dashboard reflects the change.

If every step works, your local setup is good.

## Environment variables

| Name | Required | Description |
|---|---|---|
| `DATABASE_URL` | Yes | Postgres connection string. For Neon, must include `?sslmode=require`. |
| `JWT_SECRET` | Yes | Random string of 32+ characters used to sign session JWTs. **Use a different value in production.** |

## Available scripts

| Command | What it does |
|---|---|
| `npm run dev` | Start the dev server with hot reload at http://localhost:3000 |
| `npm run build` | Apply pending migrations and build for production |
| `npm start` | Serve the production build (`npm run build` first) |
| `npm run lint` | Run ESLint |
| `npm run db:migrate` | Create and apply a new dev migration after schema changes |
| `npm run db:studio` | Open Prisma Studio (browser-based DB inspector) at http://localhost:5555 |

## Project structure

```
/app
  /(auth)/{login,signup}/page.tsx     Public auth pages
  /(app)/                              Authenticated shell (Navbar, layout, error, not-found)
    dashboard/page.tsx                Dashboard with stat cards and "My tasks"
    projects/page.tsx                 Projects list
    projects/[id]/page.tsx            Project detail with Tasks / Members / Settings tabs
  /api/
    auth/{signup,login,logout,me}/route.ts
    projects/route.ts                 + /[id]/route.ts
    projects/[id]/members/route.ts    + /[userId]/route.ts
    projects/[id]/tasks/route.ts
    tasks/[id]/route.ts
    dashboard/route.ts
/lib
  auth.ts            JWT + bcrypt helpers, getCurrentUser
  db.ts              Prisma client singleton (HMR-safe)
  permissions.ts     requireUser / requireMember / requireAdmin / loadTaskWithAccess
  validation.ts      Zod schemas for every input
  api-helpers.ts     Typed ApiError, JSON helpers, error wrapper
  dates.ts           Due-date formatting and overdue helper
/components
  /ui/               Button, Input, Label, Select, Textarea, Card, Badge, Modal, Spinner, Skeleton, EmptyState
  Navbar.tsx
  ProjectCard.tsx, ProjectHeader.tsx, ProjectTabsNav.tsx
  ProjectTasksTab.tsx, ProjectMembersTab.tsx, ProjectSettingsTab.tsx
  NewProjectModal.tsx, ProjectsHeader.tsx
  TaskCard.tsx, TaskFormModal.tsx, TasksTabHeader.tsx
  StatusBadge.tsx (StatusBadge, PriorityBadge, RoleBadge)
/prisma/schema.prisma
proxy.ts             Redirects unauthenticated users away from /(app) routes
```

## API endpoints

All return JSON. All non-auth routes require a valid session cookie.

| Method | Path | Who |
|---|---|---|
| `POST` | `/api/auth/signup` | Public |
| `POST` | `/api/auth/login` | Public |
| `POST` | `/api/auth/logout` | Authed |
| `GET` | `/api/auth/me` | Authed |
| `GET` / `POST` | `/api/projects` | List projects you belong to / Create new |
| `GET` / `PATCH` / `DELETE` | `/api/projects/:id` | Members / Admin / Admin |
| `GET` / `POST` | `/api/projects/:id/members` | Members / Admin |
| `PATCH` / `DELETE` | `/api/projects/:id/members/:userId` | Admin / Admin (last-admin guard) |
| `GET` / `POST` | `/api/projects/:id/tasks` | Members; supports `?status=`, `?assignee=me`, `?overdue=true` |
| `GET` / `PATCH` / `DELETE` | `/api/tasks/:id` | Members / Admin-or-assignee-or-creator / Admin-or-creator |
| `GET` | `/api/dashboard` | `{ myTasks, counts, recentProjects }` |

## Deploy to Railway

1. Push the repo to GitHub.
2. In Railway, create a new project → **Deploy from GitHub repo**.
3. Add the **PostgreSQL** plugin to the same project.
4. On the Next.js service, set environment variables:
   - `DATABASE_URL` — reference the Postgres plugin's `DATABASE_URL` variable
   - `JWT_SECRET` — generate a fresh random secret (do **not** reuse your local one)
5. Railway will use the `build` script (`prisma migrate deploy && next build`), so migrations apply automatically on each deploy.
6. Open the deployed URL and sign up to verify everything works.

## Troubleshooting

- **`PrismaClientInitializationError: Can't reach database`**
  Your `DATABASE_URL` is wrong or the database is unreachable. Verify with `npx prisma db pull` — if that fails, the URL or network is the problem.
- **`JWT_SECRET is missing or too short`**
  Set `JWT_SECRET` in `.env` to a 32+ character random string (see the `node -e ...` command above).
- **`Error: P1001: Can't reach database server` on a Neon URL**
  Make sure the URL ends with `?sslmode=require`. Neon requires SSL.
- **Logging in works but the page bounces back to `/login`**
  In production the session cookie is `secure: true`, so it won't be set over plain HTTP. Either deploy behind HTTPS (Railway does this automatically) or test in `npm run dev` over `http://localhost:3000`.
- **`docker run` says port 5432 is already in use**
  You already have a local Postgres on that port. Either stop it (`brew services stop postgresql`, `sudo systemctl stop postgresql`, etc.) or change the Docker port mapping (e.g. `-p 5433:5432`) and update `DATABASE_URL` to match.
- **The Members tab returns 404 when adding a teammate**
  The teammate must sign up first — the invite flow looks up existing users by email. Full email-invite is a stretch goal.

## Stretch goals (not implemented)

- Email-based invitation flow (invite people who haven't signed up yet)
- Task comments and activity log
- Email and in-app notifications for due / overdue tasks
- File attachments on tasks
- Password reset
- Multi-assignee tasks
- Dark mode

## License

MIT
