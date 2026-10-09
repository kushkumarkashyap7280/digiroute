import mongoose, { Schema, Document, Model } from "mongoose";

export interface IUser extends Document {
  email: string;
  passwordHash: string;
  name: string;
  avatarUrl?: string;   // Cloudinary secure_url
  avatarId?: string;    // Cloudinary public_id (for cleanup)
  status: "active" | "suspended"; // suspended users cannot log in or use the API
  sessionVersion: number; // bump to sign the user out everywhere (password reset, suspend)
  lastLoginAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>(
  {
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: true },
    name: { type: String, required: true, trim: true },
    avatarUrl: { type: String, default: "" },
    avatarId: { type: String, default: "" },
    status: { type: String, enum: ["active", "suspended"], default: "active" },
    sessionVersion: { type: Number, default: 0 },
    lastLoginAt: { type: Date },
  },
  { timestamps: true }
);

const User: Model<IUser> =
  mongoose.models.User ?? mongoose.model<IUser>("User", UserSchema);

export default User;
