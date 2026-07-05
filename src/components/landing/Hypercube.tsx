"use client";

import { useEffect, useRef } from "react";

// ── 4-cube (tesseract) geometry ───────────────────────────────────────────────
// 16 vertices = every combination of ±1 across 4 dimensions.
const VERTS: number[][] = [];
for (let i = 0; i < 16; i++) {
  VERTS.push([i & 1 ? 1 : -1, i & 2 ? 1 : -1, i & 4 ? 1 : -1, i & 8 ? 1 : -1]);
}
// 32 edges = pairs of vertices that differ in exactly one coordinate (one bit).
const EDGES: [number, number][] = [];
for (let i = 0; i < 16; i++) {
  for (let j = i + 1; j < 16; j++) {
    const d = i ^ j;
    if ((d & (d - 1)) === 0) EDGES.push([i, j]);
  }
}

function rotate(v: number[], a: { xy: number; zw: number; xw: number; yz: number }) {
  let [x, y, z, w] = v;
  let c = Math.cos(a.xy),
    s = Math.sin(a.xy);
  [x, y] = [x * c - y * s, x * s + y * c];
  c = Math.cos(a.zw);
  s = Math.sin(a.zw);
  [z, w] = [z * c - w * s, z * s + w * c]; // 4th-dimension rotation → the "morph"
  c = Math.cos(a.xw);
  s = Math.sin(a.xw);
  [x, w] = [x * c - w * s, x * s + w * c];
  c = Math.cos(a.yz);
  s = Math.sin(a.yz);
  [y, z] = [y * c - z * s, y * s + z * c];
  return [x, y, z, w];
}

// 4D → 3D → 2D perspective projection. Returns [x, y, depth].
function project(v: number[]): [number, number, number] {
  const [x, y, z, w] = v;
  const wf = 1 / (2.6 - w);
  const x3 = x * wf,
    y3 = y * wf,
    z3 = z * wf;
  const zf = 1 / (3.2 - z3);
  return [x3 * zf, y3 * zf, z3];
}

export function Hypercube({ glow = "mono", size = "md" }: { glow?: "mono" | "red"; size?: "md" | "lg" }) {
  const dim = size === "lg" ? "min(48vw, 560px)" : "min(42vw, 480px)";
  const glowColor =
    glow === "red"
      ? "radial-gradient(circle, rgba(255,97,97,0.22), rgba(255,97,97,0.05) 42%, transparent 70%)"
      : "radial-gradient(circle, rgba(120,150,255,0.20), rgba(120,150,255,0.04) 44%, transparent 72%)";

  const lineRefs = useRef<(SVGLineElement | null)[]>([]);
  const dotRefs = useRef<(SVGCircleElement | null)[]>([]);

  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const SCALE = 190;
    let raf = 0;
    const t0 = performance.now();

    const render = (t: number) => {
      const a = { xy: t * 0.12, zw: t * 0.42, xw: t * 0.28, yz: t * 0.35 };
      const pts = VERTS.map((v) => project(rotate(v, a)));

      EDGES.forEach(([i, j], k) => {
        const el = lineRefs.current[k];
        if (!el) return;
        const p = pts[i];
        const q = pts[j];
        el.setAttribute("x1", String(100 + p[0] * SCALE));
        el.setAttribute("y1", String(100 - p[1] * SCALE));
        el.setAttribute("x2", String(100 + q[0] * SCALE));
        el.setAttribute("y2", String(100 - q[1] * SCALE));
        // depth-based opacity so it reads as a 3D/4D solid
        const depth = ((p[2] + q[2]) / 2 + 0.7) / 1.4;
        el.setAttribute("stroke-opacity", String(0.18 + Math.max(0, Math.min(1, depth)) * 0.72));
      });

      pts.forEach((p, i) => {
        const el = dotRefs.current[i];
        if (!el) return;
        el.setAttribute("cx", String(100 + p[0] * SCALE));
        el.setAttribute("cy", String(100 - p[1] * SCALE));
        const depth = (p[2] + 0.7) / 1.4;
        el.setAttribute("r", String(1 + Math.max(0, Math.min(1, depth)) * 1.6));
      });
    };

    if (reduce) {
      render(0.6); // static, tilted view
      return;
    }
    const loop = (now: number) => {
      render((now - t0) / 1000);
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <div className="relative aspect-square select-none" style={{ width: dim, pointerEvents: "none" }}>
      <div className="absolute -inset-[10%] blur-xl" style={{ background: glowColor }} aria-hidden />
      <svg viewBox="0 0 200 200" className="absolute inset-0 h-full w-full" aria-hidden>
        <g>
          {EDGES.map((_, k) => (
            <line
              key={k}
              ref={(el) => {
                lineRefs.current[k] = el;
              }}
              stroke={glow === "red" ? "#ff9a9a" : "#dfe6ff"}
              strokeWidth="0.9"
              strokeLinecap="round"
            />
          ))}
          {VERTS.map((_, i) => (
            <circle
              key={i}
              ref={(el) => {
                dotRefs.current[i] = el;
              }}
              fill={glow === "red" ? "#ffd0d0" : "#9fb4ff"}
            />
          ))}
        </g>
      </svg>
    </div>
  );
}
