import { prisma } from "@/lib/db";
import { comparePassword, setSessionCookie } from "@/lib/auth";
import { loginSchema } from "@/lib/validation";
import { Unauthorized, ok, readJson, withErrorHandler } from "@/lib/api-helpers";

export const POST = withErrorHandler(async (req: Request) => {
  const body = await readJson(req);
  const { email, password } = loginSchema.parse(body);

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) throw Unauthorized("Invalid email or password");

  const matches = await comparePassword(password, user.passwordHash);
  if (!matches) throw Unauthorized("Invalid email or password");

  await setSessionCookie({ userId: user.id, email: user.email });
  return ok({
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      createdAt: user.createdAt,
    },
  });
});
