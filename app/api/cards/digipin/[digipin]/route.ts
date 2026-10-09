/**
 * GET /api/cards/digipin/[digipin]
 *
 * A DIGIPIN is derived from a location — anyone can compute it — so it must NOT
 * unlock card data (photos, phone, notes). Card data is returned only:
 *   1. to the signed-in OWNER of a card at that DIGIPIN (keeps older app
 *      versions working, which open the owner's own cards this way), and
 *   2. for LEGACY cards created before private share links existed, while their
 *      owner hasn't reset the link yet (grace period).
 * Everything else → 404; the caller can still show the decoded location.
 */

import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongoose";
import { getSession } from "@/lib/session";
import AddressCard from "@/models/AddressCard";
import { checkRateLimit, clientIp, tooManyRequests } from "@/lib/rateLimit";
import { isShareActive, publicCardView } from "@/lib/shareLinks";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ digipin: string }> }
) {
  const limited = await checkRateLimit(`digipin-lookup:${clientIp(req)}`, 60, 60);
  if (!limited.ok) return tooManyRequests(limited.retryAfterSec);

  const { digipin } = await params;
  const pin = digipin.toUpperCase().trim();
  const headers = { "Cache-Control": "no-store" };

  await connectDB();

  const session = await getSession(req);
  if (session) {
    const own = await AddressCard.findOne({ digipin: pin, ownerId: session.userId })
      .sort({ _id: -1 })
      .lean();
    if (own) return NextResponse.json({ card: own }, { headers });
  }

  const legacy = await AddressCard.findOne({
    digipin: pin,
    $or: [{ shareToken: { $exists: false } }, { legacyPublic: true }],
  })
    .sort({ _id: -1 })
    .lean();

  if (legacy && isShareActive(legacy)) {
    return NextResponse.json({ card: publicCardView(legacy as never) }, { headers });
  }

  return NextResponse.json({ error: "Card not found." }, { status: 404, headers });
}
