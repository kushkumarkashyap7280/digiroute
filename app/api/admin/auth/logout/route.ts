import { NextRequest, NextResponse } from "next/server";
import { audit } from "@/lib/audit";
import { clearAdminCookie, requireAdmin } from "@/lib/adminAuth";

export async function POST(req: NextRequest) {
  const guard = await requireAdmin(req, { allowPendingPassword: true });
  if (guard.error) {
    await clearAdminCookie();
    return NextResponse.json({ message: "Signed out." });
  }
  await audit(guard.admin, "logout", { req });
  await clearAdminCookie();
  return NextResponse.json({ message: "Signed out." }, { headers: { "Cache-Control": "no-store" } });
}
