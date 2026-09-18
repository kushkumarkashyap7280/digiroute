/**
 * GET /api/cards/digipin/[digipin]  → Public lookup of a saved address card
 * by its DIGIPIN. No auth required — this powers card-sharing links.
 */

import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongoose";
import AddressCard from "@/models/AddressCard";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ digipin: string }> }
) {
  const { digipin } = await params;

  await connectDB();
  const card = await AddressCard.findOne({
    digipin: digipin.toUpperCase().trim(),
  }).lean();

  if (!card)
    return NextResponse.json({ error: "Card not found." }, { status: 404 });

  return NextResponse.json({ card });
}
