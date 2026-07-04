"use client";

import { useState } from "react";

/**
 * Emergent-style social sign-in: a prominent "Continue with Google" button and a
 * row of Apple / Microsoft. OAuth isn't wired yet (needs the provider keys), so
 * these show a friendly "coming soon" note and point users to email sign-in.
 */
export function SocialButtons({ mode = "in" }: { mode?: "in" | "up" }) {
  const [note, setNote] = useState("");
  const label = mode === "up" ? "Sign up" : "Continue";
  const soon = (p: string) =>
    setNote(`${p} login jaldi aa raha hai — abhi email se ${mode === "up" ? "account banao" : "sign in karo"}.`);

  return (
    <div className="space-y-3">
      <button
        type="button"
        onClick={() => soon("Google")}
        className="flex w-full items-center justify-center gap-3 rounded-full bg-white py-3 text-[15px] font-medium text-black transition-transform hover:scale-[1.01] active:scale-100"
      >
        <GoogleIcon />
        {label} with Google
      </button>

      <div className="grid grid-cols-2 gap-3">
        <button
          type="button"
          onClick={() => soon("Apple")}
          className="flex items-center justify-center gap-2 rounded-full border border-hairline bg-surface-elevated py-3 text-sm text-ink transition-colors hover:bg-surface-card"
        >
          <AppleIcon /> Apple
        </button>
        <button
          type="button"
          onClick={() => soon("Microsoft")}
          className="flex items-center justify-center gap-2 rounded-full border border-hairline bg-surface-elevated py-3 text-sm text-ink transition-colors hover:bg-surface-card"
        >
          <MicrosoftIcon /> Microsoft
        </button>
      </div>

      {note && <p className="text-center text-xs text-accent-yellow">{note}</p>}
    </div>
  );
}

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden>
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.27-4.74 3.27-8.1Z" />
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84A11 11 0 0 0 12 23Z" />
      <path fill="#FBBC05" d="M5.84 14.1a6.6 6.6 0 0 1 0-4.2V7.06H2.18a11 11 0 0 0 0 9.88l3.66-2.84Z" />
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84C6.71 7.3 9.14 5.38 12 5.38Z" />
    </svg>
  );
}
function AppleIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M16.36 12.9c.02 2.36 2.07 3.15 2.1 3.16-.02.06-.33 1.13-1.08 2.23-.65.96-1.32 1.9-2.38 1.92-1.04.02-1.38-.61-2.57-.61-1.19 0-1.56.59-2.55.63-1.02.04-1.8-1.03-2.46-1.99-1.34-1.95-2.37-5.5-.99-7.9.68-1.19 1.9-1.94 3.23-1.96 1-.02 1.95.68 2.57.68.61 0 1.77-.84 2.98-.72.51.02 1.94.2 2.86 1.55-.07.05-1.71 1-1.69 3.02M14.4 6.09c.55-.66.92-1.59.82-2.51-.79.03-1.75.53-2.31 1.19-.51.58-.95 1.52-.83 2.42.88.07 1.78-.45 2.32-1.1" />
    </svg>
  );
}
function MicrosoftIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 23 23" aria-hidden>
      <path fill="#f25022" d="M1 1h10v10H1z" />
      <path fill="#7fba00" d="M12 1h10v10H12z" />
      <path fill="#00a4ef" d="M1 12h10v10H1z" />
      <path fill="#ffb900" d="M12 12h10v10H12z" />
    </svg>
  );
}
