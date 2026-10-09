import mongoose, { Schema, Model } from "mongoose";

/** One document per (key, time-window) bucket; Mongo's TTL index deletes it afterwards. */
export interface IRateLimit {
  key: string;
  count: number;
  expiresAt: Date;
}

const RateLimitSchema = new Schema<IRateLimit>({
  key: { type: String, required: true, unique: true },
  count: { type: Number, default: 0 },
  expiresAt: { type: Date, required: true, index: { expireAfterSeconds: 0 } },
});

const RateLimit: Model<IRateLimit> =
  mongoose.models.RateLimit ?? mongoose.model<IRateLimit>("RateLimit", RateLimitSchema);

export default RateLimit;
