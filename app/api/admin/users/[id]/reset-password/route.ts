/**
 * POST /api/admin/users/[id]/reset-password   super only
 * Body (optional): { newPassword } — otherwise a random temporary password is generated.
 * The password is returned ONCE so the super admin can pass it on. All the
 * user's existing sessions are signed out.
 */

import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import mongoose from "mongoose";
import { connectDB } from "@/lib/mongoose";
import { requireAdmin } from "@/lib/adminAuth";
import { audit } from "@/lib/audit";
import { generateTempPassword } from "@/lib/passwords";
import { forgetSessionCache } from "@/lib/session";
import User from "@/models/User";

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const guard = await requireAdmin(req, { superOnly: true });
  if (guard.error) return guard.error;

  const { id } = await params;
  if (!mongoose.Types.ObjectId.isValid(id))
    return NextResponse.json({ error: "User not found." }, { status: 404 });
  await connectDB();
  const user = await User.findById(id);
  if (!user) return NextResponse.json({ error: "User not found." }, { status: 404 });

  const body = await req.json().catch(() => ({}));
  let password: string;
  if (body.newPassword !== undefined) {
    password = String(body.newPassword);
    if (password.length < 8 || password.length > 128)
      return NextResponse.json({ error: "Password must be 8–128 characters." }, { status: 400 });
  } else {
    password = generateTempPassword();
  }

  user.passwordHash = await bcrypt.hash(password, 12);
  user.sessionVersion = (user.sessionVersion ?? 0) + 1;
  await user.save();
  forgetSessionCache(String(user._id));

  await audit(guard.admin, "user.reset-password", {
    req, targetType: "user", targetId: String(user._id), meta: { email: user.email },
  });
  return NextResponse.json({ ok: true, password, email: user.email }, { headers: { "Cache-Control": "no-store" } });
}
