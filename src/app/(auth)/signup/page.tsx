"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/components/providers/AuthProvider";
import { Field, Input } from "@/components/ui/Field";
import { Button } from "@/components/ui/Button";
import { SocialButtons } from "@/components/auth/SocialButtons";

export default function SignupPage() {
  const router = useRouter();
  const { signUp } = useAuth();
  const [showEmail, setShowEmail] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await signUp(name, email, password);
      const q = new URLSearchParams({ email });
      if (res.devOtp) q.set("dev", res.devOtp);
      router.push(`/verify-email?${q.toString()}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not create account.");
      setLoading(false);
    }
  }

  return (
    <div
      className="rounded-2xl border border-hairline p-8 backdrop-blur-sm"
      style={{ background: "rgba(13,13,13,0.6)" }}
    >
      <div className="text-center">
        <h1 className="text-2xl font-semibold tracking-[-0.4px]">Create your account</h1>
        <p className="mb-7 mt-2 text-sm text-mute">
          Build an ATS-ready resume in minutes — <span className="text-accent-green">free</span> to start.
        </p>
      </div>

      <SocialButtons mode="up" />

      <div className="my-6 flex items-center gap-3 text-xs text-stone">
        <div className="h-px flex-1 bg-hairline" /> OR <div className="h-px flex-1 bg-hairline" />
      </div>

      {!showEmail ? (
        <button
          type="button"
          onClick={() => setShowEmail(true)}
          className="flex w-full items-center justify-center gap-2 rounded-full border border-hairline bg-surface-elevated py-3 text-sm text-ink transition-colors hover:bg-surface-card"
        >
          ✉ Sign up with Email
        </button>
      ) : (
        <form onSubmit={onSubmit} className="space-y-3 text-left">
          <Field label="Full name">
            <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Aarav Sharma" autoComplete="name" />
          </Field>
          <Field label="Email">
            <Input
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@email.com"
              required
            />
          </Field>
          <Field label="Password">
            <Input
              type="password"
              autoComplete="new-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="At least 6 characters"
              required
            />
          </Field>
          {error && <p className="text-sm text-accent-red">{error}</p>}
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Creating account…" : "Create account"}
          </Button>
        </form>
      )}

      <p className="mt-5 text-center text-sm text-mute">
        Already have an account?{" "}
        <Link href="/login" className="text-ink hover:underline">
          Sign in
        </Link>
      </p>

      <p className="mt-4 text-center text-[11px] leading-relaxed text-stone">
        By continuing, you agree to our{" "}
        <Link href="/terms" className="underline hover:text-ink">
          Terms
        </Link>{" "}
        &amp;{" "}
        <Link href="/terms" className="underline hover:text-ink">
          Privacy Policy
        </Link>
        .
      </p>
    </div>
  );
}
