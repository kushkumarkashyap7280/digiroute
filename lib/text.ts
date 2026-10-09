/** Escapes user text so it can be used literally inside a RegExp. */
export function escapeRegex(text: string) {
  return text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/** "39J49LL8T4" → "39J•••••••": admins without card access see only a region hint. */
export function maskDigipin(pin: string) {
  return pin ? `${pin.slice(0, 3)}•••••••` : "";
}
