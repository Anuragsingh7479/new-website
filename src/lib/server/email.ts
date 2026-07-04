// ─────────────────────────────────────────────────────────────────────────────
// Email delivery via SMTP (nodemailer). Works with any SMTP provider — e.g.
// Gmail with an App Password. When SMTP isn't configured, sending is skipped
// and the caller falls back to returning the OTP in dev so the flow stays usable.
// ─────────────────────────────────────────────────────────────────────────────

import "server-only";
import nodemailer from "nodemailer";

const HOST = process.env.SMTP_HOST;
const PORT = Number(process.env.SMTP_PORT || 465);
const USER = process.env.SMTP_USER;
const PASS = process.env.SMTP_PASS;
const FROM = process.env.SMTP_FROM || (USER ? `NextHireAI <${USER}>` : "");

export const emailConfigured = Boolean(HOST && USER && PASS);

let transporter: nodemailer.Transporter | null = null;
function getTransporter() {
  if (!transporter) {
    transporter = nodemailer.createTransport({
      host: HOST,
      port: PORT,
      secure: PORT === 465, // true for 465, false for 587
      auth: { user: USER, pass: PASS },
    });
  }
  return transporter;
}

export async function sendEmail(opts: { to: string; subject: string; text: string; html?: string }) {
  if (!emailConfigured) return false;
  await getTransporter().sendMail({ from: FROM, ...opts });
  return true;
}

/** Email-verification code body. */
export function verifyEmail(code: string) {
  return {
    subject: "Verify your NextHireAI account",
    text: `Welcome to NextHireAI! Your verification code is ${code}. It expires in 15 minutes.`,
    html: `
      <div style="font-family:Inter,Arial,sans-serif;max-width:480px;margin:0 auto;padding:24px;color:#111">
        <h2 style="margin:0 0 8px">Welcome to NextHireAI 🎉</h2>
        <p style="color:#555;margin:0 0 20px">Enter this code to verify your email and activate your account. It expires in 15 minutes.</p>
        <div style="font-size:32px;font-weight:700;letter-spacing:8px;background:#f4f4f6;border-radius:10px;padding:16px;text-align:center">${code}</div>
        <p style="color:#999;font-size:12px;margin-top:20px">If you didn't create this account, you can ignore this email.</p>
      </div>`,
  };
}

/** Branded OTP email body. */
export function otpEmail(code: string) {
  return {
    subject: "Your NextHireAI password reset code",
    text: `Your NextHireAI password reset code is ${code}. It expires in 10 minutes. If you didn't request this, ignore this email.`,
    html: `
      <div style="font-family:Inter,Arial,sans-serif;max-width:480px;margin:0 auto;padding:24px;color:#111">
        <h2 style="margin:0 0 8px">Reset your password</h2>
        <p style="color:#555;margin:0 0 20px">Use this code to reset your NextHireAI password. It expires in 10 minutes.</p>
        <div style="font-size:32px;font-weight:700;letter-spacing:8px;background:#f4f4f6;border-radius:10px;padding:16px;text-align:center">${code}</div>
        <p style="color:#999;font-size:12px;margin-top:20px">If you didn't request this, you can safely ignore this email.</p>
      </div>`,
  };
}
