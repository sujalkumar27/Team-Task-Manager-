import { prisma } from "@/lib/db";
import { hashPassword, setSessionCookie } from "@/lib/auth";
import { signupSchema } from "@/lib/validation";
import {
  Conflict,
  created,
  readJson,
  withErrorHandler,
} from "@/lib/api-helpers";

export const POST = withErrorHandler(async (req: Request) => {
  const body = await readJson(req);
  const { email, password, name } = signupSchema.parse(body);

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) throw Conflict("An account with this email already exists");

  const passwordHash = await hashPassword(password);
  const user = await prisma.user.create({
    data: { email, passwordHash, name },
    select: { id: true, email: true, name: true, createdAt: true },
  });

  await setSessionCookie({ userId: user.id, email: user.email });
  return created({ user });
});
