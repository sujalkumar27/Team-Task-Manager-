import { prisma } from "@/lib/db";
import {
  loadTaskWithAccess,
  requireUser,
} from "@/lib/permissions";
import { taskUpdateSchema } from "@/lib/validation";
import {
  BadRequest,
  Forbidden,
  noContent,
  ok,
  readJson,
  withErrorHandler,
} from "@/lib/api-helpers";

type Ctx = { params: Promise<{ id: string }> };

export const GET = withErrorHandler(async (_req: Request, { params }: Ctx) => {
  const user = await requireUser();
  const { id } = await params;
  const { task, canEdit, canDelete, role } = await loadTaskWithAccess(
    id,
    user.id
  );

  const full = await prisma.task.findUnique({
    where: { id: task.id },
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
      project: { select: { id: true, name: true } },
      assignee: { select: { id: true, name: true, email: true } },
      createdBy: { select: { id: true, name: true } },
    },
  });

  return ok({ task: full, role, canEdit, canDelete });
});

export const PATCH = withErrorHandler(async (req: Request, { params }: Ctx) => {
  const user = await requireUser();
  const { id } = await params;
  const { task, canEdit } = await loadTaskWithAccess(id, user.id);
  if (!canEdit) {
    throw Forbidden(
      "Only project admins, the assignee, or the task creator can edit"
    );
  }

  const body = await readJson(req);
  const data = taskUpdateSchema.parse(body);

  if (data.assigneeId) {
    const m = await prisma.projectMember.findUnique({
      where: {
        projectId_userId: {
          projectId: task.projectId,
          userId: data.assigneeId,
        },
      },
      select: { id: true },
    });
    if (!m) throw BadRequest("Assignee must be a project member");
  }

  const updateData: Record<string, unknown> = {};
  for (const k of [
    "title",
    "description",
    "status",
    "priority",
    "dueDate",
    "assigneeId",
  ] as const) {
    if (data[k] !== undefined) updateData[k] = data[k];
  }

  const updated = await prisma.task.update({
    where: { id },
    data: updateData,
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

  return ok({ task: updated });
});

export const DELETE = withErrorHandler(
  async (_req: Request, { params }: Ctx) => {
    const user = await requireUser();
    const { id } = await params;
    const { canDelete } = await loadTaskWithAccess(id, user.id);
    if (!canDelete) {
      throw Forbidden(
        "Only project admins or the task creator can delete this task"
      );
    }
    await prisma.task.delete({ where: { id } });
    return noContent();
  }
);
