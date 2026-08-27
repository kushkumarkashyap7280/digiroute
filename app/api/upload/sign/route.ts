/**
 * POST /api/upload/sign
 *
 * Returns Cloudinary signed upload parameters so the client can upload
 * directly to Cloudinary — no image bytes ever pass through our server.
 *
 * The client then does:
 *   POST https://api.cloudinary.com/v1_1/<cloud_name>/image/upload
 *   with the signed params + the file
 *
 * Requires: CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET in .env.local
 */

import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { configureCloudinary } from "@/lib/cloudinary";

export async function POST() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorised." }, { status: 401 });

  if (!process.env.CLOUDINARY_CLOUD_NAME) {
    return NextResponse.json(
      { error: "Cloudinary not configured. Add CLOUDINARY_CLOUD_NAME/API_KEY/API_SECRET to .env.local." },
      { status: 503 }
    );
  }

  const timestamp  = Math.round(Date.now() / 1000);
  const folder     = `digiroute/${session.userId}`;

  // Sign only the restricted params — api_secret never leaves the server
  const paramsToSign = { timestamp, folder };
  const c = configureCloudinary();
  const signature = c.utils.api_sign_request(paramsToSign, process.env.CLOUDINARY_API_SECRET!);

  return NextResponse.json({
    timestamp,
    signature,
    folder,
    api_key:    process.env.CLOUDINARY_API_KEY,
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  });
}
