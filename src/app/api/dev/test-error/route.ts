import { currentUser, isStaff } from "@/lib/auth/session";
import { devToolsEnabled } from "@/lib/env";
import { fail } from "@/lib/http";

/**
 * DEV ONLY, staff only: throws on purpose so you can check that error-alert
 * emails arrive (Admin → Settings → Alert emails). 404 on a live deployment.
 */
export async function GET() {
  if (!devToolsEnabled()) return fail(404, "Not found");
  if (!isStaff(await currentUser())) return fail(404, "Not found");
  throw new Error("Test error: checking that error alerts reach the alert emails");
}
