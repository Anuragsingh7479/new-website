"use client";

import { useEffect, useState } from "react";

type Star = { x: number; y: number; s: number; d: number; o: number };

/** Emergent-style space background: soft glow + twinkling stars. */
export function AuthBackground() {
  const [stars, setStars] = useState<Star[]>([]);

  // Generate stars client-side to avoid SSR hydration mismatch.
  useEffect(() => {
    setStars(
      Array.from({ length: 70 }, () => ({
        x: Math.random() * 100,
        y: Math.random() * 100,
        s: Math.random() * 1.8 + 0.6,
        d: Math.random() * 4,
        o: Math.random() * 0.5 + 0.2,
      }))
    );
  }, []);

  return (
    <div className="auth-bg" aria-hidden>
      <div className="auth-stars">
        {stars.map((st, i) => (
          <span
            key={i}
            style={{
              left: `${st.x}%`,
              top: `${st.y}%`,
              width: st.s,
              height: st.s,
              opacity: st.o,
              animationDelay: `${st.d}s`,
            }}
          />
        ))}
      </div>
    </div>
  );
}
