import { prisma } from "@/lib/db";
import {
  requireAdmin,
  requireMember,
  requireUser,
} from "@/lib/permissions";
import { memberAddSchema } from "@/lib/validation";
import {
  Conflict,
  NotFound,
  created,
  ok,
  readJson,
  withErrorHandler,
} from "@/lib/api-helpers";

type Ctx = { params: Promise<{ id: string }> };

export const GET = withErrorHandler(async (_req: Request, { params }: Ctx) => {
  const user = await requireUser();
  const { id } = await params;
  await requireMember(id, user.id);

  const members = await prisma.projectMember.findMany({
    where: { projectId: id },
    orderBy: [{ role: "asc" }, { joinedAt: "asc" }],
    select: {
      id: true,
      role: true,
      joinedAt: true,
      user: { select: { id: true, name: true, email: true } },
    },
  });

  return ok({ members });
});

export const POST = withErrorHandler(async (req: Request, { params }: Ctx) => {
  const user = await requireUser();
  const { id } = await params;
  await requireAdmin(id, user.id);

  const body = await readJson(req);
  const { email, role } = memberAddSchema.parse(body);

  const target = await prisma.user.findUnique({
    where: { email },
    select: { id: true, name: true, email: true },
  });
  if (!target) {
    throw NotFound(
      "No user with that email is registered. Ask them to sign up first."
    );
  }

  const existing = await prisma.projectMember.findUnique({
    where: { projectId_userId: { projectId: id, userId: target.id } },
    select: { id: true },
  });
  if (existing) throw Conflict("That user is already a member");

  const member = await prisma.projectMember.create({
    data: { projectId: id, userId: target.id, role },
    select: {
      id: true,
      role: true,
      joinedAt: true,
      user: { select: { id: true, name: true, email: true } },
    },
  });

  return created({ member });
});
