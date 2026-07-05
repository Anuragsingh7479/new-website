"use client";

import dynamic from "next/dynamic";

// WebGL can't render on the server — load the 3D scene client-side only.
const Hero3D = dynamic(() => import("./Hero3D"), {
  ssr: false,
  loading: () => null,
});

export function Scene3D() {
  return <Hero3D />;
}
