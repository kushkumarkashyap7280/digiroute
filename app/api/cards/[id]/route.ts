/**
 * DELETE /api/cards/[id]  → Deletes card & cleans up Cloudinary images
 * PUT    /api/cards/[id]  → Updates card & purges replaced Cloudinary images
 */

import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongoose";
import { getSession } from "@/lib/session";
import AddressCard from "@/models/AddressCard";
import { deleteCloudinaryImages, isOwnedImageId } from "@/lib/cloudinary";
import { parseCardExtras } from "@/lib/cardFields";

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
    const body = await req.json();
    const { title, humanAddress, digipin, photoUrls, photoIds, isFavorite } = body;
    const extras = parseCardExtras(body);
    if (!extras.ok) return NextResponse.json({ error: extras.error }, { status: 400 });

    await connectDB();
    const card = await AddressCard.findById(id);

    if (!card)
      return NextResponse.json({ error: "Card not found." }, { status: 404 });

    if (card.ownerId.toString() !== session.userId)
      return NextResponse.json({ error: "Forbidden." }, { status: 403 });

    // Only NEW image ids must live in the caller's own folder; ids already on
    // the card pass through (older cards may predate the per-user folders).
    if (photoIds !== undefined) {
      const existing = new Set<string>(card.photoIds ?? []);
      const valid =
        Array.isArray(photoIds) &&
        photoIds.every((p) => existing.has(p) || isOwnedImageId(session.userId, p));
      if (!valid)
        return NextResponse.json({ error: "Invalid photo reference." }, { status: 400 });
      if (photoUrls !== undefined && (!Array.isArray(photoUrls) || photoUrls.length !== photoIds.length))
        return NextResponse.json({ error: "photoUrls and photoIds must match." }, { status: 400 });
      if (photoIds.length > 2)
        return NextResponse.json({ error: "Maximum 2 photos allowed." }, { status: 400 });
    }

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
    if (isFavorite !== undefined) card.isFavorite = Boolean(isFavorite);
    if (extras.value.category !== undefined) card.category = extras.value.category;
    if (extras.value.deliveryNote !== undefined) card.deliveryNote = extras.value.deliveryNote;
    if (extras.value.contactPhone !== undefined) card.contactPhone = extras.value.contactPhone;
    if (Array.isArray(photoUrls) && photoUrls.length > 2)
      return NextResponse.json({ error: "Maximum 2 photos allowed." }, { status: 400 });
    if (photoUrls !== undefined) card.photoUrls = photoUrls;
    if (photoIds !== undefined) card.photoIds = photoIds;

    await card.save();

    return NextResponse.json({ card });
  } catch (err: unknown) {
    console.error("[PUT /api/cards/[id]]", err);
    return NextResponse.json({ error: "Server error updating card." }, { status: 500 });
  }
}
