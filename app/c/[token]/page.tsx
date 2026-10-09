import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { headers } from "next/headers";
import { getLatLngFromDigiPin } from "@/lib/digipin";
import { checkRateLimit } from "@/lib/rateLimit";
import { findSharedCard, publicCardView } from "@/lib/shareLinks";
import SharedCardView from "@/components/SharedCardView";

// Always rendered per request: availability depends on the owner's current
// settings (on/off, expiry, reset) and must never be cached or indexed.
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Shared location",
  description: "A location shared with you on DigiRoutes.",
  robots: { index: false, follow: false, nocache: true },
  referrer: "no-referrer",
};

export default async function SharedCardPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;

  const h = await headers();
  const ip = h.get("x-forwarded-for")?.split(",")[0].trim() ?? "unknown";
  const limited = await checkRateLimit(`shared-page:${ip}`, 60, 60);
  const card = limited.ok ? await findSharedCard(token, { countView: true }) : null;

  if (!card) {
    if (!limited.ok) return <SharedCardView card={null} coords={null} rateLimited />;
    notFound(); // real 404 status; see not-found.tsx for the friendly message
  }

  let coords: { latitude: string; longitude: string } | null = null;
  try {
    coords = getLatLngFromDigiPin(card.digipin);
  } catch {
    /* invalid pin: show the card without a map */
  }

  return <SharedCardView card={publicCardView(card)} coords={coords} />;
}
