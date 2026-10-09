/**
 * GET  /api/cards?cursor=<lastId>&limit=12&q=&category=&favorite=true
 *                                             → paginated list (cursor-based), server-side
 *                                               search/filter; first page also returns
 *                                               `total` and `facets` (all, favorites, used categories)
 * POST /api/cards                             → create a new card
 */

import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongoose";
import { getSession } from "@/lib/session";
import AddressCard from "@/models/AddressCard";
import mongoose from "mongoose";
import { parseCardExtras } from "@/lib/cardFields";
import { isOwnedImageId } from "@/lib/cloudinary";
import { backfillShareTokens, newShareToken } from "@/lib/shareLinks";

const DEFAULT_LIMIT = 10;

function escapeRegex(text: string) {
  return text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export async function GET(req: NextRequest) {
  const session = await getSession(req);
  if (!session) return NextResponse.json({ error: "Unauthorised." }, { status: 401 });

  await connectDB();

  const { searchParams } = new URL(req.url);
  const cursor = searchParams.get("cursor");          // last _id seen by client
  const limit  = Math.min(Math.max(Number(searchParams.get("limit") ?? DEFAULT_LIMIT) || DEFAULT_LIMIT, 1), 50);
  const q        = (searchParams.get("q") ?? "").trim().slice(0, 80);
  const category = (searchParams.get("category") ?? "").trim().toLowerCase();
  const onlyFav  = searchParams.get("favorite") === "true";

  const ownerId = new mongoose.Types.ObjectId(session.userId);

  // Filters shared by the page query and the total count.
  const base: Record<string, unknown> = { ownerId };
  if (onlyFav) base.isFavorite = true;
  if (category) base.category = category;
  if (q) {
    const rx = new RegExp(escapeRegex(q), "i");
    base.$or = [{ title: rx }, { digipin: rx }, { humanAddress: rx }];
  }

  // Cursor: fetch cards OLDER than the cursor (sorted newest-first).
  const filter: Record<string, unknown> = { ...base };
  if (cursor && mongoose.Types.ObjectId.isValid(cursor)) {
    filter._id = { $lt: new mongoose.Types.ObjectId(cursor) };
  }

  const cards = await AddressCard.find(filter)
    .sort({ _id: -1 })          // newest first
    .limit(limit + 1)           // fetch one extra to detect if there's a next page
    .lean();

  const hasMore = cards.length > limit;
  if (hasMore) cards.pop();     // remove the extra probe item

  // Cards created before share links existed get a token now (their old
  // DIGIPIN link keeps working until the owner resets the link).
  await backfillShareTokens(cards);

  const nextCursor = hasMore ? String(cards[cards.length - 1]._id) : null;

  // First page only: totals + facets so the UI can show counts and offer only
  // the categories that exist, without loading every card.
  let total: number | undefined;
  let facets: { all: number; favorites: number; categories: string[] } | undefined;
  if (!cursor) {
    const [t, all, favorites, categories] = await Promise.all([
      AddressCard.countDocuments(base),
      AddressCard.countDocuments({ ownerId }),
      AddressCard.countDocuments({ ownerId, isFavorite: true }),
      AddressCard.distinct("category", { ownerId }),
    ]);
    total = t;
    facets = { all, favorites, categories: categories.filter((c: string) => c) };
  }

  return NextResponse.json({ cards, nextCursor, hasMore, total, facets });
}

export async function POST(req: NextRequest) {
  const session = await getSession(req);
  if (!session) return NextResponse.json({ error: "Unauthorised." }, { status: 401 });

  try {
    const body = await req.json();
    const { digipin, title, photoUrls, photoIds, humanAddress, isFavorite } = body;

    if (!digipin || !title)
      return NextResponse.json({ error: "digipin and title are required." }, { status: 400 });

    if (photoUrls && photoUrls.length > 2)
      return NextResponse.json({ error: "Maximum 2 photos allowed." }, { status: 400 });

    const extras = parseCardExtras(body);
    if (!extras.ok) return NextResponse.json({ error: extras.error }, { status: 400 });

    if (photoIds !== undefined) {
      const ok =
        Array.isArray(photoIds) &&
        photoIds.every((p) => isOwnedImageId(session.userId, p)) &&
        (photoUrls === undefined || (Array.isArray(photoUrls) && photoUrls.length === photoIds.length));
      if (!ok) return NextResponse.json({ error: "Invalid photo reference." }, { status: 400 });
    }

    await connectDB();
    const card = await AddressCard.create({
      ...extras.value,
      shareToken:   newShareToken(),
      sharingEnabled: true,
      digipin:      digipin.toUpperCase(),
      ownerId:      session.userId,
      title,
      photoUrls:    photoUrls ?? [],
      photoIds:     photoIds  ?? [],
      humanAddress: humanAddress ?? "",
      isFavorite:   Boolean(isFavorite),
    });

    return NextResponse.json({ card }, { status: 201 });
  } catch (err: unknown) {
    console.error("[POST /api/cards]", err);
    return NextResponse.json({ error: "Server error." }, { status: 500 });
  }
}
