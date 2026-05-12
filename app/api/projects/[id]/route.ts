import { prisma } from "@/lib/db";
import { requireAdmin, requireMember, requireUser } from "@/lib/permissions";
import { projectUpdateSchema } from "@/lib/validation";
import {
  BadRequest,
  noContent,
  ok,
  readJson,
  withErrorHandler,
} from "@/lib/api-helpers";

type Ctx = { params: Promise<{ id: string }> };

export const GET = withErrorHandler(async (_req: Request, { params }: Ctx) => {
  const user = await requireUser();
  const { id } = await params;
  const membership = await requireMember(id, user.id);

  const project = await prisma.project.findUnique({
    where: { id },
    select: {
      id: true,
      name: true,
      description: true,
      createdAt: true,
      updatedAt: true,
      createdById: true,
      _count: { select: { tasks: true, members: true } },
    },
  });

  return ok({ project, role: membership.role });
});

export const PATCH = withErrorHandler(async (req: Request, { params }: Ctx) => {
  const user = await requireUser();
  const { id } = await params;
  await requireAdmin(id, user.id);

  const body = await readJson(req);
  const data = projectUpdateSchema.parse(body);
  if (Object.keys(data).length === 0) {
    throw BadRequest("No fields to update");
  }

  const project = await prisma.project.update({
    where: { id },
    data: {
      ...(data.name !== undefined ? { name: data.name } : {}),
      ...(data.description !== undefined
        ? { description: data.description }
        : {}),
    },
  });

  return ok({ project });
});

export const DELETE = withErrorHandler(
  async (_req: Request, { params }: Ctx) => {
    const user = await requireUser();
    const { id } = await params;
    await requireAdmin(id, user.id);
    await prisma.project.delete({ where: { id } });
    return noContent();
  }
);
