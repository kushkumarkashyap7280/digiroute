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
- Public location pages: `/digipin/<PIN>` (and `/card/<PIN>` → redirects) — location only, never card data
- **Private share links:** `/c/<token>` shows a card (photos, note, phone, map) only to people holding the link; not indexed, not cached
- Account dashboard: create / edit / delete address cards with photos
- QR code generator and scanner modals
- PWA-ready, light & dark themes
- Android helpers: "Open in app" banner on location pages, APK download link

**API** (also consumed by the app)
- Email + password auth, JWT in an HTTP-only cookie (web) or `Bearer` token (app)
- Address cards: favorites, category, delivery note, contact phone, up to 2 photos
- **Private sharing:** every card has a random share token; the owner can switch sharing off, reset the link, set an expiry (24 h / 7 d) and hide the phone number
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
| PUT | `/api/cards/:id` | ✔ owner | any subset of the above; empty string clears an optional field. Sharing: `sharingEnabled`, `hidePhone`, `shareExpiry` (`none`\|`24h`\|`7d`), `resetShareLink: true` |
| DELETE | `/api/cards/:id` | ✔ owner | also deletes the card's Cloudinary images |
| GET | `/api/cards/shared/:token` | – | **the** public card lookup: only for an active share link; returns no owner id or photo ids; rate limited; counts a view |
| GET | `/api/cards/:id` | ✔ owner | one of your cards incl. sharing settings |
| GET | `/api/cards/digipin/:pin` | optional | **no longer exposes card data by DIGIPIN** (it is guessable from a location). Returns the card only to its signed-in owner, or for *legacy* cards until their owner resets the link; otherwise 404 |
| POST | `/api/upload/sign` | ✔ | signed Cloudinary upload parameters |
| POST | `/api/upload/cleanup` | ✔ | `{ publicIds }` — discards uploads whose save failed; only unused images in the caller's own folder are deleted |
| GET | `/api/digipin/encode` · `/decode` | – | conversion helpers |

**Sharing model.** A DIGIPIN is derived from a location, so it can never unlock
private data. Cards are shared through `shareToken` (128-bit random, `lib/shareLinks.ts`).
Cards created before this existed have no token: they get one the first time the
owner loads them and stay reachable by DIGIPIN (`legacyPublic`) until the owner
taps *Reset link*, so links that were already shared don't break.

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
| `ADMIN_SESSION_SECRET` | – | Optional separate signing key for admin sessions |
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
│   ├── admin/…                          Admin API (auth, stats, users, cards, admins, audit)
│   ├── cards/                           List/create · [id] update/delete · digipin/[pin] public lookup
│   ├── upload/sign/                     Cloudinary signed upload params
│   └── digipin/{encode,decode}/         Conversion helpers
├── digipin/[digipin]/ · card/[digipin]/ Public location pages (no card data)
├── c/[token]/                           Private shared card page
├── dashboard/ · login/ · signup/ · convert/ · about/ · location/[id]/
├── admin/                               Hidden admin panel (404 unless signed in)
components/                              UI (dashboard, QR modals, banners, forms)
lib/
├── digipin.ts        DIGIPIN encode/decode
├── session.ts        JWT sessions (cookie or Bearer), production secret check
├── rateLimit.ts      MongoDB fixed-window rate limiter
├── cardFields.ts     category / note / phone validation
├── mongoose.ts · cloudinary.ts · cloudinaryClient.ts
models/               User, AddressCard, RateLimit, Admin, AuditLog
(lib/shareLinks.ts: share tokens, expiry, what a link holder may see)
public/.well-known/   assetlinks.json (Android App Links)
```

---

## Admin panel

A separate, hidden admin area for the people running DigiRoute. There is **no link
to it anywhere**: press **Ctrl + Shift + K** on any page of the site to open the
sign-in modal (the shortcut is only a convenience — the security is the server).
Signed out, `/admin` is a plain 404.

| | Super admin (exactly one) | Sub-admin |
| --- | --- | --- |
| Analytics, users list, cards list (metadata) | ✔ | ✔ |
| Suspend / reactivate / delete users, reset their password | ✔ | – |
| Open a card's photos / note / phone (audited), remove a card | ✔ | – |
| Create, disable, reset the password of and delete sub-admins | ✔ | – |
| Audit log | ✔ | – |
| Change own password | ✔ | ✔ |

Sub-admins never see photos, notes or phone numbers, DIGIPINs are masked for them
and they can't search by DIGIPIN.

**Creating the super admin (one time, from your own machine).** A local-only setup page
does it — no script, nothing to run on the server:

1. In your local `.env.local` set `MONGODB_URI` to the database you want the admin in
   (even the production one), temporarily.
2. `npm run dev`, open <http://localhost:3000/dev/setup-admin>, and enter your name, email
   and a password (12+ characters, letters and numbers). The page shows which database it
   will write to and warns if it is remote.
3. Put your normal local `MONGODB_URI` back and restart the dev server.

The same page has an "I forgot my password" option to reset the existing super admin.

Why it can't be used on the live site — it needs **all** of these, and answers with a bare 404
otherwise (see `lib/adminBootstrap.ts`):
- `NODE_ENV` is exactly `development`. Next.js forces `production` for every build and
  deployment (production and preview alike), so a deployed site never passes this;
- not running on Vercel or CI;
- the request is addressed to `localhost`;
- no super admin exists yet (there can only be one; the reset mode only changes the password).

**Security notes**
- Admins are a separate collection from users; signing up can never create one.
- Own cookie (`__Host-` prefix on HTTPS), own signing key, 8-hour sessions,
  `SameSite=Strict`, checked against the database on **every** request — disabling an
  admin or changing a password signs them out immediately.
- State-changing requests need a custom header and a same-origin `Origin` (CSRF).
- Sign-in: 5 failed attempts per IP+email / 20 per IP per 15 min, account lock after
  8 failures, identical error for unknown / wrong / disabled, constant-time check.
- Temporary passwords are random, shown once and must be replaced at first sign-in.
- Every sign-in and change is written to the append-only audit log.
- Optional: set `ADMIN_SESSION_SECRET` to sign admin sessions with a key separate from `SESSION_SECRET`.

Suspending, resetting or deleting an **app user** takes effect at once: their sessions
are revoked (checked on every request, cached for at most 30 s per server instance).

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
