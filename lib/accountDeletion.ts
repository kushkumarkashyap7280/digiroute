import AddressCard from "@/models/AddressCard";
import User, { IUser } from "@/models/User";
import { deleteCloudinaryImages } from "@/lib/cloudinary";
import { forgetSessionCache } from "@/lib/session";

/**
 * Permanently removes a user together with everything they own: every card,
 * all card photos, the avatar, and finally the account itself. Used by both
 * "delete my account" and the admin panel.
 */
export async function deleteUserAndData(user: IUser): Promise<{ cards: number; images: number }> {
  const cards = await AddressCard.find({ ownerId: user._id }).select("photoIds").lean();
  const imageIds = [
    ...cards.flatMap((c) => c.photoIds ?? []),
    ...(user.avatarId ? [user.avatarId] : []),
  ];
  await deleteCloudinaryImages(imageIds);
  await AddressCard.deleteMany({ ownerId: user._id });
  await User.deleteOne({ _id: user._id });
  forgetSessionCache(String(user._id));
  return { cards: cards.length, images: imageIds.length };
}
