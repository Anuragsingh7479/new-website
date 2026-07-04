"use client";

import { useEffect, useState } from "react";

/**
 * Branded loading splash — shows the animated NextHireAI logo on first load of
 * the session, then fades out. Only once per browser session so it doesn't
 * repeat on every navigation.
 */
export function SplashScreen() {
  const [show, setShow] = useState(false);
  const [fade, setFade] = useState(false);

  useEffect(() => {
    try {
      if (sessionStorage.getItem("nh.splash")) return;
      sessionStorage.setItem("nh.splash", "1");
    } catch {
      /* ignore */
    }
    setShow(true);
    const f = setTimeout(() => setFade(true), 1300);
    const h = setTimeout(() => setShow(false), 1750);
    return () => {
      clearTimeout(f);
      clearTimeout(h);
    };
  }, []);

  if (!show) return null;

  return (
    <div className={`nh-splash${fade ? " nh-splash-out" : ""}`} aria-hidden>
      <div className="nh-splash-logo">
        <svg width="76" height="76" viewBox="0 0 40 40" fill="none">
          <rect x="0.5" y="0.5" width="39" height="39" rx="9.5" fill="#121212" stroke="#242728" />
          <path
            className="nh-splash-n"
            d="M13 27V13L27 27V13"
            stroke="#f4f4f6"
            strokeWidth="2.4"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
        <div className="nh-splash-word">
          NextHire<span>AI</span>
        </div>
        <div className="nh-splash-bar">
          <i />
        </div>
      </div>
    </div>
  );
}
