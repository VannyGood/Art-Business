import { createHmac, timingSafeEqual } from "node:crypto";
import { getCookie, setCookie, deleteCookie, type H3Event } from "h3";

const COOKIE_NAME = "admin_session";

function base64UrlEncode(input: string) {
  return Buffer.from(input, "utf8")
    .toString("base64")
    .replaceAll("+", "-")
    .replaceAll("/", "_")
    .replaceAll("=", "");
}

function base64UrlDecode(input: string) {
  const pad = input.length % 4 === 0 ? "" : "=".repeat(4 - (input.length % 4));
  const b64 = input.replaceAll("-", "+").replaceAll("_", "/") + pad;
  return Buffer.from(b64, "base64").toString("utf8");
}

function sign(secret: string, payloadB64: string) {
  return createHmac("sha256", secret).update(payloadB64).digest("hex");
}

export function requireAdminConfig() {
  const password = process.env.ADMIN_PASSWORD;
  const secret = process.env.ADMIN_SESSION_SECRET;
  if (!password) throw new Error("ADMIN_PASSWORD is required");
  if (!secret) throw new Error("ADMIN_SESSION_SECRET is required");
  return { password, secret };
}

export function setAdminSession(event: H3Event) {
  const { secret } = requireAdminConfig();
  const payload = base64UrlEncode(JSON.stringify({ v: 1, ts: Date.now() }));
  const sig = sign(secret, payload);
  const value = `${payload}.${sig}`;
  setCookie(event, COOKIE_NAME, value, {
    httpOnly: true,
    sameSite: "lax",
    // Local dev is HTTP; browsers ignore Secure cookies there, so login would never stick.
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 14,
  });
}

export function clearAdminSession(event: H3Event) {
  deleteCookie(event, COOKIE_NAME, { path: "/" });
}

export function isAdminAuthed(event: H3Event) {
  const cookie = getCookie(event, COOKIE_NAME);
  if (!cookie) return false;

  const { secret } = requireAdminConfig();
  const [payload, sig] = cookie.split(".");
  if (!payload || !sig) return false;

  const expected = sign(secret, payload);
  try {
    const a = Buffer.from(sig, "hex");
    const b = Buffer.from(expected, "hex");
    if (a.length !== b.length) return false;
    if (!timingSafeEqual(a, b)) return false;
  } catch {
    return false;
  }

  try {
    const decoded = JSON.parse(base64UrlDecode(payload)) as { ts?: number };
    if (!decoded.ts) return false;
    // 30 days hard-expiry (cookie also has maxAge)
    if (Date.now() - decoded.ts > 1000 * 60 * 60 * 24 * 30) return false;
  } catch {
    return false;
  }

  return true;
}
