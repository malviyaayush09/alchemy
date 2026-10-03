import type { Instrumentation } from "next";

/**
 * Runs whenever a server request (page, route handler, server action) throws.
 * Emails the alert addresses from Admin → Settings, at most once per hour per
 * distinct error, so a crash loop can't flood the inbox.
 */
export const onRequestError: Instrumentation.onRequestError = async (err, request, context) => {
  if (process.env.NEXT_RUNTIME !== "nodejs") return;
  try {
    const { reportServerError } = await import("@/lib/notify/errors");
    await reportServerError(err, { path: request.path, method: request.method, routeType: context.routeType, routePath: context.routePath });
  } catch (e) {
    console.error("[error-alert] could not report", e);
  }
};
