/**
 * Validation/normalisation for the optional "extras" on an address card:
 * category, delivery note and contact phone. Used by POST /api/cards and
 * PUT /api/cards/[id]. Each field is only validated when present, and an
 * empty string clears it.
 */

export const CATEGORIES = ["home", "work", "shop", "family", "other"] as const;
export type Category = (typeof CATEGORIES)[number];

export const NOTE_MAX = 300;

export interface CardExtras {
  category?: Category | "";
  deliveryNote?: string;
  contactPhone?: string;
}

type Result = { ok: true; value: CardExtras } | { ok: false; error: string };

export function parseCardExtras(input: {
  category?: unknown;
  deliveryNote?: unknown;
  contactPhone?: unknown;
}): Result {
  const value: CardExtras = {};

  if (input.category !== undefined) {
    const c = String(input.category ?? "").trim().toLowerCase();
    if (c !== "" && !(CATEGORIES as readonly string[]).includes(c))
      return { ok: false, error: `Category must be one of: ${CATEGORIES.join(", ")}.` };
    value.category = c as Category | "";
  }

  if (input.deliveryNote !== undefined) {
    const n = String(input.deliveryNote ?? "").trim();
    if (n.length > NOTE_MAX)
      return { ok: false, error: `Delivery note must be at most ${NOTE_MAX} characters.` };
    value.deliveryNote = n;
  }

  if (input.contactPhone !== undefined) {
    const raw = String(input.contactPhone ?? "").trim();
    if (raw === "") {
      value.contactPhone = "";
    } else {
      const cleaned = raw.replace(/[\s\-().]/g, "");
      if (!/^\+?\d{7,15}$/.test(cleaned))
        return { ok: false, error: "Enter a valid phone number (7–15 digits, optional +)." };
      value.contactPhone = cleaned;
    }
  }

  return { ok: true, value };
}
