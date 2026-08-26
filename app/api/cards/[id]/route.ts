/**
 * DELETE /api/cards/[id]
 * Deletes the card (owner only) and purges its Cloudinary assets if photoIds are present.
 */

import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongoose";
import { getSession } from "@/lib/session";
import AddressCard from "@/models/AddressCard";
import { v2 as cloudinary } from "cloudinary";

// Cloudinary is configured lazily — no crash if env vars are missing during dev
function configureCloudinary() {
  if (process.env.CLOUDINARY_CLOUD_NAME) {
    cloudinary.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key:    process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET,
      secure:     true,
    });
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorised." }, { status: 401 });

  const { id } = await params;

  await connectDB();
  const card = await AddressCard.findById(id);

  if (!card)
    return NextResponse.json({ error: "Card not found." }, { status: 404 });

  if (card.ownerId.toString() !== session.userId)
    return NextResponse.json({ error: "Forbidden." }, { status: 403 });

  // Purge Cloudinary assets (best-effort — don't fail the delete if Cloudinary is unavailable)
  if (card.photoIds && card.photoIds.length > 0) {
    try {
      configureCloudinary();
      await Promise.all(card.photoIds.map((pid: string) => cloudinary.uploader.destroy(pid)));
    } catch (e) {
      console.warn("[DELETE /api/cards] Cloudinary cleanup failed:", e);
    }
  }

  await card.deleteOne();
  return NextResponse.json({ message: "Deleted." });
}
