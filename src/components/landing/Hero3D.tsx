"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { Float, MeshDistortMaterial, Stars } from "@react-three/drei";
import { useEffect, useRef } from "react";
import type { Group } from "three";

// Central object: a slow-rotating wireframe shell around a glowing distorted core.
function Core() {
  const ref = useRef<Group>(null);
  useFrame((_, dt) => {
    if (ref.current) {
      ref.current.rotation.x += dt * 0.12;
      ref.current.rotation.y += dt * 0.18;
    }
  });
  return (
    <group ref={ref}>
      <mesh>
        <icosahedronGeometry args={[1.55, 1]} />
        <meshStandardMaterial color="#5b7cff" wireframe transparent opacity={0.35} />
      </mesh>
      <mesh scale={0.92}>
        <icosahedronGeometry args={[1, 6]} />
        <MeshDistortMaterial
          color="#6c8cff"
          emissive="#16225e"
          emissiveIntensity={0.6}
          roughness={0.15}
          metalness={0.65}
          distort={0.38}
          speed={1.6}
        />
      </mesh>
    </group>
  );
}

// Parallax driven by window-level pointer movement (works even though the canvas
// sits behind the hero copy/overlays).
function Parallax({ children }: { children: React.ReactNode }) {
  const ref = useRef<Group>(null);
  const target = useRef({ x: 0, y: 0 });
  useEffect(() => {
    const onMove = (e: PointerEvent) => {
      target.current.x = (e.clientX / window.innerWidth) * 2 - 1;
      target.current.y = (e.clientY / window.innerHeight) * 2 - 1;
    };
    window.addEventListener("pointermove", onMove);
    return () => window.removeEventListener("pointermove", onMove);
  }, []);
  useFrame(() => {
    if (ref.current) {
      ref.current.rotation.y += (target.current.x * 0.7 - ref.current.rotation.y) * 0.06;
      ref.current.rotation.x += (target.current.y * 0.45 - ref.current.rotation.x) * 0.06;
      ref.current.position.x += (target.current.x * 0.3 - ref.current.position.x) * 0.05;
    }
  });
  return <group ref={ref}>{children}</group>;
}

export default function Hero3D() {
  return (
    <Canvas
      camera={{ position: [0, 0, 5], fov: 45 }}
      dpr={[1, 2]}
      gl={{ antialias: true, alpha: true }}
      style={{ position: "absolute", inset: 0 }}
    >
      <ambientLight intensity={0.5} />
      <directionalLight position={[3, 3, 4]} intensity={1.3} />
      <pointLight position={[-4, -2, -2]} color="#4a6cdc" intensity={3} />
      <pointLight position={[4, 2, 2]} color="#9a6cff" intensity={2} />
      <Stars radius={50} depth={35} count={1600} factor={3.2} saturation={0} fade speed={0.6} />
      <Parallax>
        <Float speed={1.4} rotationIntensity={0.5} floatIntensity={0.9}>
          <Core />
        </Float>
      </Parallax>
    </Canvas>
  );
}
