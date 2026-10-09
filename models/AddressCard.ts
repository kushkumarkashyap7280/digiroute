import mongoose, { Schema, Document, Model, Types } from "mongoose";

export interface IAddressCard extends Document {
  digipin: string;
  ownerId: Types.ObjectId;
  title: string;
  photoUrls: string[];     // Cloudinary secure_url — for display
  photoIds:  string[];     // Cloudinary public_id  — for deletion (cleanup on delete / TTL)
  humanAddress?: string;   // display-only label, never used for geolookup
  isFavorite: boolean;     // pinned by owner
  category: string;        // home | work | shop | family | other | ""
  deliveryNote: string;    // e.g. "Ring the bell twice" (max 300)
  contactPhone: string;    // shown on the shared card for call / WhatsApp
  // ── Sharing (see lib/shareLinks.ts) ──
  shareToken?: string;     // random, unguessable id used in /c/<token> links and QR codes
  sharingEnabled: boolean; // owner switch: false = link is dead, card is private
  shareExpiresAt?: Date | null; // link stops working after this time
  hidePhone: boolean;      // omit contactPhone from the shared view
  legacyPublic: boolean;   // old DIGIPIN-based link still works (grace period) until the owner resets the link
  viewCount: number;       // how many times the shared link was opened
  createdAt: Date;
  updatedAt: Date;
}

const AddressCardSchema = new Schema<IAddressCard>(
  {
    digipin:      { type: String, required: true, index: true },
    ownerId:      { type: Schema.Types.ObjectId, ref: "User", required: true },
    title:        { type: String, required: true, trim: true },
    photoUrls:    {
      type: [String],
      default: [],
      validate: {
        validator: (v: string[]) => v.length <= 2,
        message: "Maximum 2 photos per card.",
      },
    },
    photoIds:     {
      type: [String],
      default: [],
      validate: {
        validator: (v: string[]) => v.length <= 2,
        message: "Maximum 2 photo IDs per card.",
      },
    },
    humanAddress: { type: String, default: "" },
    isFavorite:   { type: Boolean, default: false },
    category:     { type: String, enum: ["", "home", "work", "shop", "family", "other"], default: "" },
    deliveryNote: { type: String, default: "", maxlength: 300 },
    contactPhone: { type: String, default: "" },
    shareToken:     { type: String, index: { unique: true, sparse: true } },
    sharingEnabled: { type: Boolean, default: true },
    shareExpiresAt: { type: Date, default: null },
    hidePhone:      { type: Boolean, default: false },
    legacyPublic:   { type: Boolean, default: false },
    viewCount:      { type: Number, default: 0 },
  },
  { timestamps: true }
);

const AddressCard: Model<IAddressCard> =
  mongoose.models.AddressCard ??
  mongoose.model<IAddressCard>("AddressCard", AddressCardSchema);

export default AddressCard;
