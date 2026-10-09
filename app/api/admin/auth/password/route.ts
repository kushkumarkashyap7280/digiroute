/** POST /api/admin/auth/password { currentPassword, newPassword } — change your own password. */

import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { adminProfile, requireAdmin, setAdminCookie, signAdminToken } from "@/lib/adminAuth";
import { audit } from "@/lib/audit";
import { validateAdminPassword } from "@/lib/passwords";
import { checkRateLimit, clientIp, tooManyRequests } from "@/lib/rateLimit";

export async function POST(req: NextRequest) {
  const guard = await requireAdmin(req, { allowPendingPassword: true });
  if (guard.error) return guard.error;
  const admin = guard.admin;

  const limited = await checkRateLimit(`admin-pw:${clientIp(req)}:${admin._id}`, 8, 15 * 60);
  if (!limited.ok) return tooManyRequests(limited.retryAfterSec);

  const { currentPassword, newPassword } = await req.json().catch(() => ({}));
  if (!(await bcrypt.compare(String(currentPassword ?? ""), admin.passwordHash)))
    return NextResponse.json({ error: "Current password is incorrect." }, { status: 403 });

  const problem = validateAdminPassword(newPassword);
  if (problem) return NextResponse.json({ error: problem }, { status: 400 });
  if (newPassword === currentPassword)
    return NextResponse.json({ error: "Choose a different password." }, { status: 400 });

  admin.passwordHash = await bcrypt.hash(newPassword, 12);
  admin.mustChangePassword = false;
  admin.sessionVersion += 1; // signs out every other session of this admin
  await admin.save();

  await setAdminCookie(await signAdminToken(admin)); // keep THIS session alive
  await audit(admin, "password.change", { req });
  return NextResponse.json({ admin: adminProfile(admin) }, { headers: { "Cache-Control": "no-store" } });
}
