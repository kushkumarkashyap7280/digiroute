# DigiRoute — Web & API (Next.js)

Website **and backend** for DigiRoutes: converts locations to India Post
**DIGIPIN** codes (~4 m), stores shareable **address cards** (entrance photos,
delivery note, phone, category), and serves the API used by the Android app
([`digiroutes_app`](https://github.com/kushkumarkashyap7280/digiroutes_app)).

Live: <https://digiroutes.vercel.app>

---

## Features

**Website**
- DIGIPIN ⇄ coordinates converter, map view and Google Maps links
- Public location pages: `/digipin/<PIN>` (and `/card/<PIN>` → redirects)
- Account dashboard: create / edit / delete address cards with photos
- QR code generator and scanner modals
- PWA-ready, light & dark themes
- Android helpers: "Open in app" banner on location pages, APK download link

**API** (also consumed by the app)
- Email + password auth, JWT in an HTTP-only cookie (web) or `Bearer` token (app)
- Address cards: favorites, category, delivery note, contact phone, up to 2 photos
- Profile: name and avatar (old Cloudinary images are purged on replace/delete)
- Cloudinary **signed direct uploads** — image bytes never pass through the server
- Login/signup **rate limiting** backed by MongoDB (shared across serverless instances)
- Serves `/.well-known/assetlinks.json` for Android App Links

---

## API reference

| Method | Path | Auth | Notes |
| --- | --- | --- | --- |
| POST | `/api/auth/signup` | – | 5 per IP per hour; returns `token` |
| POST | `/api/auth/login` | – | 8 tries / 15 min per account+IP, 40 per IP; returns `token` |
| POST | `/api/auth/logout` | cookie | clears the session cookie |
| GET | `/api/auth/me` | ✔ | current user incl. `avatarUrl` |
| PUT | `/api/auth/me` | ✔ | `{ name?, avatarUrl?, avatarId? }` |
| DELETE | `/api/auth/me` | ✔ | `{ password }` — deletes the account, all cards, all photos and the avatar (5 attempts / hour) |
| GET | `/api/cards?cursor=&limit=&q=&category=&favorite=` | ✔ | own cards, newest first, cursor pagination; `q` searches title/address/DIGIPIN; the first page also returns `total` and `facets` `{all, favorites, categories}` |
| POST | `/api/cards` | ✔ | `{ digipin, title, humanAddress?, photoUrls?, photoIds?, isFavorite?, category?, deliveryNote?, contactPhone? }` |
| PUT | `/api/cards/:id` | ✔ owner | any subset of the above; empty string clears an optional field |
| DELETE | `/api/cards/:id` | ✔ owner | also deletes the card's Cloudinary images |
| GET | `/api/cards/digipin/:pin` | – | **public** lookup used by shared links and QR codes |
| POST | `/api/upload/sign` | ✔ | signed Cloudinary upload parameters |
| POST | `/api/upload/cleanup` | ✔ | `{ publicIds }` — discards uploads whose save failed; only unused images in the caller's own folder are deleted |
| GET | `/api/digipin/encode` · `/decode` | – | conversion helpers |

**Image safety:** every `photoIds` / `avatarId` the client sends must be inside
`digiroute/<userId>/` (only new ids are checked, so older cards keep working);
images are deleted from Cloudinary when a card/photo/avatar is replaced or
removed, and when a card or account is deleted.

Validation lives in `lib/cardFields.ts`: category ∈ `home | work | shop | family | other`,
delivery note ≤ 300 chars, phone `+?` and 7–15 digits.

> `contactPhone` and `deliveryNote` are returned by the **public** lookup on
> purpose (the visitor needs them). Only add information you're happy to share
> with anyone holding the link.

---

## Getting started

```bash
npm install
docker compose up -d      # local MongoDB (or point MONGODB_URI at Atlas)
cp sample.env .env.local  # then fill in the values below
npm run dev               # http://localhost:3000
# reachable from a phone on the same Wi-Fi:  npm run dev -- -H 0.0.0.0
```

### Environment variables (`.env.local`)

| Variable | Required | Purpose |
| --- | --- | --- |
| `MONGODB_URI` | ✔ | MongoDB connection string |
| `SESSION_SECRET` | ✔ in production | JWT signing secret. **Production deploys fail without it**; a dev fallback exists for local/preview only |
| `CLOUDINARY_CLOUD_NAME` · `CLOUDINARY_API_KEY` · `CLOUDINARY_API_SECRET` | ✔ for photos | Uploads (cloud name must match the key's account) |
| `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` | – | Optional; embeds work without it |

Generate a secret with `openssl rand -base64 48`. Changing `SESSION_SECRET` in
production signs every user out.

### Scripts

```bash
npm run dev     # development server
npm run build   # production build
npm run start   # serve the production build
npm run lint
```

Heads-up: after changing a Mongoose model, **restart `npm run dev`** — hot
reload keeps the old schema in memory and silently drops new fields.

---

## Project structure

```
app/
├── api/
│   ├── auth/{signup,login,logout,me}/   Auth + profile
│   ├── cards/                           List/create · [id] update/delete · digipin/[pin] public lookup
│   ├── upload/sign/                     Cloudinary signed upload params
│   └── digipin/{encode,decode}/         Conversion helpers
├── digipin/[digipin]/ · card/[digipin]/ Public location pages
├── dashboard/ · login/ · signup/ · convert/ · about/ · location/[id]/
components/                              UI (dashboard, QR modals, banners, forms)
lib/
├── digipin.ts        DIGIPIN encode/decode
├── session.ts        JWT sessions (cookie or Bearer), production secret check
├── rateLimit.ts      MongoDB fixed-window rate limiter
├── cardFields.ts     category / note / phone validation
├── mongoose.ts · cloudinary.ts · cloudinaryClient.ts
models/               User, AddressCard, RateLimit
public/.well-known/   assetlinks.json (Android App Links)
```

---

## Android App Links

`public/.well-known/assetlinks.json` lists the Android package
(`com.example.digiroutes_app`) and the SHA-256 fingerprints of the keys the app
is signed with (release/upload key and the debug key). If the app's signing key
changes, add the new fingerprint here, otherwise `/card/…` and `/digipin/…`
links stop opening in the app.

---

## Deploying (Vercel)

1. Set the environment variables above for **Production** (at least
   `MONGODB_URI`, `SESSION_SECRET`, Cloudinary keys).
2. Push/merge to `main` — Vercel builds and deploys.
3. Verify `https://<domain>/.well-known/assetlinks.json` returns JSON.
