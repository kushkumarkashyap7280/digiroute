/**
 * POST /api/admin/admins/[id]/reset-password   super only
 * Issues a new one-time temporary password for a sub-admin, signs out all their
 * sessions and forces them to choose their own at the next sign-in.
 */

import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import mongoose from "mongoose";
import { connectDB } from "@/lib/mongoose";
import { requireAdmin } from "@/lib/adminAuth";
import { audit } from "@/lib/audit";
import { generateTempPassword } from "@/lib/passwords";
import Admin from "@/models/Admin";

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const guard = await requireAdmin(req, { superOnly: true });
  if (guard.error) return guard.error;

  const { id } = await params;
  if (!mongoose.Types.ObjectId.isValid(id))
    return NextResponse.json({ error: "Admin not found." }, { status: 404 });
  await connectDB();
  const target = await Admin.findById(id);
  if (!target) return NextResponse.json({ error: "Admin not found." }, { status: 404 });
  if (target.role === "super" || String(target._id) === String(guard.admin._id))
    return NextResponse.json({ error: "Change your own password from Account settings." }, { status: 403 });

  const password = generateTempPassword();
  target.passwordHash = await bcrypt.hash(password, 12);
  target.mustChangePassword = true;
  target.sessionVersion += 1;
  target.failedLogins = 0;
  target.lockedUntil = null;
  await target.save();

  await audit(guard.admin, "admin.reset-password", { req, targetType: "admin", targetId: String(target._id), meta: { email: target.email } });
  return NextResponse.json({ ok: true, password, email: target.email }, { headers: { "Cache-Control": "no-store" } });
}
