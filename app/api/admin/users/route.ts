/** GET /api/admin/users?q=&status=&cursor=&limit= — any admin (read-only list). */

import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import { connectDB } from "@/lib/mongoose";
import { requireAdmin } from "@/lib/adminAuth";
import { escapeRegex } from "@/lib/text";
import User from "@/models/User";
import AddressCard from "@/models/AddressCard";

export async function GET(req: NextRequest) {
  const guard = await requireAdmin(req);
  if (guard.error) return guard.error;

  const sp = new URL(req.url).searchParams;
  const limit = Math.min(Math.max(Number(sp.get("limit")) || 20, 1), 50);
  const q = (sp.get("q") ?? "").trim().slice(0, 80);
  const status = sp.get("status");
  const cursor = sp.get("cursor");

  const filter: Record<string, unknown> = {};
  if (status === "active" || status === "suspended") filter.status = status;
  if (q) {
    const rx = new RegExp(escapeRegex(q), "i");
    filter.$or = [{ name: rx }, { email: rx }];
  }
  const matchesAll = { ...filter }; // before the pagination cursor: used for the total
  if (cursor && mongoose.Types.ObjectId.isValid(cursor)) filter._id = { $lt: new mongoose.Types.ObjectId(cursor) };

  await connectDB();
  const total = cursor ? undefined : await User.countDocuments(matchesAll);
  const users = await User.find(filter)
    .sort({ _id: -1 })
    .limit(limit + 1)
    .select("name email status createdAt lastLoginAt avatarUrl")
    .lean();
  const hasMore = users.length > limit;
  if (hasMore) users.pop();

  const counts = await AddressCard.aggregate([
    { $match: { ownerId: { $in: users.map((u) => u._id) } } },
    { $group: { _id: "$ownerId", n: { $sum: 1 } } },
  ]);
  const byOwner = new Map(counts.map((c) => [String(c._id), c.n]));

  return NextResponse.json(
    {
      users: users.map((u) => ({
        id: String(u._id),
        name: u.name,
        email: u.email,
        status: u.status ?? "active",
        avatarUrl: u.avatarUrl ?? "",
        createdAt: u.createdAt,
        lastLoginAt: u.lastLoginAt ?? null,
        cardCount: byOwner.get(String(u._id)) ?? 0,
      })),
      nextCursor: hasMore ? String(users[users.length - 1]._id) : null,
      hasMore,
      total,
    },
    { headers: { "Cache-Control": "no-store" } }
  );
}
