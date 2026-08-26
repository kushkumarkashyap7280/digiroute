/**
 * GET  /api/cards?cursor=<lastId>&limit=12   → paginated list (cursor-based)
 * POST /api/cards                             → create a new card
 */

import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongoose";
import { getSession } from "@/lib/session";
import AddressCard from "@/models/AddressCard";
import mongoose from "mongoose";

const DEFAULT_LIMIT = 12;

export async function GET(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorised." }, { status: 401 });

  await connectDB();

  const { searchParams } = new URL(req.url);
  const cursor = searchParams.get("cursor");          // last _id seen by client
  const limit  = Math.min(Number(searchParams.get("limit") ?? DEFAULT_LIMIT), 50);

  // Build cursor filter: fetch cards OLDER than the cursor (sorted newest-first)
  const filter: Record<string, unknown> = { ownerId: session.userId };
  if (cursor && mongoose.Types.ObjectId.isValid(cursor)) {
    filter._id = { $lt: new mongoose.Types.ObjectId(cursor) };
  }

  const cards = await AddressCard.find(filter)
    .sort({ _id: -1 })          // newest first
    .limit(limit + 1)           // fetch one extra to detect if there's a next page
    .lean();

  const hasMore = cards.length > limit;
  if (hasMore) cards.pop();     // remove the extra probe item

  const nextCursor = hasMore ? String(cards[cards.length - 1]._id) : null;

  return NextResponse.json({ cards, nextCursor, hasMore });
}

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorised." }, { status: 401 });

  try {
    const { digipin, title, photoUrls, photoIds, humanAddress } = await req.json();

    if (!digipin || !title)
      return NextResponse.json({ error: "digipin and title are required." }, { status: 400 });

    if (photoUrls && photoUrls.length > 2)
      return NextResponse.json({ error: "Maximum 2 photos allowed." }, { status: 400 });

    await connectDB();
    const card = await AddressCard.create({
      digipin:      digipin.toUpperCase(),
      ownerId:      session.userId,
      title,
      photoUrls:    photoUrls ?? [],
      photoIds:     photoIds  ?? [],
      humanAddress: humanAddress ?? "",
    });

    return NextResponse.json({ card }, { status: 201 });
  } catch (err: unknown) {
    console.error("[POST /api/cards]", err);
    return NextResponse.json({ error: "Server error." }, { status: 500 });
  }
}
