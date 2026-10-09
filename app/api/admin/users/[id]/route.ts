/**
 * GET    /api/admin/users/[id]   any admin   — profile + counts (no card contents)
 * PATCH  /api/admin/users/[id]   super only  — { status: "active" | "suspended", name? }
 * DELETE /api/admin/users/[id]   super only  — { confirmEmail } deletes the user and ALL their data
 */

import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import { connectDB } from "@/lib/mongoose";
import { requireAdmin } from "@/lib/adminAuth";
import { audit } from "@/lib/audit";
import { deleteUserAndData } from "@/lib/accountDeletion";
import { forgetSessionCache } from "@/lib/session";
import User from "@/models/User";
import AddressCard from "@/models/AddressCard";

type Ctx = { params: Promise<{ id: string }> };
const NO_STORE = { "Cache-Control": "no-store" };
const notFound = () => NextResponse.json({ error: "User not found." }, { status: 404 });

async function loadUser(id: string) {
  if (!mongoose.Types.ObjectId.isValid(id)) return null;
  await connectDB();
  return User.findById(id);
}

export async function GET(req: NextRequest, { params }: Ctx) {
  const guard = await requireAdmin(req);
  if (guard.error) return guard.error;
  const user = await loadUser((await params).id);
  if (!user) return notFound();

  const [cards, favorites, sharedOff, views] = await Promise.all([
    AddressCard.countDocuments({ ownerId: user._id }),
    AddressCard.countDocuments({ ownerId: user._id, isFavorite: true }),
    AddressCard.countDocuments({ ownerId: user._id, sharingEnabled: false }),
    AddressCard.aggregate([{ $match: { ownerId: user._id } }, { $group: { _id: null, n: { $sum: { $ifNull: ["$viewCount", 0] } } } }]),
  ]);

  return NextResponse.json(
    {
      user: {
        id: String(user._id),
        name: user.name,
        email: user.email,
        status: user.status ?? "active",
        avatarUrl: user.avatarUrl ?? "",
        createdAt: user.createdAt,
        lastLoginAt: user.lastLoginAt ?? null,
      },
      stats: { cards, favorites, sharingOff: sharedOff, linkViews: views[0]?.n ?? 0 },
    },
    { headers: NO_STORE }
  );
}

export async function PATCH(req: NextRequest, { params }: Ctx) {
  const guard = await requireAdmin(req, { superOnly: true });
  if (guard.error) return guard.error;
  const user = await loadUser((await params).id);
  if (!user) return notFound();

  const body = await req.json().catch(() => ({}));
  const changes: Record<string, unknown> = {};

  if (body.status !== undefined) {
    if (body.status !== "active" && body.status !== "suspended")
      return NextResponse.json({ error: 'status must be "active" or "suspended".' }, { status: 400 });
    if (body.status !== user.status) {
      user.status = body.status;
      if (body.status === "suspended") user.sessionVersion = (user.sessionVersion ?? 0) + 1; // sign them out
      changes.status = body.status;
    }
  }
  if (body.name !== undefined) {
    const name = String(body.name).trim();
    if (name.length < 2 || name.length > 60)
      return NextResponse.json({ error: "Name must be 2–60 characters." }, { status: 400 });
    user.name = name;
    changes.name = name;
  }
  if (Object.keys(changes).length === 0)
    return NextResponse.json({ error: "Nothing to change." }, { status: 400 });

  await user.save();
  forgetSessionCache(String(user._id));
  await audit(guard.admin, changes.status ? `user.${changes.status === "suspended" ? "suspend" : "reactivate"}` : "user.rename", {
    req, targetType: "user", targetId: String(user._id), meta: { email: user.email, ...changes },
  });
  return NextResponse.json({ ok: true, status: user.status, name: user.name }, { headers: NO_STORE });
}

export async function DELETE(req: NextRequest, { params }: Ctx) {
  const guard = await requireAdmin(req, { superOnly: true });
  if (guard.error) return guard.error;
  const user = await loadUser((await params).id);
  if (!user) return notFound();

  const body = await req.json().catch(() => ({}));
  if (String(body.confirmEmail ?? "").trim().toLowerCase() !== user.email)
    return NextResponse.json({ error: "Type the user's email to confirm deletion." }, { status: 400 });

  const result = await deleteUserAndData(user);
  await audit(guard.admin, "user.delete", {
    req, targetType: "user", targetId: String(user._id), meta: { email: user.email, ...result },
  });
  return NextResponse.json({ ok: true, ...result }, { headers: NO_STORE });
}
