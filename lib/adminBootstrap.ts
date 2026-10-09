/**
 * Gate for the one-time "create the super admin" setup page/route.
 *
 * Meant to be used from YOUR OWN machine while running `next dev` (with the
 * database URI you want the admin in, even the production one, temporarily in
 * .env.local). It must be unusable on a deployed site, so it fails closed:
 *
 *   1. NODE_ENV is exactly "development" — Next.js forces "production" for every
 *      build and deployment (production AND preview), so a deployed site never
 *      passes this check;
 *   2. not running on Vercel or CI;
 *   3. the request is addressed to localhost.
 *
 * Anything else answers with a bare 404, as if the route did not exist.
 */

/** Checks 1 and 2: the environment is a developer's machine. */
export function bootstrapEnabled(): boolean {
  return (
    process.env.NODE_ENV === "development" &&
    !process.env.VERCEL &&
    !process.env.VERCEL_ENV &&
    !process.env.CI
  );
}

/** Check 3: the Host header names this machine. */
export function isLocalHost(hostHeader: string | null | undefined): boolean {
  if (!hostHeader) return false;
  const host = hostHeader.startsWith("[") ? hostHeader.slice(0, hostHeader.indexOf("]") + 1) : hostHeader.split(":")[0];
  return host === "localhost" || host === "127.0.0.1" || host === "[::1]";
}

/** Where the configured MONGODB_URI points — shown on the setup page. */
export function describeDatabase(): { host: string; name: string; local: boolean } {
  try {
    const url = new URL(process.env.MONGODB_URI ?? "");
    const name = url.pathname.replace(/^\//, "") || "(default)";
    return { host: url.host, name, local: /^(localhost|127\.0\.0\.1|\[::1\])(:|$)/.test(url.host) };
  } catch {
    return { host: "unknown", name: "(unknown)", local: false };
  }
}
