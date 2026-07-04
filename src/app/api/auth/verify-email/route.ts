import { NextResponse } from "next/server";
import crypto from "node:crypto";
import { findUserByEmail, markEmailVerified, getUser } from "@/lib/server/db";
import { setSessionCookie, publicUser } from "@/lib/server/auth";

export const runtime = "nodejs";

const sha256 = (s: string) => crypto.createHash("sha256").update(s).digest("hex");

/** Verify the signup OTP, mark the email verified, and sign the user in. */
export async function POST(req: Request) {
  const { email, otp } = (await req.json()) as { email?: string; otp?: string };
  if (!email || !otp) return NextResponse.json({ error: "Email and code are required." }, { status: 400 });

  const user = await findUserByEmail(email);
  if (!user) return NextResponse.json({ error: "Account not found." }, { status: 404 });
  if (user.emailVerified) {
    // Already verified — just sign them in.
    const res = NextResponse.json({ ok: true, user: publicUser(user) });
    setSessionCookie(res, user.id);
    return res;
  }
  if (!user.verifyOtpHash || !user.verifyOtpExpires) {
    return NextResponse.json({ error: "Request a new code." }, { status: 400 });
  }
  if (Date.now() > user.verifyOtpExpires) {
    return NextResponse.json({ error: "Code expired. Request a new one." }, { status: 400 });
  }
  const ok =
    sha256(otp).length === user.verifyOtpHash.length &&
    crypto.timingSafeEqual(Buffer.from(sha256(otp)), Buffer.from(user.verifyOtpHash));
  if (!ok) return NextResponse.json({ error: "Invalid code." }, { status: 400 });

  await markEmailVerified(user.id);
  const fresh = (await getUser(user.id)) ?? user;
  const res = NextResponse.json({ ok: true, user: publicUser(fresh) });
  setSessionCookie(res, user.id); // auto sign-in after verification
  return res;
}
