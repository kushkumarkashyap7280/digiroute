import { NextRequest, NextResponse } from "next/server";
import { adminProfile, requireAdmin } from "@/lib/adminAuth";

export async function GET(req: NextRequest) {
  const guard = await requireAdmin(req, { allowPendingPassword: true });
  if (guard.error) return guard.error;
  return NextResponse.json({ admin: adminProfile(guard.admin) }, { headers: { "Cache-Control": "no-store" } });
}
