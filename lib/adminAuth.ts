// Admin authentication — SERVER ONLY. Never import from client components.
// Design notes:
// - The password never leaves the server and is compared with a timing-safe
//   check, so failed logins don't leak whether the guess was "close".
// - The session lives in an httpOnly + Secure + SameSite=Strict cookie, so
//   even a successful XSS injection in the page cannot read the token.
// - The token is HMAC-signed with the password itself; no server-side session
//   store needed (works across serverless instances).
import { createHmac, timingSafeEqual, createHash, randomBytes } from "crypto";
import type { NextRequest } from "next/server";

export const ADMIN_COOKIE = "pp_admin";
const SESSION_DAYS = 7;

function getPassword(): string {
  const p = process.env.ADMIN_PASSWORD;
  if (!p) throw new Error("ADMIN_PASSWORD is not configured");
  return p;
}

function hash(s: string): Buffer {
  return createHash("sha256").update(s, "utf8").digest();
}

/** Timing-safe password check (hashes first so lengths can't leak). */
export function verifyAdminPassword(input: unknown): boolean {
  if (typeof input !== "string" || input.length === 0) return false;
  try {
    return timingSafeEqual(hash(input), hash(getPassword()));
  } catch {
    return false;
  }
}

function b64url(buf: Buffer): string {
  return buf.toString("base64url");
}

/** Create a signed session token valid for SESSION_DAYS. */
export function createAdminSessionToken(): string {
  const payload = JSON.stringify({
    v: 1,
    exp: Date.now() + SESSION_DAYS * 24 * 60 * 60 * 1000,
    r: randomBytes(16).toString("hex"),
  });
  const sig = createHmac("sha256", getPassword()).update(payload).digest();
  return `${b64url(Buffer.from(payload, "utf8"))}.${b64url(sig)}`;
}

/** Verify a session token's signature and expiry. */
export function verifyAdminSessionToken(token: unknown): boolean {
  if (typeof token !== "string") return false;
  const parts = token.split(".");
  if (parts.length !== 2) return false;
  let payload: Buffer;
  let sig: Buffer;
  try {
    payload = Buffer.from(parts[0], "base64url");
    sig = Buffer.from(parts[1], "base64url");
  } catch {
    return false;
  }
  let expected: Buffer;
  try {
    expected = createHmac("sha256", getPassword()).update(payload).digest();
  } catch {
    return false;
  }
  if (sig.length !== expected.length) return false;
  if (!timingSafeEqual(sig, expected)) return false;
  try {
    const data = JSON.parse(payload.toString("utf8"));
    return (
      data.v === 1 && typeof data.exp === "number" && data.exp > Date.now()
    );
  } catch {
    return false;
  }
}

/** True when the request carries a valid admin session cookie. */
export function isAdminRequest(req: NextRequest): boolean {
  return verifyAdminSessionToken(req.cookies.get(ADMIN_COOKIE)?.value);
}

// --- login rate limiting (per serverless instance; defense in depth) --------
const attempts = new Map<string, { count: number; resetAt: number }>();
const WINDOW_MS = 60_000;
const MAX_ATTEMPTS = 8;

export function loginAllowed(ip: string): boolean {
  const now = Date.now();
  const rec = attempts.get(ip);
  if (!rec || rec.resetAt < now) {
    attempts.set(ip, { count: 1, resetAt: now + WINDOW_MS });
    return true;
  }
  rec.count += 1;
  return rec.count <= MAX_ATTEMPTS;
}

export function clientIp(req: NextRequest): string {
  return (
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown"
  );
}

export const sleep = (ms: number) =>
  new Promise((resolve) => setTimeout(resolve, ms));
