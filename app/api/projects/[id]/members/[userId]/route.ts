import { prisma } from "@/lib/db";
import { requireAdmin, requireUser } from "@/lib/permissions";
import { memberUpdateSchema } from "@/lib/validation";
import {
  BadRequest,
  NotFound,
  noContent,
  ok,
  readJson,
  withErrorHandler,
} from "@/lib/api-helpers";

type Ctx = { params: Promise<{ id: string; userId: string }> };

async function ensureNotLastAdminAfterChange(
  projectId: string,
  targetUserId: string,
  newState: "removed" | "demoted"
) {
  const target = await prisma.projectMember.findUnique({
    where: { projectId_userId: { projectId, userId: targetUserId } },
    select: { role: true },
  });
  if (!target) throw NotFound("Member not found");

  if (target.role !== "ADMIN") return target;

  const adminCount = await prisma.projectMember.count({
    where: { projectId, role: "ADMIN" },
  });
  if (adminCount <= 1) {
    throw BadRequest(
      newState === "removed"
        ? "You can't remove the last admin. Promote another member to admin first."
        : "You can't demote the last admin. Promote another member to admin first."
    );
  }
  return target;
}

export const PATCH = withErrorHandler(async (req: Request, { params }: Ctx) => {
  const me = await requireUser();
  const { id, userId } = await params;
  await requireAdmin(id, me.id);

  const body = await readJson(req);
  const { role } = memberUpdateSchema.parse(body);

  if (role === "MEMBER") {
    await ensureNotLastAdminAfterChange(id, userId, "demoted");
  } else {
    const target = await prisma.projectMember.findUnique({
      where: { projectId_userId: { projectId: id, userId } },
      select: { id: true },
    });
    if (!target) throw NotFound("Member not found");
  }

  const member = await prisma.projectMember.update({
    where: { projectId_userId: { projectId: id, userId } },
    data: { role },
    select: {
      id: true,
      role: true,
      joinedAt: true,
      user: { select: { id: true, name: true, email: true } },
    },
  });

  return ok({ member });
});

export const DELETE = withErrorHandler(
  async (_req: Request, { params }: Ctx) => {
    const me = await requireUser();
    const { id, userId } = await params;
    await requireAdmin(id, me.id);

    await ensureNotLastAdminAfterChange(id, userId, "removed");

    await prisma.projectMember.delete({
      where: { projectId_userId: { projectId: id, userId } },
    });

    return noContent();
  }
);
