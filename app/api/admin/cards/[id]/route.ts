/**
 * GET    /api/admin/cards/[id]   super only — full card for moderation (AUDITED)
 * DELETE /api/admin/cards/[id]   super only — { reason } removes the card and its photos
 */

import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import { connectDB } from "@/lib/mongoose";
import { requireAdmin } from "@/lib/adminAuth";
import { audit } from "@/lib/audit";
import { deleteCloudinaryImages } from "@/lib/cloudinary";
import AddressCard from "@/models/AddressCard";
import User from "@/models/User";

type Ctx = { params: Promise<{ id: string }> };
const NO_STORE = { "Cache-Control": "no-store" };

async function load(id: string) {
  if (!mongoose.Types.ObjectId.isValid(id)) return null;
  await connectDB();
  return AddressCard.findById(id);
}

export async function GET(req: NextRequest, { params }: Ctx) {
  const guard = await requireAdmin(req, { superOnly: true });
  if (guard.error) return guard.error;
  const card = await load((await params).id);
  if (!card) return NextResponse.json({ error: "Card not found." }, { status: 404 });

  const owner = await User.findById(card.ownerId).select("name email").lean();
  // Looking at a private card's contents is itself an auditable act.
  await audit(guard.admin, "card.view", {
    req, targetType: "card", targetId: String(card._id), meta: { owner: owner?.email },
  });

  return NextResponse.json(
    {
      card: {
        id: String(card._id),
        title: card.title,
        digipin: card.digipin,
        humanAddress: card.humanAddress,
        category: card.category,
        deliveryNote: card.deliveryNote,
        contactPhone: card.contactPhone,
        photoUrls: card.photoUrls,
        sharingEnabled: card.sharingEnabled !== false,
        shareExpiresAt: card.shareExpiresAt ?? null,
        hidePhone: card.hidePhone,
        viewCount: card.viewCount ?? 0,
        createdAt: card.createdAt,
        owner: owner ? { id: String(owner._id), name: owner.name, email: owner.email } : null,
      },
    },
    { headers: NO_STORE }
  );
}

export async function DELETE(req: NextRequest, { params }: Ctx) {
  const guard = await requireAdmin(req, { superOnly: true });
  if (guard.error) return guard.error;
  const card = await load((await params).id);
  if (!card) return NextResponse.json({ error: "Card not found." }, { status: 404 });

  const body = await req.json().catch(() => ({}));
  const reason = String(body.reason ?? "").trim().slice(0, 200);
  if (reason.length < 3)
    return NextResponse.json({ error: "Give a short reason for removing this card." }, { status: 400 });

  const owner = await User.findById(card.ownerId).select("email").lean();
  await deleteCloudinaryImages(card.photoIds ?? []);
  await card.deleteOne();
  await audit(guard.admin, "card.delete", {
    req, targetType: "card", targetId: String(card._id), meta: { title: card.title, owner: owner?.email, reason },
  });
  return NextResponse.json({ ok: true }, { headers: NO_STORE });
}
