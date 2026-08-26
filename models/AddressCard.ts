import mongoose, { Schema, Document, Model, Types } from "mongoose";

export interface IAddressCard extends Document {
  digipin: string;
  ownerId: Types.ObjectId;
  title: string;
  photoUrls: string[];     // Cloudinary secure_url — for display
  photoIds:  string[];     // Cloudinary public_id  — for deletion (cleanup on delete / TTL)
  humanAddress?: string;   // display-only label, never used for geolookup
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
  },
  { timestamps: true }
);

const AddressCard: Model<IAddressCard> =
  mongoose.models.AddressCard ??
  mongoose.model<IAddressCard>("AddressCard", AddressCardSchema);

export default AddressCard;
