import { v2 as cloudinary } from "cloudinary";

let isConfigured = false;

export function configureCloudinary() {
  if (isConfigured) return cloudinary;

  const cloud_name = process.env.CLOUDINARY_CLOUD_NAME;
  const api_key = process.env.CLOUDINARY_API_KEY;
  const api_secret = process.env.CLOUDINARY_API_SECRET;

  if (cloud_name && api_key && api_secret) {
    cloudinary.config({
      cloud_name,
      api_key,
      api_secret,
      secure: true,
    });
    isConfigured = true;
  }

  return cloudinary;
}

export async function deleteCloudinaryImages(publicIds: string[]) {
  if (!publicIds || publicIds.length === 0) return;
  try {
    const c = configureCloudinary();
    await Promise.all(
      publicIds.map(async (pid) => {
        if (!pid) return;
        try {
          await c.uploader.destroy(pid);
        } catch (err) {
          console.warn(`[Cloudinary] Failed to delete image ${pid}:`, err);
        }
      })
    );
  } catch (err) {
    console.warn("[Cloudinary] Bulk delete error:", err);
  }
}

/** Every upload goes to `digiroute/<userId>/…` (see /api/upload/sign). */
export function userImagePrefix(userId: string): string {
  return `digiroute/${userId}/`;
}

/**
 * True when [id] is a Cloudinary public_id inside this user's own folder.
 * Without this check a client could claim someone else's image id on its own
 * card and later get it deleted.
 */
export function isOwnedImageId(userId: string, id: unknown): id is string {
  return typeof id === "string" && id.startsWith(userImagePrefix(userId)) && !id.includes("..");
}
