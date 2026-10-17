export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import {
  ADMIN_COOKIE,
  clientIp,
  createAdminSessionToken,
  loginAllowed,
  sleep,
  verifyAdminPassword,
} from "@/lib/adminAuth";

// POST /api/admin/login — { password }. Sets an httpOnly session cookie.
// The password travels only in the JSON body over HTTPS (never in a URL,
// never logged). Failed attempts are rate-limited and deliberately slowed.
export async function POST(req: NextRequest) {
  const ip = clientIp(req);
  if (!loginAllowed(ip)) {
    await sleep(1000);
    return NextResponse.json(
      { error: "Too many attempts. Try again in a minute." },
      { status: 429 }
    );
  }

  let password: unknown;
  try {
    password = (await req.json()).password;
  } catch {
    password = undefined;
  }

  if (!verifyAdminPassword(password)) {
    // Constant delay so timing doesn't reveal anything.
    await sleep(600);
    return NextResponse.json(
      { error: "Invalid password." },
      { status: 401 }
    );
  }

  const res = NextResponse.json({ ok: true });
  res.cookies.set(ADMIN_COOKIE, createAdminSessionToken(), {
    httpOnly: true, // JavaScript (and any injected script) cannot read it
    secure: true, // HTTPS only — can't be picked off in transit
    sameSite: "strict", // not sent on cross-site requests (CSRF protection)
    path: "/",
    maxAge: 7 * 24 * 60 * 60,
  });
  return res;
}
