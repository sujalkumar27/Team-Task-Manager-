import { prisma } from "@/lib/db";
import { requireUser } from "@/lib/permissions";
import { ok, withErrorHandler } from "@/lib/api-helpers";

export const GET = withErrorHandler(async () => {
  const user = await requireUser();
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
          priority: true,
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
    todo: 0,
    inProgress: 0,
    done: 0,
    overdue: overdueCount,
  };
  for (const g of statusGroups) {
    if (g.status === "TODO") counts.todo = g._count._all;
    if (g.status === "IN_PROGRESS") counts.inProgress = g._count._all;
    if (g.status === "DONE") counts.done = g._count._all;
  }

  const recentProjects = recentMemberships.map((m) => ({
    id: m.project.id,
    name: m.project.name,
    role: m.role,
    taskCount: m.project._count.tasks,
    memberCount: m.project._count.members,
  }));

  return ok({ myTasks, counts, recentProjects });
});
