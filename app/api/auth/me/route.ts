/**
 * GET /api/auth/me  → current user (fresh from DB, includes avatar)
 * PUT /api/auth/me  → update profile: { name?, avatarUrl?, avatarId? }
 *                     Replacing or clearing the avatar purges the old
 *                     Cloudinary image.
 */

import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { connectDB } from "@/lib/mongoose";
import User from "@/models/User";
import { deleteCloudinaryImages } from "@/lib/cloudinary";

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
