/**
 * Gate for the one-time "create the super admin" setup route/page.
 *
 * It is meant to be used from YOUR OWN machine, running `next dev`, with the
 * database URI (even the production one) temporarily in .env.local. It must be
 * impossible to use on a deployed site, so it fails closed and needs ALL of:
 *
 *   1. NODE_ENV is exactly "development"  (production, preview, test, unset → denied)
 *   2. not running on Vercel / CI
 *   3. the request is addressed to localhost
 *   4. SUPER_ADMIN_BOOTSTRAP_TOKEN is set (24+ chars) AND sent with the request.
 *      The token lives only in your local .env.local — the deployed environment
 *      never has it, so the route is permanently off there.
 *
 * Callers answer a failed gate with a bare 404 (no hint that it exists).
 */

import crypto from "crypto";

const MIN_TOKEN_LEN = 24;

/** Environment-level switch (checks 1, 2 and the token being configured at all). */
export function bootstrapEnabled(): boolean {
  return (
    process.env.NODE_ENV === "development" &&
    !process.env.VERCEL &&
    !process.env.VERCEL_ENV &&
    !process.env.CI &&
    (process.env.SUPER_ADMIN_BOOTSTRAP_TOKEN ?? "").length >= MIN_TOKEN_LEN
  );
}

/** Check 3: Host header names this machine. (Not proof on its own — the token is.) */
export function isLocalHost(hostHeader: string | null | undefined): boolean {
  if (!hostHeader) return false;
  const host = hostHeader.startsWith("[") ? hostHeader.slice(0, hostHeader.indexOf("]") + 1) : hostHeader.split(":")[0];
  return host === "localhost" || host === "127.0.0.1" || host === "[::1]";
}

/** Constant-time comparison of the supplied token with the configured one. */
export function tokenMatches(given: unknown): boolean {
  const expected = process.env.SUPER_ADMIN_BOOTSTRAP_TOKEN ?? "";
  if (typeof given !== "string" || expected.length < MIN_TOKEN_LEN) return false;
  const a = crypto.createHash("sha256").update(given).digest();
  const b = crypto.createHash("sha256").update(expected).digest();
  return crypto.timingSafeEqual(a, b);
}

/** Where the configured MONGODB_URI points — shown to you before anything is written. */
export function describeDatabase(): { host: string; name: string; local: boolean } {
  try {
    const url = new URL(process.env.MONGODB_URI ?? "");
    const name = url.pathname.replace(/^\//, "") || "(default)";
    return { host: url.host, name, local: /^(localhost|127\.0\.0\.1|\[::1\])(:|$)/.test(url.host) };
  } catch {
    return { host: "unknown", name: "(unknown)", local: false };
  }
}
