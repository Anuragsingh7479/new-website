"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/components/providers/AuthProvider";
import { Card } from "@/components/ui/Card";
import { Field, Input } from "@/components/ui/Field";
import { Button } from "@/components/ui/Button";

export default function SignupPage() {
  const router = useRouter();
  const { signUp } = useAuth();
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
    <Card className="p-7">
      <h1 className="text-xl font-semibold tracking-[-0.3px]">Create your account</h1>
      <p className="mb-6 mt-1 text-sm text-mute">Create an account to start building.</p>

      <form onSubmit={onSubmit} className="space-y-4">
        <Field label="Full name">
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Aarav Sharma"
            autoComplete="name"
          />
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

      <p className="mt-5 text-center text-sm text-mute">
        Already have an account?{" "}
        <Link href="/login" className="text-ink hover:underline">
          Sign in
        </Link>
      </p>
    </Card>
  );
}
