/**
 * GET /api/auth/me  → current user (fresh from DB, includes avatar)
 * PUT /api/auth/me  → update profile: { name?, avatarUrl?, avatarId? }
 *                     Replacing or clearing the avatar purges the old
 *                     Cloudinary image.
 * DELETE /api/auth/me → delete the account: { password }. Removes every card,
 *                     all card photos, the avatar and finally the user.
 */

import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { connectDB } from "@/lib/mongoose";
import User from "@/models/User";
import { deleteCloudinaryImages, isOwnedImageId } from "@/lib/cloudinary";
import { deleteUserAndData } from "@/lib/accountDeletion";
import bcrypt from "bcryptjs";
import { destroySession } from "@/lib/session";
import { checkRateLimit, clientIp, tooManyRequests } from "@/lib/rateLimit";

function serialize(user: { _id: unknown; name: string; email: string; avatarUrl?: string; avatarId?: string; createdAt?: Date }) {
  return {
    userId: String(user._id),
    id: String(user._id),
    name: user.name,
    email: user.email,
    avatarUrl: user.avatarUrl ?? "",
    avatarId: user.avatarId ?? "",
    createdAt: user.createdAt,
  };
}

export async function GET(req: NextRequest) {
  const session = await getSession(req);
  if (!session)
    return NextResponse.json({ user: null }, { status: 401 });

  await connectDB();
  const user = await User.findById(session.userId).lean();
  if (!user)
    return NextResponse.json({ user: null }, { status: 401 });

  return NextResponse.json({ user: serialize(user) });
}

export async function PUT(req: NextRequest) {
  const session = await getSession(req);
  if (!session)
    return NextResponse.json({ error: "Unauthorised." }, { status: 401 });

  try {
    const { name, avatarUrl, avatarId } = await req.json();

    await connectDB();
    const user = await User.findById(session.userId);
    if (!user)
      return NextResponse.json({ error: "User not found." }, { status: 404 });

    if (name !== undefined) {
      const trimmed = String(name).trim();
      if (trimmed.length < 2 || trimmed.length > 60)
        return NextResponse.json({ error: "Name must be 2–60 characters." }, { status: 400 });
      user.name = trimmed;
    }

    if (avatarUrl !== undefined) {
      const nextId = avatarId ?? "";
      if (nextId !== "" && nextId !== user.avatarId && !isOwnedImageId(session.userId, nextId))
        return NextResponse.json({ error: "Invalid avatar reference." }, { status: 400 });
      if (user.avatarId && user.avatarId !== nextId) {
        await deleteCloudinaryImages([user.avatarId]);
      }
      user.avatarUrl = avatarUrl ?? "";
      user.avatarId = nextId;
    }

    await user.save();
    return NextResponse.json({ user: serialize(user) });
  } catch (err: unknown) {
    console.error("[PUT /api/auth/me]", err);
    return NextResponse.json({ error: "Server error." }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  const session = await getSession(req);
  if (!session)
    return NextResponse.json({ error: "Unauthorised." }, { status: 401 });

  try {
    const limited = await checkRateLimit(`delete-account:${clientIp(req)}:${session.userId}`, 5, 60 * 60);
    if (!limited.ok) return tooManyRequests(limited.retryAfterSec);

    const { password } = await req.json().catch(() => ({ password: "" }));
    if (!password || typeof password !== "string")
      return NextResponse.json({ error: "Enter your password to delete your account." }, { status: 400 });

    await connectDB();
    const user = await User.findById(session.userId);
    if (!user)
      return NextResponse.json({ error: "User not found." }, { status: 404 });

    if (!(await bcrypt.compare(password, user.passwordHash)))
      return NextResponse.json({ error: "Incorrect password." }, { status: 403 });

    await deleteUserAndData(user);
    await destroySession();

    return NextResponse.json({ message: "Account deleted." });
  } catch (err: unknown) {
    console.error("[DELETE /api/auth/me]", err);
    return NextResponse.json({ error: "Server error." }, { status: 500 });
  }
}
