/**
 * lib/session.ts
 * Dual cookie-based and Bearer token auth session management using jose (HS256 JWT).
 * Supports Next.js App Router cookies() for Web and Authorization: Bearer <token> for Mobile/API clients.
 */

import { cookies } from "next/headers";
import { NextRequest } from "next/server";
import { SignJWT, jwtVerify } from "jose";

const SECRET = new TextEncoder().encode(
  process.env.SESSION_SECRET ?? "change-me-in-production-32-chars!!"
);

const COOKIE_NAME = "digiroute_session";
const MAX_AGE_SEC = 60 * 60 * 24 * 7; // 7 days

export interface SessionPayload {
  userId: string;
  name: string;
  email: string;
}

// ---------------------------------------------------------------------------
// Sign Token (for Bearer responses and Cookies)
// ---------------------------------------------------------------------------
export async function signToken(payload: SessionPayload): Promise<string> {
  return new SignJWT(payload as unknown as Record<string, unknown>)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${MAX_AGE_SEC}s`)
    .sign(SECRET);
}

// ---------------------------------------------------------------------------
// Write (set cookie)
// ---------------------------------------------------------------------------
export async function createSession(payload: SessionPayload): Promise<string> {
  const token = await signToken(payload);

  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: MAX_AGE_SEC,
    path: "/",
  });

  return token;
}

// ---------------------------------------------------------------------------
// Read (verify Authorization header or cookie)
// ---------------------------------------------------------------------------
export async function getSession(req?: NextRequest): Promise<SessionPayload | null> {
  // 1. Check Bearer token in Authorization header (mobile clients)
  if (req) {
    const authHeader = req.headers.get("authorization");
    if (authHeader?.startsWith("Bearer ")) {
      const token = authHeader.substring(7).trim();
      try {
        const { payload } = await jwtVerify(token, SECRET);
        return payload as unknown as SessionPayload;
      } catch {
        return null;
      }
    }
  }

  // 2. Fallback to cookie (web browser clients)
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(COOKIE_NAME)?.value;
    if (!token) return null;

    const { payload } = await jwtVerify(token, SECRET);
    return payload as unknown as SessionPayload;
  } catch {
    return null;
  }
}

// ---------------------------------------------------------------------------
// Destroy (clear cookie)
// ---------------------------------------------------------------------------
export async function destroySession(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(COOKIE_NAME);
}
