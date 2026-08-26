/**
 * /api/upload is no longer used.
 * Upload flow → POST /api/upload/sign (get signed params) → upload directly to Cloudinary.
 */
import { NextResponse } from "next/server";
export async function POST() {
  return NextResponse.json(
    { error: "Direct upload removed. Use POST /api/upload/sign to get Cloudinary signed params." },
    { status: 410 }
  );
}
