"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/components/providers/AuthProvider";
import { Card } from "@/components/ui/Card";
import { Field, Input } from "@/components/ui/Field";
import { Button } from "@/components/ui/Button";

export default function VerifyEmailPage() {
  const router = useRouter();
  const { verifyEmail, resendVerification } = useAuth();
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [devOtp, setDevOtp] = useState("");
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [loading, setLoading] = useState(false);

  // Read email + (dev) code from the query without needing a Suspense boundary.
  useEffect(() => {
    const p = new URLSearchParams(window.location.search);
    setEmail(p.get("email") ?? "");
    if (p.get("dev")) setDevOtp(p.get("dev")!);
  }, []);

  async function onVerify(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await verifyEmail(email, otp);
      router.push("/dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not verify.");
      setLoading(false);
    }
  }

  async function onResend() {
    setError("");
    setNotice("");
    try {
      const res = await resendVerification(email);
      setNotice("A new code has been sent to your email.");
      if (res.devOtp) setDevOtp(res.devOtp);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not resend.");
    }
  }

  return (
    <Card className="p-7">
      <div className="text-3xl">📩</div>
      <h1 className="mt-2 text-xl font-semibold tracking-[-0.3px]">Verify your email</h1>
      <p className="mb-6 mt-1 text-sm leading-relaxed text-mute">
        Humne <b className="text-ink">{email || "aapke email"}</b> par ek 6-digit code bheja hai.
        Neeche daal ke account activate karo.
      </p>

      {notice && (
        <div className="mb-4 rounded-md border border-hairline bg-surface-elevated p-3 text-sm text-body">
          {notice}
        </div>
      )}
      {devOtp && (
        <div className="mb-4 rounded-md border border-hairline bg-surface-elevated p-3 text-xs text-stone">
          Email delivery abhi set nahi — aapka code:{" "}
          <b className="font-mono text-ink">{devOtp}</b>
        </div>
      )}

      <form onSubmit={onVerify} className="space-y-4">
        {!email && (
          <Field label="Email">
            <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </Field>
        )}
        <Field label="6-digit code">
          <Input
            inputMode="numeric"
            value={otp}
            onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
            placeholder="123456"
            required
          />
        </Field>
        {error && <p className="text-sm text-accent-red">{error}</p>}
        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? "Verifying…" : "Verify & continue"}
        </Button>
      </form>

      <div className="mt-4 flex items-center justify-between text-sm">
        <button type="button" onClick={onResend} className="text-mute hover:text-ink">
          Resend code
        </button>
        <Link href="/login" className="text-mute hover:text-ink">
          Back to sign in
        </Link>
      </div>
    </Card>
  );
}
