/**
 * GET /api/admin/cards?q=&category=&sharing=on|off&cursor= — any admin.
 * Lists card METADATA only. Photos, notes and phone numbers never appear here,
 * and the DIGIPIN (≈ a home location) is masked unless you're the super admin.
 */

import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import { connectDB } from "@/lib/mongoose";
import { requireAdmin } from "@/lib/adminAuth";
import { escapeRegex, maskDigipin } from "@/lib/text";
import AddressCard from "@/models/AddressCard";
import User from "@/models/User";

export async function GET(req: NextRequest) {
  const guard = await requireAdmin(req);
  if (guard.error) return guard.error;
  const isSuper = guard.admin.role === "super";

  const sp = new URL(req.url).searchParams;
  const limit = Math.min(Math.max(Number(sp.get("limit")) || 20, 1), 50);
  const q = (sp.get("q") ?? "").trim().slice(0, 80);
  const category = (sp.get("category") ?? "").trim().toLowerCase();
  const sharing = sp.get("sharing");
  const cursor = sp.get("cursor");

  const filter: Record<string, unknown> = {};
  if (category) filter.category = category;
  if (sharing === "off") filter.sharingEnabled = false;
  if (sharing === "on") filter.sharingEnabled = { $ne: false };
  if (q) {
    const rx = new RegExp(escapeRegex(q), "i");
    // Only the super admin may search by DIGIPIN (it would reveal locations).
    filter.$or = isSuper ? [{ title: rx }, { digipin: rx }] : [{ title: rx }];
  }
  const matchesAll = { ...filter };
  if (cursor && mongoose.Types.ObjectId.isValid(cursor)) filter._id = { $lt: new mongoose.Types.ObjectId(cursor) };

  await connectDB();
  const total = cursor ? undefined : await AddressCard.countDocuments(matchesAll);
  const cards = await AddressCard.find(filter)
    .sort({ _id: -1 })
    .limit(limit + 1)
    .select("title digipin ownerId category sharingEnabled shareExpiresAt viewCount photoUrls isFavorite createdAt")
    .lean();
  const hasMore = cards.length > limit;
  if (hasMore) cards.pop();

  const owners = await User.find({ _id: { $in: cards.map((c) => c.ownerId) } }).select("name email").lean();
  const ownerById = new Map(owners.map((o) => [String(o._id), o]));

  return NextResponse.json(
    {
      cards: cards.map((c) => {
        const owner = ownerById.get(String(c.ownerId));
        return {
          id: String(c._id),
          title: c.title,
          digipin: isSuper ? c.digipin : maskDigipin(c.digipin),
          category: c.category || "",
          sharingEnabled: c.sharingEnabled !== false,
          expired: !!c.shareExpiresAt && new Date(c.shareExpiresAt) < new Date(),
          viewCount: c.viewCount ?? 0,
          photos: c.photoUrls?.length ?? 0,
          isFavorite: !!c.isFavorite,
          createdAt: c.createdAt,
          owner: owner ? { id: String(owner._id), name: owner.name, email: owner.email } : null,
        };
      }),
      nextCursor: hasMore ? String(cards[cards.length - 1]._id) : null,
      hasMore,
      total,
    },
    { headers: { "Cache-Control": "no-store" } }
  );
}
