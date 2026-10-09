/**
 * POST /api/upload/cleanup  { publicIds: string[] }
 *
 * Photos are uploaded to Cloudinary *before* the card / profile is saved. When
 * the save then fails (or the user backs out) those uploads would be orphaned
 * forever, so the app calls this to discard them.
 *
 * Safety: only ids inside the caller's own folder are touched, and an id that
 * is still attached to one of the caller's cards or to their avatar is never
 * deleted, so a stray or malicious call can't remove live photos.
 */

import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { connectDB } from "@/lib/mongoose";
import AddressCard from "@/models/AddressCard";
import User from "@/models/User";
import { deleteCloudinaryImages, isOwnedImageId } from "@/lib/cloudinary";

export async function POST(req: NextRequest) {
  const session = await getSession(req);
  if (!session) return NextResponse.json({ error: "Unauthorised." }, { status: 401 });

  const body = await req.json().catch(() => ({}));
  const requested: unknown[] = Array.isArray(body.publicIds) ? body.publicIds.slice(0, 20) : [];
  const candidates = [...new Set(requested.filter((id): id is string => isOwnedImageId(session.userId, id)))];
  if (candidates.length === 0) return NextResponse.json({ deleted: 0 });

  await connectDB();
  const [cards, user] = await Promise.all([
    AddressCard.find({ ownerId: session.userId, photoIds: { $in: candidates } }).select("photoIds").lean(),
    User.findById(session.userId).select("avatarId").lean(),
  ]);

  const inUse = new Set<string>(cards.flatMap((c) => c.photoIds ?? []));
  if (user?.avatarId) inUse.add(user.avatarId);

  const toDelete = candidates.filter((id) => !inUse.has(id));
  await deleteCloudinaryImages(toDelete);
  return NextResponse.json({ deleted: toDelete.length, skipped: candidates.length - toDelete.length });
}
