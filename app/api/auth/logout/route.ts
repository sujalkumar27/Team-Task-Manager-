import { clearSessionCookie } from "@/lib/auth";
import { noContent, withErrorHandler } from "@/lib/api-helpers";

export const POST = withErrorHandler(async () => {
  await clearSessionCookie();
  return noContent();
});
