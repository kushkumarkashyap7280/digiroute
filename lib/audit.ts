import { NextRequest } from "next/server";
import AuditLog from "@/models/AuditLog";
import { clientIp } from "@/lib/rateLimit";

/** Records an admin action. Never throws — auditing must not break the request. */
export async function audit(
  admin: { _id: unknown; email: string } | null,
  action: string,
  opts: {
    req?: NextRequest;
    targetType?: string;
    targetId?: string;
    meta?: Record<string, unknown>;
    email?: string; // for events with no admin yet (failed logins)
  } = {}
) {
  try {
    await AuditLog.create({
      adminId: admin?._id as never,
      adminEmail: admin?.email ?? opts.email ?? "unknown",
      action,
      targetType: opts.targetType,
      targetId: opts.targetId,
      meta: opts.meta,
      ip: opts.req ? clientIp(opts.req) : undefined,
    });
  } catch (err) {
    console.error("[audit]", err);
  }
}
