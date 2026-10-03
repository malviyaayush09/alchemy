import { brand } from "@/config/brand";
import { env, isDbConfigured } from "@/lib/env";
import { rateLimit } from "@/lib/http";
import { sha256Hex } from "@/lib/tokens";
import { emailStaff } from "./staff";

type Where = { path: string; method: string; routeType: string; routePath: string };

/**
 * Email staff about a server error. Deliberately contains no customer data:
 * just what broke and where. Throttled to one email per error per hour.
 */
export async function reportServerError(err: unknown, where: Where) {
  const e = err instanceof Error ? err : new Error(String(err));
  const digest = (err as { digest?: string })?.digest;
  console.error(`[server-error] ${where.method} ${where.path}`, e);

  // Not-found / redirect "errors" are normal control flow in Next.js.
  if (digest?.startsWith("NEXT_") || /NEXT_(NOT_FOUND|REDIRECT|HTTP_ERROR)/.test(e.message)) return;
  if (!env.resendApiKey || !isDbConfigured()) return;

  const signature = sha256Hex(`${where.routePath}|${e.name}|${e.message.slice(0, 200)}`).slice(0, 24);
  if (!(await rateLimit(`err:${signature}`, 3600, 1))) return;

  const stack = (e.stack ?? "").split("\n").slice(0, 8).join("\n");
  const subject = `⚠ ${brand.name} site error: ${where.method} ${where.routePath}`;
  const text = [
    `A server error happened on ${env.siteUrl}.`,
    "",
    `Route:   ${where.method} ${where.path}  (${where.routeType}: ${where.routePath})`,
    `Error:   ${e.name}: ${e.message}`,
    digest ? `Digest:  ${digest}` : "",
    `Time:    ${new Date().toISOString()}`,
    "",
    stack,
    "",
    "You'll get at most one email per hour for this same error. Check the server logs for full details.",
  ]
    .filter(Boolean)
    .join("\n");
  const html = `<pre style="font-family:Menlo,Consolas,monospace;font-size:13px;white-space:pre-wrap">${text.replace(/[&<>]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;" })[c]!)}</pre>`;
  await emailStaff(subject, text, html);
}
