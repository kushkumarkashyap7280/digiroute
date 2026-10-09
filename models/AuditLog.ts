import mongoose, { Schema, Model, Types } from "mongoose";

/** Append-only record of admin activity (logins, resets, deletions…). */
export interface IAuditLog {
  adminId?: Types.ObjectId;
  adminEmail: string;
  action: string;          // e.g. "user.suspend", "admin.create", "login.failed"
  targetType?: string;     // "user" | "card" | "admin"
  targetId?: string;
  meta?: Record<string, unknown>;
  ip?: string;
  createdAt: Date;
}

const AuditLogSchema = new Schema<IAuditLog>(
  {
    adminId: { type: Schema.Types.ObjectId, ref: "Admin" },
    adminEmail: { type: String, required: true },
    action: { type: String, required: true, index: true },
    targetType: String,
    targetId: String,
    meta: Schema.Types.Mixed,
    ip: String,
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);
AuditLogSchema.index({ createdAt: -1 });

const AuditLog: Model<IAuditLog> =
  mongoose.models.AuditLog ?? mongoose.model<IAuditLog>("AuditLog", AuditLogSchema);

export default AuditLog;
