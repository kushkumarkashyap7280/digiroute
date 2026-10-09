/**
 * Admin sessions.
 *
 * Separate from user sessions on purpose: a different collection (Admin), a
 * different cookie and signing key (`…:admin`), a different JWT audience, an
 * 8-hour lifetime, SameSite=Strict, and a DB check on EVERY request so
 * disabling an admin or changing their password signs them out immediately.
 */

import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import { SignJWT, jwtVerify } from "jose";
import { connectDB } from "@/lib/mongoose";
import { loadSecret } from "@/lib/session";
import Admin, { IAdmin } from "@/models/Admin";

const PROD = process.env.NODE_ENV === "production";
// `__Host-` pins the cookie to this exact host over HTTPS (no subdomain tricks).
export const ADMIN_COOKIE = PROD ? "__Host-digiroute_admin" : "digiroute_admin";
export const ADMIN_SESSION_SEC = 8 * 60 * 60;
const AUDIENCE = "digiroute-admin";

const KEY = new TextEncoder().encode(`${process.env.ADMIN_SESSION_SECRET ?? loadSecret()}:admin`);

export async function signAdminToken(admin: IAdmin): Promise<string> {
  return new SignJWT({ aid: String(admin._id), role: admin.role, sv: admin.sessionVersion })
    .setProtectedHeader({ alg: "HS256" })
    .setAudience(AUDIENCE)
    .setIssuedAt()
    .setExpirationTime(`${ADMIN_SESSION_SEC}s`)
    .sign(KEY);
}

export async function setAdminCookie(token: string) {
  const store = await cookies();
  store.set(ADMIN_COOKIE, token, {
    httpOnly: true,
    secure: PROD,
    sameSite: "strict",
    path: "/",
    maxAge: ADMIN_SESSION_SEC,
  });
}

export async function clearAdminCookie() {
  const store = await cookies();
  store.delete(ADMIN_COOKIE);
}

/** Verifies the token AND re-reads the admin: must exist, be active and not revoked. */
async function adminFromToken(token: string | undefined): Promise<IAdmin | null> {
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, KEY, { audience: AUDIENCE });
    await connectDB();
    const admin = await Admin.findById(payload.aid as string);
    if (!admin || admin.status !== "active") return null;
    if ((payload.sv as number) !== admin.sessionVersion) return null;
    return admin;
  } catch {
    return null;
  }
}

/** For route handlers. */
export function getAdminFromRequest(req: NextRequest) {
  return adminFromToken(req.cookies.get(ADMIN_COOKIE)?.value);
}

/** For server components / layouts. */
export async function getAdminFromCookies() {
  const store = await cookies();
  return adminFromToken(store.get(ADMIN_COOKIE)?.value);
}

/**
 * CSRF defence on top of SameSite=Strict: state-changing requests must carry a
 * custom header (a cross-site form/link can't set one) and, when the browser
 * sends an Origin, it must be our own host.
 */
export function sameSiteRequestOk(req: NextRequest): boolean {
  if (req.method === "GET" || req.method === "HEAD") return true;
  if (req.headers.get("x-admin-request") !== "1") return false;
  const origin = req.headers.get("origin");
  if (!origin) return true;
  try {
    return new URL(origin).host === req.headers.get("host");
  } catch {
    return false;
  }
}

type Guard = { admin: IAdmin; error?: undefined } | { admin?: undefined; error: NextResponse };

const NO_STORE = { "Cache-Control": "no-store" };
const deny = (status: number, message: string, code?: string) =>
  NextResponse.json({ error: message, code }, { status, headers: NO_STORE });

/**
 * Gate for every /api/admin/* handler.
 *  superOnly            — only the super admin
 *  allowPendingPassword — let an admin who must change their password through
 *                         (only the password-change / me / logout routes use it)
 */
export async function requireAdmin(
  req: NextRequest,
  opts: { superOnly?: boolean; allowPendingPassword?: boolean } = {}
): Promise<Guard> {
  if (!sameSiteRequestOk(req)) return { error: deny(403, "Request blocked.") };

  const admin = await getAdminFromRequest(req);
  if (!admin) return { error: deny(401, "Not signed in.") };

  if (admin.mustChangePassword && !opts.allowPendingPassword)
    return { error: deny(403, "You must set a new password first.", "password_change_required") };

  if (opts.superOnly && admin.role !== "super")
    return { error: deny(403, "Only the super admin can do this.") };

  return { admin };
}

export function adminProfile(admin: IAdmin) {
  return {
    id: String(admin._id),
    name: admin.name,
    email: admin.email,
    role: admin.role,
    status: admin.status,
    mustChangePassword: admin.mustChangePassword,
    lastLoginAt: admin.lastLoginAt ?? null,
    createdAt: admin.createdAt,
  };
}
