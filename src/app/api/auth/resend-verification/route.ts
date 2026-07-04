import { NextResponse } from "next/server";
import crypto from "node:crypto";
import { findUserByEmail, setVerifyOtp } from "@/lib/server/db";
import { sendEmail, verifyEmail, emailConfigured } from "@/lib/server/email";

export const runtime = "nodejs";

const sha256 = (s: string) => crypto.createHash("sha256").update(s).digest("hex");

/** Re-send a verification code. */
export async function POST(req: Request) {
  const { email } = (await req.json()) as { email?: string };
  if (!email) return NextResponse.json({ error: "Email required." }, { status: 400 });

  const user = await findUserByEmail(email);
  if (!user || user.emailVerified) return NextResponse.json({ ok: true }); // don't reveal state

  const code = String(crypto.randomInt(100000, 1000000));
  await setVerifyOtp(user.id, sha256(code), Date.now() + 15 * 60 * 1000);
  try {
    await sendEmail({ to: user.email, ...verifyEmail(code) });
  } catch {
    /* ignore */
  }
  return NextResponse.json({ ok: true, ...(emailConfigured ? {} : { devOtp: code }) });
}
