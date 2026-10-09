"use client";

/** Thin fetch wrapper for /api/admin/*: adds the CSRF header, parses errors. */

export class AdminApiError extends Error {
  status: number;
  code?: string;
  constructor(message: string, status: number, code?: string) {
    super(message);
    this.status = status;
    this.code = code;
  }
}

export async function adminFetch<T = unknown>(
  path: string,
  opts: { method?: string; body?: unknown } = {}
): Promise<T> {
  const res = await fetch(`/api/admin${path}`, {
    method: opts.method ?? "GET",
    headers: { "Content-Type": "application/json", "x-admin-request": "1" },
    body: opts.body === undefined ? undefined : JSON.stringify(opts.body),
    credentials: "same-origin",
    cache: "no-store",
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    if (res.status === 401 && typeof window !== "undefined" && !path.startsWith("/auth/login")) {
      // Session ended: a full page load (not a client navigation) drops any admin data in memory.
      // eslint-disable-next-line @next/next/no-location-assign-relative-destination
      window.location.assign("/");
    }
    if (data?.code === "password_change_required" && typeof window !== "undefined") {
      // eslint-disable-next-line @next/next/no-location-assign-relative-destination
      window.location.assign("/admin/account");
    }
    throw new AdminApiError(data?.error ?? "Something went wrong.", res.status, data?.code);
  }
  return data as T;
}
