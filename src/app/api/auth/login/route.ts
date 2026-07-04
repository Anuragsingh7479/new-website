import { NextResponse } from "next/server";
import { findUserByEmail, touchUser } from "@/lib/server/db";
import { verifyPassword, setSessionCookie, publicUser } from "@/lib/server/auth";

export const runtime = "nodejs";

export async function POST(req: Request) {
  const { email, password } = (await req.json()) as { email?: string; password?: string };
  if (!email || !password) return NextResponse.json({ error: "Enter your email and password." }, { status: 400 });

  const user = await findUserByEmail(email);
  if (!user || !verifyPassword(password, user.passwordHash)) {
    return NextResponse.json({ error: "Invalid email or password." }, { status: 401 });
  }

  // Block unverified accounts (new signups must confirm their email first).
  if (user.emailVerified === false) {
    return NextResponse.json(
      { error: "Please verify your email first.", needsVerification: true, email: user.email },
      { status: 403 }
    );
  }

  await touchUser(user.id);
  const res = NextResponse.json({ user: publicUser(user) });
  setSessionCookie(res, user.id);
  return res;
}
