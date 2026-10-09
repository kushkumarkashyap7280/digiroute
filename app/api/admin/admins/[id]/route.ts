/**
 * PATCH  /api/admin/admins/[id]   super only — { status?: "active"|"disabled", name? }
 * DELETE /api/admin/admins/[id]   super only
 * The super admin can't be modified or deleted through the API, and you can't
 * act on yourself here.
 */

import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import { connectDB } from "@/lib/mongoose";
import { adminProfile, requireAdmin } from "@/lib/adminAuth";
import { audit } from "@/lib/audit";
import Admin from "@/models/Admin";

type Ctx = { params: Promise<{ id: string }> };
const NO_STORE = { "Cache-Control": "no-store" };

async function loadTarget(id: string, me: { _id: unknown }) {
  if (!mongoose.Types.ObjectId.isValid(id)) return { error: NextResponse.json({ error: "Admin not found." }, { status: 404 }) };
  await connectDB();
  const target = await Admin.findById(id);
  if (!target) return { error: NextResponse.json({ error: "Admin not found." }, { status: 404 }) };
  if (target.role === "super" || String(target._id) === String(me._id))
    return { error: NextResponse.json({ error: "This account can't be changed here." }, { status: 403 }) };
  return { target };
}

export async function PATCH(req: NextRequest, { params }: Ctx) {
  const guard = await requireAdmin(req, { superOnly: true });
  if (guard.error) return guard.error;
  const t = await loadTarget((await params).id, guard.admin);
  if (t.error) return t.error;
  const target = t.target;

  const body = await req.json().catch(() => ({}));
  const meta: Record<string, unknown> = { email: target.email };
  let action = "admin.update";

  if (body.status !== undefined) {
    if (body.status !== "active" && body.status !== "disabled")
      return NextResponse.json({ error: 'status must be "active" or "disabled".' }, { status: 400 });
    target.status = body.status;
    if (body.status === "disabled") target.sessionVersion += 1; // kick out now
    action = body.status === "disabled" ? "admin.disable" : "admin.enable";
    meta.status = body.status;
  }
  if (body.name !== undefined) {
    const name = String(body.name).trim();
    if (name.length < 2 || name.length > 60)
      return NextResponse.json({ error: "Name must be 2–60 characters." }, { status: 400 });
    target.name = name;
    meta.name = name;
  }
  await target.save();
  await audit(guard.admin, action, { req, targetType: "admin", targetId: String(target._id), meta });
  return NextResponse.json({ admin: adminProfile(target) }, { headers: NO_STORE });
}

export async function DELETE(req: NextRequest, { params }: Ctx) {
  const guard = await requireAdmin(req, { superOnly: true });
  if (guard.error) return guard.error;
  const t = await loadTarget((await params).id, guard.admin);
  if (t.error) return t.error;

  await t.target.deleteOne();
  await audit(guard.admin, "admin.delete", { req, targetType: "admin", targetId: String(t.target._id), meta: { email: t.target.email } });
  return NextResponse.json({ ok: true }, { headers: NO_STORE });
}
