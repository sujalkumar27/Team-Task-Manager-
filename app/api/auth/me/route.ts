import { getCurrentUser } from "@/lib/auth";
import { Unauthorized, ok, withErrorHandler } from "@/lib/api-helpers";

export const GET = withErrorHandler(async () => {
  const user = await getCurrentUser();
  if (!user) throw Unauthorized();
  return ok({ user });
});
