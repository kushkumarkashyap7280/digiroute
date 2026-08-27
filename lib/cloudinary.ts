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
