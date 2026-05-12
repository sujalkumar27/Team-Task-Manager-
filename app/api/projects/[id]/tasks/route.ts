import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/db";
import { requireMember, requireUser } from "@/lib/permissions";
import { taskCreateSchema, taskFilterSchema } from "@/lib/validation";
import {
  BadRequest,
  created,
  ok,
  readJson,
  withErrorHandler,
} from "@/lib/api-helpers";

type Ctx = { params: Promise<{ id: string }> };

export const GET = withErrorHandler(async (req: Request, { params }: Ctx) => {
  const user = await requireUser();
  const { id } = await params;
  await requireMember(id, user.id);

  const url = new URL(req.url);
  const filter = taskFilterSchema.parse({
    status: url.searchParams.get("status") ?? undefined,
    assignee: url.searchParams.get("assignee") ?? undefined,
    overdue: url.searchParams.get("overdue") ?? undefined,
  });

  const where: Prisma.TaskWhereInput = { projectId: id };
  if (filter.status) where.status = filter.status;
  if (filter.assignee === "me") where.assigneeId = user.id;
  if (filter.overdue) {
    where.dueDate = { lt: new Date() };
    where.status = { not: "DONE" };
  }

  const tasks = await prisma.task.findMany({
    where,
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
      createdAt: true,
      updatedAt: true,
      assignee: { select: { id: true, name: true, email: true } },
      createdBy: { select: { id: true, name: true } },
    },
  });

  return ok({ tasks });
});

export const POST = withErrorHandler(async (req: Request, { params }: Ctx) => {
  const user = await requireUser();
  const { id } = await params;
  await requireMember(id, user.id);

  const body = await readJson(req);
  const data = taskCreateSchema.parse(body);

  if (data.assigneeId) {
    const m = await prisma.projectMember.findUnique({
      where: {
        projectId_userId: { projectId: id, userId: data.assigneeId },
      },
      select: { id: true },
    });
    if (!m) throw BadRequest("Assignee must be a project member");
  }

  const task = await prisma.task.create({
    data: {
      projectId: id,
      title: data.title,
      description: data.description,
      status: data.status,
      priority: data.priority,
      dueDate: data.dueDate,
      assigneeId: data.assigneeId,
      createdById: user.id,
    },
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
  });

  return created({ task });
});
