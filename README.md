# Team Task Manager

A web app where teams can create projects, invite members, assign tasks with due dates, and track progress on a dashboard. Roles are per-project — whoever creates a project is its Admin, and they invite Members. Each user can be an Admin in one project and a Member in another.

## Tech stack

- **Next.js 16** (App Router, TypeScript) — frontend and API in one Node service
- **PostgreSQL** with **Prisma** ORM
- **Hand-rolled JWT auth** with bcrypt (httpOnly cookie, no third-party auth lib)
- **Zod** validation on every API route
- **Tailwind CSS 4** for styling
- Deployed on **Railway**

## Features

- Email + password sign up / log in / log out
- Create projects; creator is automatically the project Admin
- Invite existing users by email; assign role (Admin or Member)
- Promote/demote members; safe last-admin guard (you can't remove or demote the only admin)
- Create tasks with status, priority, due date, single assignee (must be a project member)
- Per-project role gating: admins can edit project settings and delete; members can view
- Per-task auth: admins, the assignee, or the creator can edit; admins or creator can delete
- Filter tasks by status, "assigned to me", or overdue
- Dashboard with stat cards (Todo / In Progress / Done / Overdue) and your open tasks across all projects
- Responsive UI (works at 375px width)
- Inline validation, friendly empty states, and error/not-found pages

## Screenshots

Add screenshots here after deploying:

- Login / signup
- Dashboard with stat cards
- Projects list
- Project detail with Tasks tab
- Project detail with Members tab (admin view)

## Local development

### 1. Prerequisites

- Node.js 20 or newer
- Docker Desktop (for local Postgres) — or your own Postgres instance

### 2. Install dependencies

```bash
npm install
```

This also runs `prisma generate` automatically via the `postinstall` script.

### 3. Start Postgres

If using Docker:

```bash
docker run -d --name ttm-postgres -e POSTGRES_PASSWORD=postgres -e POSTGRES_DB=teamtaskmanager -p 5432:5432 postgres:16
```

If using your own Postgres, create a database named `teamtaskmanager` and update `DATABASE_URL` in `.env` to match your credentials.

### 4. Set environment variables

Copy `.env.example` to `.env` and adjust as needed:

```bash
cp .env.example .env
```

| Variable | Description |
|---|---|
| `DATABASE_URL` | Postgres connection string |
| `JWT_SECRET` | Long random string (32+ chars) used to sign session JWTs |

Generate a strong secret:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### 5. Run the database migration

```bash
npx prisma migrate dev
```

This creates the schema in your local Postgres.

### 6. Start the dev server

```bash
npm run dev
```

Open http://localhost:3000.

### Useful scripts

- `npm run dev` — start the Next.js dev server
- `npm run build` — apply migrations and build for production
- `npm run start` — serve the production build
- `npm run db:migrate` — create / apply a new dev migration
- `npm run db:studio` — open Prisma Studio (DB inspector)
- `npm run lint` — run ESLint

## Project structure

```
/app
  /(auth)/{login,signup}/page.tsx     Public auth pages
  /(app)/                              Authed shell (Navbar, layout, error, not-found)
    /dashboard/page.tsx
    /projects/page.tsx                Projects list
    /projects/[id]/page.tsx           Project detail with tabs
  /api/
    /auth/{signup,login,logout,me}/route.ts
    /projects/route.ts                + /[id]/route.ts
    /projects/[id]/members/...
    /projects/[id]/tasks/route.ts
    /tasks/[id]/route.ts
    /dashboard/route.ts
/lib
  auth.ts            JWT + bcrypt helpers, getCurrentUser
  db.ts              Prisma client singleton (HMR-safe)
  permissions.ts     requireUser/Member/Admin and loadTaskWithAccess
  validation.ts      Zod schemas for every input
  api-helpers.ts     Typed ApiError, withErrorHandler, JSON helpers
  dates.ts           Due-date formatting + overdue helper
/components
  /ui/               Button, Input, Label, Select, Textarea, Card, Badge, Modal, Spinner, Skeleton, EmptyState
  Navbar.tsx
  ProjectCard.tsx, ProjectHeader.tsx, ProjectTabsNav.tsx
  ProjectTasksTab.tsx, ProjectMembersTab.tsx, ProjectSettingsTab.tsx
  NewProjectModal.tsx, ProjectsHeader.tsx
  TaskCard.tsx, TaskFormModal.tsx, TasksTabHeader.tsx
  StatusBadge.tsx (StatusBadge, PriorityBadge, RoleBadge)
/prisma/schema.prisma
middleware.ts        Redirects unauthed users away from /(app) routes
```

## Deploying to Railway

1. Push the repo to GitHub.
2. In Railway, create a new project → **Deploy from GitHub repo**.
3. Add the **PostgreSQL** plugin to the same project.
4. On the Next.js service, set environment variables:
   - `DATABASE_URL` — reference the Postgres plugin's `DATABASE_URL` variable
   - `JWT_SECRET` — generate a fresh random secret (do not reuse your local one)
5. Railway will pick up the `build` script (`prisma migrate deploy && next build`) automatically, applying migrations on each deploy.
6. Once deployed, smoke-test the happy path:
   - Sign up account A → create project → assign yourself a task
   - Sign up account B (incognito) → from A, add B's email as a Member
   - From B, see the project; confirm Settings tab is hidden
   - From A, change a task's status; verify the dashboard counts update

## Design decisions worth noting

- **Single source of truth on roles**: each `ProjectMember` row owns its role. A user with no `ProjectMember` row for a project simply doesn't see it — there's no separate "permission" table.
- **Invites are by existing user email** (the user must already have signed up). A full email-based invitation flow is a stretch goal — see below.
- **Single assignee per task** (nullable). The spec explicitly locked this.
- **Overdue** = `dueDate < now AND status != DONE`. Same definition used on the dashboard, in the API, and in the filter chips.
- **JWT cookie**, never localStorage. The cookie is `httpOnly`, `sameSite=lax`, `secure` in production.
- **All API routes** validate input with Zod and check permissions before touching the database. Multi-table mutations (project creation) use `prisma.$transaction`.
- **No NextAuth / Clerk / Supabase Auth.** Auth is written by hand with `bcryptjs` + `jsonwebtoken` per the project brief.

## Stretch goals (not implemented)

- Email-based invitation flow (send a magic link to non-registered emails)
- Task comments and activity log
- In-app notifications and email reminders for due tasks
- File attachments on tasks
- Password reset flow
- Multi-assignee tasks
- Dark mode

## License

MIT
