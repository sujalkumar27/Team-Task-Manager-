import type { Prisma } from "@prisma/client";
import { notFound, redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { ProjectHeader } from "@/components/ProjectHeader";
import { ProjectTabsNav } from "@/components/ProjectTabsNav";
import { ProjectTasksTab } from "@/components/ProjectTasksTab";
import { ProjectMembersTab } from "@/components/ProjectMembersTab";
import { ProjectSettingsTab } from "@/components/ProjectSettingsTab";
import type { TaskFilter } from "@/components/TasksTabHeader";

type Props = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ tab?: string; filter?: string }>;
};

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const project = await prisma.project.findUnique({
    where: { id },
    select: { name: true },
  });
  return { title: project?.name ?? "Project" };
}

const VALID_FILTERS: TaskFilter[] = [
  "all",
  "todo",
  "in_progress",
  "done",
  "overdue",
  "mine",
];

function parseFilter(value: string | undefined): TaskFilter {
  return VALID_FILTERS.includes(value as TaskFilter)
    ? (value as TaskFilter)
    : "all";
}

function whereForFilter(
  projectId: string,
  filter: TaskFilter,
  userId: string
): Prisma.TaskWhereInput {
  const base: Prisma.TaskWhereInput = { projectId };
  switch (filter) {
    case "todo":
      return { ...base, status: "TODO" };
    case "in_progress":
      return { ...base, status: "IN_PROGRESS" };
    case "done":
      return { ...base, status: "DONE" };
    case "overdue":
      return {
        ...base,
        status: { not: "DONE" },
        dueDate: { lt: new Date() },
      };
    case "mine":
      return { ...base, assigneeId: userId };
    default:
      return base;
  }
}

export default async function ProjectDetailPage({
  params,
  searchParams,
}: Props) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  const { id } = await params;
  const { tab, filter } = await searchParams;

  const membership = await prisma.projectMember.findUnique({
    where: { projectId_userId: { projectId: id, userId: user.id } },
    select: { role: true },
  });
  if (!membership) notFound();

  const project = await prisma.project.findUnique({
    where: { id },
    select: {
      id: true,
      name: true,
      description: true,
      createdAt: true,
      members: {
        orderBy: [{ role: "asc" }, { joinedAt: "asc" }],
        select: {
          id: true,
          userId: true,
          role: true,
          user: { select: { id: true, name: true, email: true } },
        },
      },
    },
  });
  if (!project) notFound();

  const requested =
    tab === "members" || tab === "settings" ? tab : "tasks";
  const active: "tasks" | "members" | "settings" =
    requested === "settings" && membership.role !== "ADMIN"
      ? "tasks"
      : requested;

  const activeFilter = parseFilter(filter);

  const tasks =
    active === "tasks"
      ? await prisma.task.findMany({
          where: whereForFilter(project.id, activeFilter, user.id),
          orderBy: [
            { dueDate: { sort: "asc", nulls: "last" } },
            { priority: "desc" },
            { createdAt: "desc" },
          ],
          select: {
            id: true,
            title: true,
            description: true,
            status: true,
            priority: true,
            dueDate: true,
            assigneeId: true,
            createdById: true,
            assignee: { select: { id: true, name: true, email: true } },
            createdBy: { select: { id: true, name: true } },
          },
        })
      : [];

  const taskFormMembers = project.members.map((m) => ({
    userId: m.userId,
    user: { id: m.user.id, name: m.user.name },
  }));

  return (
    <div>
      <ProjectHeader project={project} role={membership.role} />
      <ProjectTabsNav
        projectId={project.id}
        active={active}
        role={membership.role}
      />
      {active === "tasks" && (
        <ProjectTasksTab
          projectId={project.id}
          tasks={tasks}
          members={taskFormMembers}
          viewerUserId={user.id}
          viewerRole={membership.role}
          activeFilter={activeFilter}
        />
      )}
      {active === "members" && (
        <ProjectMembersTab
          projectId={project.id}
          members={project.members}
          viewerRole={membership.role}
          viewerUserId={user.id}
        />
      )}
      {active === "settings" && membership.role === "ADMIN" && (
        <ProjectSettingsTab project={project} />
      )}
    </div>
  );
}
