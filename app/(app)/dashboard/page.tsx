import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { Card } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { StatusBadge } from "@/components/StatusBadge";
import { RoleBadge } from "@/components/StatusBadge";
import { formatDueDate, isOverdue } from "@/lib/dates";

export const metadata = { title: "Dashboard" };

export default async function DashboardPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  const now = new Date();

  const [statusGroups, overdueCount, myTasks, recentMemberships] =
    await Promise.all([
      prisma.task.groupBy({
        by: ["status"],
        where: { assigneeId: user.id },
        _count: { _all: true },
      }),
      prisma.task.count({
        where: {
          assigneeId: user.id,
          status: { not: "DONE" },
          dueDate: { lt: now },
        },
      }),
      prisma.task.findMany({
        where: { assigneeId: user.id, status: { not: "DONE" } },
        orderBy: [
          { dueDate: { sort: "asc", nulls: "last" } },
          { priority: "desc" },
          { createdAt: "desc" },
        ],
        take: 10,
        select: {
          id: true,
          title: true,
          status: true,
          dueDate: true,
          project: { select: { id: true, name: true } },
        },
      }),
      prisma.projectMember.findMany({
        where: { userId: user.id },
        orderBy: { project: { updatedAt: "desc" } },
        take: 5,
        select: {
          role: true,
          project: {
            select: {
              id: true,
              name: true,
              _count: { select: { tasks: true, members: true } },
            },
          },
        },
      }),
    ]);

  const counts = {
    todo: statusGroups.find((g) => g.status === "TODO")?._count._all ?? 0,
    inProgress:
      statusGroups.find((g) => g.status === "IN_PROGRESS")?._count._all ?? 0,
    done: statusGroups.find((g) => g.status === "DONE")?._count._all ?? 0,
    overdue: overdueCount,
  };

  const firstName = user.name.split(" ")[0];

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-semibold text-slate-900">
          Hi, {firstName}
        </h1>
        <p className="text-sm text-slate-600 mt-0.5">
          Here&apos;s what&apos;s on your plate today.
        </p>
      </header>

      <section
        aria-label="Task stats"
        className="grid grid-cols-2 sm:grid-cols-4 gap-3"
      >
        <StatCard label="To Do" value={counts.todo} accent="slate" />
        <StatCard
          label="In Progress"
          value={counts.inProgress}
          accent="blue"
        />
        <StatCard label="Done" value={counts.done} accent="green" />
        <StatCard label="Overdue" value={counts.overdue} accent="red" />
      </section>

      <section>
        <h2 className="text-base font-semibold text-slate-900 mb-3">
          My tasks
        </h2>
        {myTasks.length === 0 ? (
          <EmptyState
            title="Nothing on your plate"
            description="Tasks assigned to you will appear here."
          />
        ) : (
          <Card>
            <ul className="divide-y divide-slate-200">
              {myTasks.map((t) => {
                const overdue = isOverdue(t.dueDate, t.status);
                const dueLabel = formatDueDate(t.dueDate);
                return (
                  <li key={t.id}>
                    <Link
                      href={`/projects/${t.project.id}`}
                      className="flex items-center gap-3 px-4 sm:px-5 py-3 hover:bg-slate-50 transition-colors"
                    >
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-slate-900 truncate">
                          {t.title}
                        </p>
                        <p className="text-xs text-slate-500 truncate">
                          {t.project.name}
                          {dueLabel && (
                            <>
                              <span aria-hidden="true"> · </span>
                              <span
                                className={
                                  overdue ? "text-red-600 font-medium" : ""
                                }
                              >
                                Due {dueLabel}
                                {overdue && " (overdue)"}
                              </span>
                            </>
                          )}
                        </p>
                      </div>
                      <StatusBadge status={t.status} />
                    </Link>
                  </li>
                );
              })}
            </ul>
          </Card>
        )}
      </section>

      <section>
        <h2 className="text-base font-semibold text-slate-900 mb-3">
          Recent projects
        </h2>
        {recentMemberships.length === 0 ? (
          <EmptyState
            title="No projects yet"
            description="Create a project to start tracking tasks."
            action={
              <Link
                href="/projects"
                className="text-sm text-indigo-600 hover:text-indigo-700 font-medium"
              >
                Go to projects →
              </Link>
            }
          />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {recentMemberships.map((m) => (
              <Link
                key={m.project.id}
                href={`/projects/${m.project.id}`}
                className="block"
              >
                <Card className="p-4 hover:border-slate-300 hover:shadow transition-all h-full">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="font-medium text-slate-900 line-clamp-1">
                      {m.project.name}
                    </h3>
                    <RoleBadge role={m.role} />
                  </div>
                  <p className="text-xs text-slate-500 mt-2">
                    {m.project._count.tasks}{" "}
                    {m.project._count.tasks === 1 ? "task" : "tasks"} ·{" "}
                    {m.project._count.members}{" "}
                    {m.project._count.members === 1 ? "member" : "members"}
                  </p>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

function StatCard({
  label,
  value,
  accent,
}: {
  label: string;
  value: number;
  accent: "slate" | "blue" | "green" | "red";
}) {
  const accentColor: Record<typeof accent, string> = {
    slate: "text-slate-700",
    blue: "text-blue-700",
    green: "text-green-700",
    red: "text-red-700",
  };
  return (
    <Card className="p-4">
      <p className="text-xs uppercase tracking-wide text-slate-500 font-medium">
        {label}
      </p>
      <p
        className={`text-3xl font-semibold mt-1 ${accentColor[accent]}`}
      >
        {value}
      </p>
    </Card>
  );
}
