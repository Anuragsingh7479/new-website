import { NextResponse } from "next/server";
import crypto from "node:crypto";
import { createUser, findUserByEmail, newId, setVerifyOtp } from "@/lib/server/db";
import { hashPassword } from "@/lib/server/auth";
import { sendEmail, verifyEmail, emailConfigured } from "@/lib/server/email";

export const runtime = "nodejs";

const sha256 = (s: string) => crypto.createHash("sha256").update(s).digest("hex");

export async function POST(req: Request) {
  const { name, email, password } = (await req.json()) as {
    name?: string;
    email?: string;
    password?: string;
  };
  if (!email || !password) return NextResponse.json({ error: "Email and password are required." }, { status: 400 });
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return NextResponse.json({ error: "Enter a valid email." }, { status: 400 });
  if (password.length < 6) return NextResponse.json({ error: "Password must be at least 6 characters." }, { status: 400 });
  if (await findUserByEmail(email)) return NextResponse.json({ error: "An account with this email already exists." }, { status: 409 });

  const id = newId("usr");
  await createUser({
    id,
    email,
    name: name || email.split("@")[0],
    passwordHash: hashPassword(password),
    plan: "free",
    subscriptionStatus: "inactive",
    planActivatedAt: null,
    planExpiresAt: null,
    createdAt: Date.now(),
    lastSeenAt: Date.now(),
    emailVerified: false, // must verify via OTP before the account can be used
  });

  // Email a 6-digit verification code (valid 15 min).
  const code = String(crypto.randomInt(100000, 1000000));
  await setVerifyOtp(id, sha256(code), Date.now() + 15 * 60 * 1000);
  try {
    await sendEmail({ to: email, ...verifyEmail(code) });
  } catch {
    /* delivery failure — user can resend */
  }

  // No session yet. Client sends them to the verify screen.
  return NextResponse.json({
    ok: true,
    needsVerification: true,
    email,
    ...(emailConfigured ? {} : { devOtp: code }),
  });
}
