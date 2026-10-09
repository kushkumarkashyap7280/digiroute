/**
 * GET /api/cards/shared/[token]  → the card behind a share link (public, no login).
 *
 * Returns only what a link holder may see (see publicCardView). A switched-off,
 * expired, reset or unknown link all answer with the same 404 so nothing leaks
 * about which tokens exist.
 */

import { NextRequest, NextResponse } from "next/server";
import { checkRateLimit, clientIp, tooManyRequests } from "@/lib/rateLimit";
import { findSharedCard, publicCardView } from "@/lib/shareLinks";

const HEADERS = {
  "Cache-Control": "no-store",
  "X-Robots-Tag": "noindex, nofollow",
};

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  const limited = await checkRateLimit(`shared:${clientIp(req)}`, 60, 60);
  if (!limited.ok) return tooManyRequests(limited.retryAfterSec);

  const { token } = await params;
  const card = await findSharedCard(token, { countView: true });
  if (!card)
    return NextResponse.json({ error: "This link is not available." }, { status: 404, headers: HEADERS });

  return NextResponse.json({ card: publicCardView(card) }, { headers: HEADERS });
}
