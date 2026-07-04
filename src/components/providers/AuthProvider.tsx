"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import type { AppUser } from "@/lib/types";
import { isProUser, hasAppAccess } from "@/lib/types";

export interface AuthActionResult {
  needsVerification?: boolean;
  email?: string;
  devOtp?: string;
}

interface AuthContextValue {
  user: AppUser | null;
  loading: boolean;
  isPro: boolean;
  /** Active Pro subscriber OR the admin. */
  hasAccess: boolean;
  signUp: (name: string, email: string, password: string) => Promise<AuthActionResult>;
  signIn: (email: string, password: string) => Promise<AuthActionResult>;
  verifyEmail: (email: string, otp: string) => Promise<void>;
  resendVerification: (email: string) => Promise<AuthActionResult>;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  updateName: (name: string) => Promise<void>;
  /** Re-fetch the session (e.g. after the admin activates a plan). */
  refresh: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

async function post(url: string, body?: unknown) {
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: body ? JSON.stringify(body) : undefined,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || "Request failed.");
  return data;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AppUser | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    try {
      const res = await fetch("/api/auth/me");
      // Only change the session on an explicit answer from the server. If the
      // request fails (server restarting, network blip), KEEP the current user
      // signed in instead of bouncing them to the login screen.
      if (res.ok) {
        const data = await res.json();
        setUser(data.user ?? null);
      }
    } catch {
      /* transient error — preserve the existing session */
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
    // Re-check the session when the tab regains focus so a freshly-approved
    // subscription unlocks the app without a manual reload.
    const onFocus = () => refresh();
    window.addEventListener("focus", onFocus);
    return () => window.removeEventListener("focus", onFocus);
  }, [refresh]);

  const signUp = useCallback(async (name: string, email: string, password: string) => {
    // Returns { needsVerification, email, devOtp? } — no session until verified.
    const data = await post("/api/auth/signup", { name, email, password });
    return data as AuthActionResult;
  }, []);

  const signIn = useCallback(async (email: string, password: string) => {
    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    const data = await res.json().catch(() => ({}));
    if (res.status === 403 && data.needsVerification) return data as AuthActionResult;
    if (!res.ok) throw new Error(data.error || "Could not sign in.");
    setUser(data.user);
    return {} as AuthActionResult;
  }, []);

  const verifyEmail = useCallback(async (email: string, otp: string) => {
    const data = await post("/api/auth/verify-email", { email, otp });
    setUser(data.user);
  }, []);

  const resendVerification = useCallback(async (email: string) => {
    return (await post("/api/auth/resend-verification", { email })) as AuthActionResult;
  }, []);

  const signInWithGoogle = useCallback(async () => {
    // Google sign-in needs a Google OAuth client ID/secret (your Google Cloud
    // project). Until that's configured, use email + password.
    throw new Error("Google sign-in isn't enabled yet — please sign up with email and password.");
  }, []);

  const signOut = useCallback(async () => {
    await post("/api/auth/logout");
    setUser(null);
  }, []);

  const resetPassword = useCallback(async (_email: string) => {
    void _email;
    // Automated reset emails need an email provider. For now, support resets manually.
    throw new Error("Password reset by email isn't enabled yet. Contact support and we'll reset it for you.");
  }, []);

  const updateName = useCallback(async (name: string) => {
    const data = await post("/api/auth/update-name", { name });
    setUser(data.user);
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      loading,
      isPro: isProUser(user),
      hasAccess: hasAppAccess(user),
      signUp,
      signIn,
      verifyEmail,
      resendVerification,
      signInWithGoogle,
      signOut,
      resetPassword,
      updateName,
      refresh,
    }),
    [user, loading, signUp, signIn, verifyEmail, resendVerification, signInWithGoogle, signOut, resetPassword, updateName, refresh]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within <AuthProvider>");
  return ctx;
}
