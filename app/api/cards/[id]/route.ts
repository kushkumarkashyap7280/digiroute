/**
 * DELETE /api/cards/[id]  → Deletes card & cleans up Cloudinary images
 * PUT    /api/cards/[id]  → Updates card & purges replaced Cloudinary images
 */

import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongoose";
import { getSession } from "@/lib/session";
import AddressCard from "@/models/AddressCard";
import { deleteCloudinaryImages } from "@/lib/cloudinary";

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession(req);
  if (!session) return NextResponse.json({ error: "Unauthorised." }, { status: 401 });

  const { id } = await params;

  await connectDB();
  const card = await AddressCard.findById(id);

  if (!card)
    return NextResponse.json({ error: "Card not found." }, { status: 404 });

  if (card.ownerId.toString() !== session.userId)
    return NextResponse.json({ error: "Forbidden." }, { status: 403 });

  // Purge all Cloudinary assets associated with this card
  if (card.photoIds && card.photoIds.length > 0) {
    await deleteCloudinaryImages(card.photoIds);
  }

  await card.deleteOne();
  return NextResponse.json({ message: "Deleted." });
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession(req);
  if (!session) return NextResponse.json({ error: "Unauthorised." }, { status: 401 });

  const { id } = await params;

  try {
    const { title, humanAddress, digipin, photoUrls, photoIds } = await req.json();

    await connectDB();
    const card = await AddressCard.findById(id);

    if (!card)
      return NextResponse.json({ error: "Card not found." }, { status: 404 });

    if (card.ownerId.toString() !== session.userId)
      return NextResponse.json({ error: "Forbidden." }, { status: 403 });

    // If new photos are being set, delete previous photos from Cloudinary that are being replaced
    if (photoIds !== undefined && card.photoIds && card.photoIds.length > 0) {
      const incomingIds = Array.isArray(photoIds) ? photoIds : [];
      const oldIdsToDelete = card.photoIds.filter((pid: string) => !incomingIds.includes(pid));
      if (oldIdsToDelete.length > 0) {
        await deleteCloudinaryImages(oldIdsToDelete);
      }
    }

    if (title !== undefined) card.title = title.trim();
    if (humanAddress !== undefined) card.humanAddress = humanAddress.trim();
    if (digipin !== undefined) card.digipin = digipin.toUpperCase().trim();
    if (photoUrls !== undefined) card.photoUrls = photoUrls;
    if (photoIds !== undefined) card.photoIds = photoIds;

    await card.save();

    return NextResponse.json({ card });
  } catch (err: unknown) {
    console.error("[PUT /api/cards/[id]]", err);
    return NextResponse.json({ error: "Server error updating card." }, { status: 500 });
  }
}
