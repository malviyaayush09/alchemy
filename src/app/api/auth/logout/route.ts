import { destroySession } from "@/lib/auth/session";
import { fail, json, sameOrigin } from "@/lib/http";

export async function POST(req: Request) {
  if (!sameOrigin(req)) return fail(403, "Forbidden");
  await destroySession();
  return json({ ok: true });
}
