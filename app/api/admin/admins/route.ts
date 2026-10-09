/**
 * GET  /api/admin/admins   super only — list admins
 * POST /api/admin/admins   super only — { name, email } creates a SUB-admin with a
 *      one-time temporary password (they must choose their own at first sign-in).
 * There is exactly one super admin (created by the CLI script); this route can
 * only ever create sub-admins.
 */

import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { connectDB } from "@/lib/mongoose";
import { adminProfile, requireAdmin } from "@/lib/adminAuth";
import { audit } from "@/lib/audit";
import { generateTempPassword } from "@/lib/passwords";
import Admin from "@/models/Admin";

const NO_STORE = { "Cache-Control": "no-store" };

export async function GET(req: NextRequest) {
  const guard = await requireAdmin(req, { superOnly: true });
  if (guard.error) return guard.error;
  await connectDB();
  const admins = await Admin.find().sort({ role: 1, createdAt: 1 });
  return NextResponse.json({ admins: admins.map(adminProfile) }, { headers: NO_STORE });
}

export async function POST(req: NextRequest) {
  const guard = await requireAdmin(req, { superOnly: true });
  if (guard.error) return guard.error;

  const body = await req.json().catch(() => ({}));
  const name = String(body.name ?? "").trim();
  const email = String(body.email ?? "").trim().toLowerCase();
  if (name.length < 2 || name.length > 60)
    return NextResponse.json({ error: "Name must be 2–60 characters." }, { status: 400 });
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 200)
    return NextResponse.json({ error: "Enter a valid email address." }, { status: 400 });

  await connectDB();
  if (await Admin.findOne({ email }))
    return NextResponse.json({ error: "An admin with that email already exists." }, { status: 409 });

  const password = generateTempPassword();
  const admin = await Admin.create({
    name,
    email,
    role: "sub", // never "super" from the API
    passwordHash: await bcrypt.hash(password, 12),
    mustChangePassword: true,
    createdBy: guard.admin._id,
  });
  await audit(guard.admin, "admin.create", { req, targetType: "admin", targetId: String(admin._id), meta: { email } });
  return NextResponse.json({ admin: adminProfile(admin), password }, { status: 201, headers: NO_STORE });
}
