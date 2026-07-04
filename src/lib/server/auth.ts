// ─────────────────────────────────────────────────────────────────────────────
// Server-side auth: password hashing (scrypt) + signed session cookie.
// No external service required.
// ─────────────────────────────────────────────────────────────────────────────

import "server-only";
import crypto from "node:crypto";
import { cookies } from "next/headers";
import type { NextResponse } from "next/server";
import { getUser, type ServerUser } from "./db";
import { ADMIN_EMAIL } from "@/lib/types";

const SESSION_COOKIE = "nh_session";
const SESSION_SECRET = process.env.SESSION_SECRET || "nexthire-dev-secret-change-me";
const MAX_AGE = 60 * 60 * 24 * 30; // 30 days

// ── Passwords ────────────────────────────────────────────────────────────────
export function hashPassword(password: string): string {
  const salt = crypto.randomBytes(16).toString("hex");
  const hash = crypto.scryptSync(password, salt, 64).toString("hex");
  return `${salt}:${hash}`;
}

export function verifyPassword(password: string, stored: string): boolean {
  const [salt, hash] = stored.split(":");
  if (!salt || !hash) return false;
  const test = crypto.scryptSync(password, salt, 64);
  const ref = Buffer.from(hash, "hex");
  return test.length === ref.length && crypto.timingSafeEqual(test, ref);
}

// ── Session token (userId signed with HMAC) ──────────────────────────────────
function sign(userId: string): string {
  const mac = crypto.createHmac("sha256", SESSION_SECRET).update(userId).digest("hex");
  return `${userId}.${mac}`;
}

function unsign(token: string): string | null {
  const i = token.lastIndexOf(".");
  if (i < 0) return null;
  const userId = token.slice(0, i);
  const mac = token.slice(i + 1);
  const expected = crypto.createHmac("sha256", SESSION_SECRET).update(userId).digest("hex");
  try {
    if (crypto.timingSafeEqual(Buffer.from(mac), Buffer.from(expected))) return userId;
  } catch {
    /* fallthrough */
  }
  return null;
}

export function setSessionCookie(res: NextResponse, userId: string) {
  res.cookies.set(SESSION_COOKIE, sign(userId), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: MAX_AGE,
  });
}

export function clearSessionCookie(res: NextResponse) {
  res.cookies.set(SESSION_COOKIE, "", { httpOnly: true, path: "/", maxAge: 0 });
}

/** Resolve the signed-in user from the session cookie, or null. */
export async function getSessionUser(): Promise<ServerUser | null> {
  const store = await cookies();
  const token = store.get(SESSION_COOKIE)?.value;
  if (!token) return null;
  const userId = unsign(token);
  if (!userId) return null;
  return (await getUser(userId)) ?? null;
}

export function isAdminEmail(email: string | undefined): boolean {
  return !!email && email.toLowerCase() === ADMIN_EMAIL;
}

/** Throw-style guard for admin-only routes. */
export async function requireAdmin(): Promise<ServerUser> {
  const user = await getSessionUser();
  if (!user) throw new Error("unauthorized");
  if (!isAdminEmail(user.email)) throw new Error("not-admin");
  return user;
}

/** Strip server-only fields before sending a user to the client. */
export function publicUser(u: ServerUser) {
  const now = Date.now();
  let status = u.subscriptionStatus;
  if (u.planExpiresAt && now > u.planExpiresAt && u.plan !== "free") status = "expired";
  return {
    uid: u.id,
    email: u.email,
    name: u.name,
    // Old accounts (field absent) are treated as verified; new signups start false.
    emailVerified: u.emailVerified !== false,
    plan: u.plan,
    subscriptionStatus: status,
    planExpiresAt: u.planExpiresAt,
    createdAt: u.createdAt,
  };
}
