import crypto from "crypto";

/** Rules for admin passwords (12+ chars, letters and numbers, not trivially repetitive). */
export function validateAdminPassword(pw: unknown): string | null {
  if (typeof pw !== "string") return "Password is required.";
  if (pw.length < 12) return "Password must be at least 12 characters.";
  if (pw.length > 128) return "Password must be at most 128 characters.";
  if (!/[A-Za-z]/.test(pw) || !/\d/.test(pw)) return "Password must contain letters and numbers.";
  if (new Set(pw).size < 5) return "Password is too repetitive.";
  return null;
}

// No 0/O/1/l/I so a temporary password can be read out or typed without mistakes.
const ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789";

/** Random temporary password (shown once to the admin who triggers a reset). */
export function generateTempPassword(length = 16): string {
  let out = "";
  for (let i = 0; i < length; i++) out += ALPHABET[crypto.randomInt(ALPHABET.length)];
  return out;
}
