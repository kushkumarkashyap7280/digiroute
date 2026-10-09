/**
 * POST /api/dev/bootstrap-super-admin   (local development only — see lib/adminBootstrap.ts)
 * Body: { token, name, email, password, confirmDatabase?, reset? }
 *
 * Creates THE super admin, or (reset: true) sets a new password for the existing
 * one. Any failed gate answers 404, exactly like a route that doesn't exist.
 */

import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { connectDB } from "@/lib/mongoose";
import { bootstrapEnabled, describeDatabase, isLocalHost, tokenMatches } from "@/lib/adminBootstrap";
import { validateAdminPassword } from "@/lib/passwords";
import { checkRateLimit, clientIp, rateLimitExceeded } from "@/lib/rateLimit";
import { audit } from "@/lib/audit";
import Admin from "@/models/Admin";

const gone = () => new NextResponse(null, { status: 404 });
const json = (body: unknown, status = 200) =>
  NextResponse.json(body, { status, headers: { "Cache-Control": "no-store" } });

export async function POST(req: NextRequest) {
  if (!bootstrapEnabled() || !isLocalHost(req.headers.get("host"))) return gone();

  const body = await req.json().catch(() => ({}));

  // Guessing the token is rate limited (only wrong guesses count).
  const key = `bootstrap:${clientIp(req)}`;
  if ((await rateLimitExceeded(key, 5, 60 * 60)).exceeded) return gone();
  if (!tokenMatches(body.token)) {
    await checkRateLimit(key, 5, 60 * 60);
    return gone();
  }

  // Writing to a remote database needs its name typed back, like the old CLI did.
  const db = describeDatabase();
  if (!db.local && String(body.confirmDatabase ?? "") !== db.name)
    return json({ error: `This is a REMOTE database. Type its name ("${db.name}") to confirm.` }, 400);

  const problem = validateAdminPassword(body.password);
  if (problem) return json({ error: problem }, 400);

  await connectDB();
  const existing = await Admin.findOne({ role: "super" });

  if (body.reset === true) {
    if (!existing) return json({ error: "There is no super admin to reset." }, 404);
    existing.passwordHash = await bcrypt.hash(body.password, 12);
    existing.mustChangePassword = false;
    existing.failedLogins = 0;
    existing.lockedUntil = null;
    existing.status = "active";
    existing.sessionVersion += 1; // signs out every existing session
    await existing.save();
    await audit(existing, "super.password-reset-bootstrap", { req });
    return json({ ok: true, email: existing.email, reset: true });
  }

  if (existing)
    return json({ error: `A super admin already exists (${existing.email}). There can only be one.` }, 409);

  const name = String(body.name ?? "").trim();
  const email = String(body.email ?? "").trim().toLowerCase();
  if (name.length < 2 || name.length > 60) return json({ error: "Name must be 2–60 characters." }, 400);
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 200)
    return json({ error: "Enter a valid email address." }, 400);
  if (await Admin.findOne({ email })) return json({ error: "An admin with that email already exists." }, 409);

  const admin = await Admin.create({
    name,
    email,
    role: "super",
    passwordHash: await bcrypt.hash(body.password, 12),
    mustChangePassword: false,
  });
  await audit(admin, "super.bootstrap", { req });
  return json({ ok: true, email: admin.email }, 201);
}
