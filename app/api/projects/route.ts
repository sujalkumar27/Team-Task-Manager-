import { prisma } from "@/lib/db";
import { requireUser } from "@/lib/permissions";
import { projectCreateSchema } from "@/lib/validation";
import { created, ok, readJson, withErrorHandler } from "@/lib/api-helpers";

export const GET = withErrorHandler(async () => {
  const user = await requireUser();
  const memberships = await prisma.projectMember.findMany({
    where: { userId: user.id },
    orderBy: { project: { updatedAt: "desc" } },
    select: {
      role: true,
      joinedAt: true,
      project: {
        select: {
          id: true,
          name: true,
          description: true,
          createdAt: true,
          updatedAt: true,
          _count: { select: { tasks: true, members: true } },
        },
      },
    },
  });

  const projects = memberships.map((m) => ({
    id: m.project.id,
    name: m.project.name,
    description: m.project.description,
    createdAt: m.project.createdAt,
    updatedAt: m.project.updatedAt,
    role: m.role,
    taskCount: m.project._count.tasks,
    memberCount: m.project._count.members,
  }));

  return ok({ projects });
});

export const POST = withErrorHandler(async (req: Request) => {
  const user = await requireUser();
  const body = await readJson(req);
  const { name, description } = projectCreateSchema.parse(body);

  const project = await prisma.$transaction(async (tx) => {
    const p = await tx.project.create({
      data: {
        name,
        description: description ?? null,
        createdById: user.id,
      },
    });
    await tx.projectMember.create({
      data: { projectId: p.id, userId: user.id, role: "ADMIN" },
    });
    return p;
  });

  return created({ project });
});
