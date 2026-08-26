/**
 * POST /api/digipin/decode
 *
 * Body: { digipin: string }
 * Response: { latitude: string, longitude: string }
 *
 * Runs server-side only — the DIGIPIN algorithm is never exposed to the client.
 */

import { NextRequest, NextResponse } from "next/server";
import { getLatLngFromDigiPin } from "@/lib/digipin";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const digipin = body?.digipin;

    if (!digipin || typeof digipin !== "string") {
      return NextResponse.json(
        { error: "digipin must be a non-empty string." },
        { status: 400 }
      );
    }

    const coords = getLatLngFromDigiPin(digipin);
    return NextResponse.json(coords);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Decoding failed.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
