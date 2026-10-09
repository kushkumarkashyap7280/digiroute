/** GET /api/admin/audit?action=&cursor= — super only. Append-only history of admin activity. */

import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import { connectDB } from "@/lib/mongoose";
import { requireAdmin } from "@/lib/adminAuth";
import { escapeRegex } from "@/lib/text";
import AuditLog from "@/models/AuditLog";

export async function GET(req: NextRequest) {
  const guard = await requireAdmin(req, { superOnly: true });
  if (guard.error) return guard.error;

  const sp = new URL(req.url).searchParams;
  const limit = Math.min(Math.max(Number(sp.get("limit")) || 30, 1), 100);
  const action = (sp.get("action") ?? "").trim().slice(0, 40);
  const cursor = sp.get("cursor");

  const filter: Record<string, unknown> = {};
  if (action) filter.action = new RegExp(`^${escapeRegex(action)}`);
  if (cursor && mongoose.Types.ObjectId.isValid(cursor)) filter._id = { $lt: new mongoose.Types.ObjectId(cursor) };

  await connectDB();
  const rows = await AuditLog.find(filter).sort({ _id: -1 }).limit(limit + 1).lean();
  const hasMore = rows.length > limit;
  if (hasMore) rows.pop();

  return NextResponse.json(
    {
      entries: rows.map((r) => ({
        id: String(r._id),
        at: r.createdAt,
        admin: r.adminEmail,
        action: r.action,
        targetType: r.targetType ?? null,
        targetId: r.targetId ?? null,
        meta: r.meta ?? null,
        ip: r.ip ?? null,
      })),
      nextCursor: hasMore ? String(rows[rows.length - 1]._id) : null,
      hasMore,
    },
    { headers: { "Cache-Control": "no-store" } }
  );
}
