/**
 * POST /api/digipin/encode
 *
 * Body: { lat: number, lon: number }
 * Response: { digipin: string }
 *
 * Runs server-side only — the DIGIPIN algorithm is never exposed to the client.
 */

import { NextRequest, NextResponse } from "next/server";
import { getDigiPin } from "@/lib/digipin";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const lat = Number(body?.lat);
    const lon = Number(body?.lon);

    if (isNaN(lat) || isNaN(lon)) {
      return NextResponse.json(
        { error: "lat and lon must be valid numbers." },
        { status: 400 }
      );
    }

    const digipin = getDigiPin(lat, lon);
    return NextResponse.json({ digipin });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Encoding failed.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
