/**
 * Client-side helper for direct browser-to-Cloudinary image uploads.
 * Requests signed upload parameters from /api/upload/sign, then uploads directly
 * to Cloudinary's upload API without passing image bytes through Next.js server.
 */

export async function uploadToCloudinary(file: File): Promise<{ url: string; public_id: string }> {
  const signRes = await fetch("/api/upload/sign", { method: "POST" });
  if (!signRes.ok) {
    const d = await signRes.json().catch(() => ({}));
    throw new Error(d.error ?? "Failed to get upload signature.");
  }
  const { timestamp, signature, folder, api_key, cloud_name } = await signRes.json();

  const fd = new FormData();
  fd.append("file", file);
  fd.append("timestamp", String(timestamp));
  fd.append("signature", signature);
  fd.append("api_key", api_key);
  fd.append("folder", folder);

  const uploadRes = await fetch(
    `https://api.cloudinary.com/v1_1/${cloud_name}/image/upload`,
    { method: "POST", body: fd }
  );
  if (!uploadRes.ok) {
    const d = await uploadRes.json().catch(() => ({}));
    throw new Error(d.error?.message ?? "Cloudinary upload failed.");
  }
  const result = await uploadRes.json();
  return { url: result.secure_url, public_id: result.public_id };
}

/**
 * Generates an ultra-lightweight optimized thumbnail URL from Cloudinary.
 * Reduces bandwidth dramatically for dashboard lists by serving auto-formatted,
 * auto-compressed low-resolution image previews.
 */
export function getThumbnailUrl(url?: string, width = 360, height = 240): string {
  if (!url) return "";
  if (url.includes("res.cloudinary.com") && url.includes("/image/upload/")) {
    return url.replace("/image/upload/", `/image/upload/w_${width},h_${height},c_fill,q_auto:low,f_auto/`);
  }
  return url;
}
