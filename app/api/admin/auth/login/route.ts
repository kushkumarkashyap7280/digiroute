/**
 * POST /api/admin/auth/login  { email, password }
 *
 * Hard to brute-force and hard to probe:
 *  - rate limited per IP+email and per IP,
 *  - the account locks for 30 minutes after 8 wrong passwords,
 *  - a password is always checked (against a dummy hash if the email is
 *    unknown) so response time doesn't reveal which emails are admins,
 *  - the same generic error for unknown / wrong / disabled.
 */

import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import bcrypt from "bcryptjs";
import { connectDB } from "@/lib/mongoose";
import Admin from "@/models/Admin";
import { audit } from "@/lib/audit";
import { adminProfile, sameSiteRequestOk, setAdminCookie, signAdminToken } from "@/lib/adminAuth";
import { checkRateLimit, clientIp, rateLimitExceeded, tooManyRequests } from "@/lib/rateLimit";

const NO_STORE = { "Cache-Control": "no-store" };
const MAX_FAILS = 8;
const LOCK_MS = 30 * 60 * 1000;
// A real bcrypt hash of a random string: gives unknown emails the same compare cost.
const DUMMY_HASH = bcrypt.hashSync(crypto.randomBytes(16).toString("hex"), 12);

const invalid = () =>
  NextResponse.json({ error: "Invalid email or password." }, { status: 401, headers: NO_STORE });

export async function POST(req: NextRequest) {
  if (!sameSiteRequestOk(req))
    return NextResponse.json({ error: "Request blocked." }, { status: 403, headers: NO_STORE });

  const body = await req.json().catch(() => ({}));
  const email = String(body.email ?? "").trim().toLowerCase().slice(0, 200);
  const password = String(body.password ?? "").slice(0, 200);
  if (!email || !password) return invalid();

  // Only FAILED attempts count, so normal sign-ins never lock anyone out.
  const ip = clientIp(req);
  const acctKey = `admin-login:${ip}:${email}`;
  const ipKey = `admin-login-ip:${ip}`;
  const perAccount = await rateLimitExceeded(acctKey, 5, 15 * 60);
  if (perAccount.exceeded) return tooManyRequests(perAccount.retryAfterSec);
  const perIp = await rateLimitExceeded(ipKey, 20, 15 * 60);
  if (perIp.exceeded) return tooManyRequests(perIp.retryAfterSec);

  await connectDB();
  const admin = await Admin.findOne({ email });

  if (admin?.lockedUntil && admin.lockedUntil > new Date()) {
    await bcrypt.compare(password, DUMMY_HASH);
    await audit(admin, "login.locked", { req });
    return NextResponse.json(
      { error: "Too many failed attempts. Try again later." },
      { status: 429, headers: NO_STORE }
    );
  }

  const ok = await bcrypt.compare(password, admin?.passwordHash ?? DUMMY_HASH);

  if (!admin || !ok || admin.status !== "active") {
    await checkRateLimit(acctKey, 5, 15 * 60); // record the failure
    await checkRateLimit(ipKey, 20, 15 * 60);
    if (admin && !ok) {
      admin.failedLogins = (admin.failedLogins ?? 0) + 1;
      if (admin.failedLogins >= MAX_FAILS) {
        admin.lockedUntil = new Date(Date.now() + LOCK_MS);
        admin.failedLogins = 0;
      }
      await admin.save();
    }
    await audit(admin ?? null, admin && admin.status !== "active" ? "login.blocked" : "login.failed", { req, email });
    return invalid();
  }

  admin.failedLogins = 0;
  admin.lockedUntil = null;
  admin.lastLoginAt = new Date();
  await admin.save();

  await setAdminCookie(await signAdminToken(admin));
  await audit(admin, "login.success", { req });
  return NextResponse.json({ admin: adminProfile(admin) }, { headers: NO_STORE });
}
