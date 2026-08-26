# DigiRoute — MVP Plan

## Problem
- Shared locations (text address, dropped pins) are inaccurate by 15-20m — enough to send a delivery/visitor to the wrong gate.
- Text-searched addresses on Google Maps often resolve to a nearby landmark, not the actual door.

## Solution
DIGIPIN encodes lat/long into a reversible 10-character code (~4m×4m precision). Pair that code with a photo of the actual entrance so anyone opening the shared link recognizes the destination before they arrive, then hand off to a map for final navigation.

## Scope for this MVP
Building now: DIGIPIN encode/decode, address card creation (photo + code), public share links, login/dashboard, map display.
Deferred to later (not this cycle): SOS/emergency alerts, Community Incident Reporter, OTP/Google OAuth, offline mode.

`realtime-server` (Socket.io) stays in the repo as-is but is not wired into anything yet — it's reserved for the SOS feature later.

---

## Tech Stack
- **Frontend + Backend:** Next.js (`main-server`) — single app, API routes handle backend logic
- **Database:** MongoDB via Mongoose
- **Map:** Leaflet + OpenStreetMap (`react-leaflet`) — free, no API key, no logo requirement. "Navigate" button deep-links to `https://www.google.com/maps?q={lat},{lng}` for actual turn-by-turn.
- **Auth:** Email + password (bcrypt-hashed), session-based — no OTP/OAuth in MVP
- **Geolocation source:** Browser Geolocation API
- **DIGIPIN:** `digipin.js` (already have this — India Post's open-source encode/decode)

---

## Data Models (Mongoose)

### User
```
{
  _id
  email          (unique, required)
  passwordHash   (required)
  name           (required)
  createdAt
  updatedAt
}
```

### AddressCard
```
{
  _id
  digipin        (10-char code, indexed)
  ownerId        (ref: User, required)
  title          (e.g. "Home", "Shop entrance")
  photoUrl       (max 2 images)
  humanAddress   (free-text, optional — for display only, not used for lookup)
  createdAt
  updatedAt
}
```
Kept `digipin` and `humanAddress` as two separate fields on purpose: `digipin` is the precise, lookup key; `humanAddress` is just a friendly label shown alongside it, never used to compute location.

*(Admin model, TTL, and multi-image beyond 2 — deferred; not needed for MVP demo)*

---

## Pages / Routes

| Route | Access | Purpose |
|---|---|---|
| `/` | Public | Landing + a "Try DIGIPIN" widget: get current location → show DIGIPIN + map, no login needed, nothing saved |
| `/login` | Public | Login |
| `/signup` | Public | Signup |
| `/dashboard` | Logged-in | List of the user's saved AddressCards; create new one |
| `/card/[digipin]` | Public | View a specific saved card — photo, address, map, Navigate button. This is the link people actually share. |

Dropped the earlier `?pin=` vs `?digipin_code=` split — one route (`/card/[digipin]`) serves both logged-out viewers and the owner; the DB lookup either finds a saved card or, if not found, the page still renders a bare DIGIPIN → coordinates decode with no photo. Simpler for the demo, one code path.

---

## Core Flow (MVP)

1. **Anyone**, no login: on `/`, browser Geolocation gives lat/lng → `getDigiPin()` converts it → show the code + a Leaflet map pin. They can copy/share the code as-is (this alone demonstrates the DIGIPIN concept live in your presentation).
2. **Signup/Login** (email + password).
3. **Create an AddressCard** from `/dashboard`: capture current location → DIGIPIN generated automatically → user uploads 1-2 photos of the entrance → add a title/human-readable label → save.
4. **Share**: dashboard shows a copyable link `/card/{digipin}`.
5. **Recipient opens the link** (no login needed): sees the photo, the label, and a map with a "Navigate" button that opens Google Maps at the decoded coordinates.

---

## Build Order (suggested, for the team)
1. `digipin.js` cleanup (remove the dead `str`/no-op line) + wire into a small utils module — quick win, unblocks everyone else.
2. Mongoose models + MongoDB connection.
3. Auth (signup/login, session cookies).
4. `/` public DIGIPIN try-it widget (Leaflet + Geolocation + digipin.js — no DB yet).
5. AddressCard CRUD + image upload (dashboard).
6. `/card/[digipin]` public view page.
7. Polish: loading states, mobile layout check (Leaflet + Next.js SSR gotcha — must dynamic-import the map component with `ssr: false`).

Everything after this (SOS via `realtime-server`, incident reporting, offline mode) is future-scope talking points for the presentation, not build targets for this MVP.
