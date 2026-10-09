/**
 * Private share links for address cards.
 *
 * A card is reachable by strangers only through `/c/<shareToken>` — a random
 * 128-bit id that can't be derived from a location (unlike a DIGIPIN, which
 * anyone can compute). The owner can switch sharing off, reset the token or
 * give the link an expiry. Cards created before this existed have no token and
 * stay reachable by DIGIPIN (`legacyPublic`) until the owner resets the link.
 */

import crypto from "crypto";
import { connectDB } from "@/lib/mongoose";
import AddressCard, { IAddressCard } from "@/models/AddressCard";

export const TOKEN_RE = /^[A-Za-z0-9_-]{22}$/;

export function newShareToken(): string {
  return crypto.randomBytes(16).toString("base64url"); // 22 chars
}

export type ShareExpiry = "none" | "24h" | "7d";

/** Maps the API value to a date: undefined = leave unchanged, null = never. */
export function expiryToDate(value: unknown, now = new Date()): Date | null | undefined {
  if (value === undefined) return undefined;
  if (value === "none" || value === null || value === "") return null;
  if (value === "24h") return new Date(now.getTime() + 24 * 60 * 60 * 1000);
  if (value === "7d") return new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
  throw new Error('shareExpiry must be "none", "24h" or "7d".');
}

type Shareable = Pick<IAddressCard, "sharingEnabled" | "shareExpiresAt">;

/** Link is switched on and not expired. */
export function isShareActive(card: Shareable, now = new Date()): boolean {
  if (card.sharingEnabled === false) return false;
  return !card.shareExpiresAt || new Date(card.shareExpiresAt) > now;
}

/** What a stranger holding the link may see: no owner id, no Cloudinary ids. */
export function publicCardView(card: IAddressCard) {
  return {
    _id: String(card._id),
    digipin: card.digipin,
    title: card.title,
    humanAddress: card.humanAddress ?? "",
    photoUrls: card.photoUrls ?? [],
    category: card.category ?? "",
    deliveryNote: card.deliveryNote ?? "",
    contactPhone: card.hidePhone ? "" : card.contactPhone ?? "",
    createdAt: card.createdAt,
  };
}

/** Looks a card up by its share token; null unless the link is currently active. */
export async function findSharedCard(token: string, opts: { countView?: boolean } = {}) {
  if (!TOKEN_RE.test(token)) return null;
  await connectDB();
  const card = await AddressCard.findOne({ shareToken: token });
  if (!card || !isShareActive(card)) return null;
  if (opts.countView) {
    await AddressCard.updateOne({ _id: card._id }, { $inc: { viewCount: 1 } });
  }
  return card;
}

/**
 * Gives every card that has no token one (marking it `legacyPublic` so its old
 * DIGIPIN link keeps working). Mutates the passed objects so the response
 * already contains the token. Safe to call repeatedly / concurrently.
 */
export async function backfillShareTokens(cards: Array<Record<string, any>>) { // eslint-disable-line @typescript-eslint/no-explicit-any
  const missing = cards.filter((c) => !c.shareToken);
  if (missing.length === 0) return;
  const ops = missing.map((c) => {
    const token = newShareToken();
    c.shareToken = token;
    c.legacyPublic = true;
    c.sharingEnabled = c.sharingEnabled ?? true;
    return {
      updateOne: {
        filter: { _id: c._id, shareToken: { $exists: false } },
        update: { $set: { shareToken: token, legacyPublic: true, sharingEnabled: true } },
      },
    };
  });
  await AddressCard.bulkWrite(ops);

  // A concurrent request may have won the race for some cards: report the
  // tokens that were actually stored.
  const stored = await AddressCard.find({ _id: { $in: missing.map((c) => c._id) } })
    .select("shareToken legacyPublic")
    .lean();
  const byId = new Map(stored.map((d) => [String(d._id), d]));
  for (const c of missing) {
    const d = byId.get(String(c._id));
    if (d?.shareToken) {
      c.shareToken = d.shareToken;
      c.legacyPublic = d.legacyPublic;
    }
  }
}
