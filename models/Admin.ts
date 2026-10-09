import mongoose, { Schema, Document, Model, Types } from "mongoose";

/**
 * Admin accounts live in their own collection — completely separate from app
 * users — so nobody can become an admin by signing up, and admin credentials
 * and sessions never mix with user ones.
 *
 *  super — exactly one, created by scripts/create-super-admin.mjs. Manages
 *          sub-admins and users, can delete data, sees the audit log.
 *  sub   — created by the super admin. Read-only: analytics, lists.
 */
export interface IAdmin extends Document {
  email: string;
  name: string;
  passwordHash: string;
  role: "super" | "sub";
  status: "active" | "disabled";
  mustChangePassword: boolean; // set after a reset / on creation: forced to choose their own
  sessionVersion: number;      // bump to sign this admin out everywhere
  failedLogins: number;
  lockedUntil?: Date | null;
  lastLoginAt?: Date;
  createdBy?: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const AdminSchema = new Schema<IAdmin>(
  {
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    name: { type: String, required: true, trim: true },
    passwordHash: { type: String, required: true },
    role: { type: String, enum: ["super", "sub"], required: true },
    status: { type: String, enum: ["active", "disabled"], default: "active" },
    mustChangePassword: { type: Boolean, default: false },
    sessionVersion: { type: Number, default: 0 },
    failedLogins: { type: Number, default: 0 },
    lockedUntil: { type: Date, default: null },
    lastLoginAt: { type: Date },
    createdBy: { type: Schema.Types.ObjectId, ref: "Admin" },
  },
  { timestamps: true }
);

const Admin: Model<IAdmin> =
  mongoose.models.Admin ?? mongoose.model<IAdmin>("Admin", AdminSchema);

export default Admin;
