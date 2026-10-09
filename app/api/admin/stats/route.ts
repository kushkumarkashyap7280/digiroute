/** GET /api/admin/stats — analytics for the overview page (any admin; counts only, no personal data). */

import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongoose";
import { requireAdmin } from "@/lib/adminAuth";
import User from "@/models/User";
import AddressCard from "@/models/AddressCard";
import { configureCloudinary } from "@/lib/cloudinary";

const DAY = 24 * 60 * 60 * 1000;
const DAYS = 30;

/** Fills missing days with 0 so charts have a continuous x-axis. */
function dailySeries(rows: { _id: string; n: number }[]) {
  const byDay = new Map(rows.map((r) => [r._id, r.n]));
  const out: { day: string; n: number }[] = [];
  const today = new Date();
  for (let i = DAYS - 1; i >= 0; i--) {
    const d = new Date(today.getTime() - i * DAY).toISOString().slice(0, 10);
    out.push({ day: d, n: byDay.get(d) ?? 0 });
  }
  return out;
}

// Cloudinary's usage API is slow and rate limited: cache it for 10 minutes.
let usageCache: { at: number; value: unknown } | null = null;
async function cloudinaryUsage() {
  if (usageCache && Date.now() - usageCache.at < 10 * 60 * 1000) return usageCache.value;
  let value: unknown = null;
  try {
    if (process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY) {
      const u = await configureCloudinary().api.usage();
      value = {
        storageBytes: u.storage?.usage ?? null,
        bandwidthBytes: u.bandwidth?.usage ?? null,
        transformations: u.transformations?.usage ?? null,
        plan: u.plan ?? null,
      };
    }
  } catch {
    value = null;
  }
  usageCache = { at: Date.now(), value };
  return value;
}

export async function GET(req: NextRequest) {
  const guard = await requireAdmin(req);
  if (guard.error) return guard.error;

  await connectDB();
  const since = new Date(Date.now() - DAYS * DAY);
  const week = new Date(Date.now() - 7 * DAY);
  const perDay = (field: string) => [
    { $match: { createdAt: { $gte: since } } },
    { $group: { _id: { $dateToString: { format: "%Y-%m-%d", date: `$${field}` } }, n: { $sum: 1 } } },
  ];

  const [
    totalUsers, suspendedUsers, newUsers7d, activeUsers7d,
    totalCards, sharedOn, sharedOff, withPhone,
    photoAgg, viewAgg, byCategory, signups, cardsDaily, usage,
  ] = await Promise.all([
    User.countDocuments(),
    User.countDocuments({ status: "suspended" }),
    User.countDocuments({ createdAt: { $gte: week } }),
    User.countDocuments({ lastLoginAt: { $gte: week } }),
    AddressCard.countDocuments(),
    AddressCard.countDocuments({ sharingEnabled: { $ne: false } }),
    AddressCard.countDocuments({ sharingEnabled: false }),
    AddressCard.countDocuments({ contactPhone: { $ne: "" } }),
    AddressCard.aggregate([{ $group: { _id: null, n: { $sum: { $size: { $ifNull: ["$photoUrls", []] } } } } }]),
    AddressCard.aggregate([{ $group: { _id: null, n: { $sum: { $ifNull: ["$viewCount", 0] } } } }]),
    AddressCard.aggregate([{ $group: { _id: { $ifNull: ["$category", ""] }, n: { $sum: 1 } } }, { $sort: { n: -1 } }]),
    User.aggregate(perDay("createdAt")),
    AddressCard.aggregate(perDay("createdAt")),
    cloudinaryUsage(),
  ]);

  return NextResponse.json(
    {
      users: { total: totalUsers, suspended: suspendedUsers, new7d: newUsers7d, active7d: activeUsers7d },
      cards: {
        total: totalCards,
        photos: photoAgg[0]?.n ?? 0,
        sharingOn: sharedOn,
        sharingOff: sharedOff,
        withPhone,
        linkViews: viewAgg[0]?.n ?? 0,
        avgPerUser: totalUsers ? Math.round((totalCards / totalUsers) * 10) / 10 : 0,
        byCategory: byCategory.map((c) => ({ category: c._id || "none", n: c.n })),
      },
      series: { signups: dailySeries(signups), cards: dailySeries(cardsDaily) },
      storage: usage,
      generatedAt: new Date().toISOString(),
    },
    { headers: { "Cache-Control": "no-store" } }
  );
}
