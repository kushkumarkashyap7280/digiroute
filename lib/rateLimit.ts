/**
 * Fixed-window rate limiter backed by MongoDB, so the limit is shared across
 * all serverless instances (an in-memory counter would reset per instance).
 * Fails open: if the limiter itself errors, the request is allowed.
 */

import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongoose";
import RateLimit from "@/models/RateLimit";

export function clientIp(req: NextRequest): string {
  const fwd = req.headers.get("x-forwarded-for");
  if (fwd) return fwd.split(",")[0].trim();
  return req.headers.get("x-real-ip") ?? "unknown";
}

export async function checkRateLimit(
  key: string,
  limit: number,
  windowSec: number
): Promise<{ ok: boolean; retryAfterSec: number }> {
  try {
    await connectDB();
    const windowMs = windowSec * 1000;
    const bucket = Math.floor(Date.now() / windowMs);
    const windowEnd = (bucket + 1) * windowMs;

    const doc = await RateLimit.findOneAndUpdate(
      { key: `${key}:${bucket}` },
      { $inc: { count: 1 }, $setOnInsert: { expiresAt: new Date(windowEnd + 60_000) } },
      { upsert: true, new: true }
    );

    return {
      ok: doc.count <= limit,
      retryAfterSec: Math.max(1, Math.ceil((windowEnd - Date.now()) / 1000)),
    };
  } catch (err) {
    console.error("[rateLimit]", err);
    return { ok: true, retryAfterSec: 0 };
  }
}

/** Builds the 429 response for a tripped limit. */
export function tooManyRequests(retryAfterSec: number): NextResponse {
  const mins = Math.ceil(retryAfterSec / 60);
  return NextResponse.json(
    { error: `Too many attempts. Please try again in ${mins} minute${mins === 1 ? "" : "s"}.` },
    { status: 429, headers: { "Retry-After": String(retryAfterSec) } }
  );
}
