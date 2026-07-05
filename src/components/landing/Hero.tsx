import { Button } from "@/components/ui/Button";
import { NavBar } from "./NavBar";
import { Scene3D } from "./Scene3D";
import { TrustStrip } from "./TrustStrip";

// Resume-product headline (3 lines).
const HEADLINE = ["Get hired faster", "with an AI resume", "built to beat ATS."];

/**
 * Immersive 3D hero — a live Three.js scene (floating distorted core + wireframe
 * shell + starfield + pointer parallax) sits behind the copy. Text lives in a
 * left column with a soft gradient scrim so it stays crisp over the animation.
 */
export function Hero() {
  return (
    <div className="hero-wrap is-in relative overflow-hidden">
      {/* live 3D background */}
      <div className="absolute inset-0 z-0">
        <Scene3D />
      </div>
      {/* left gradient scrim for text contrast */}
      <div
        className="pointer-events-none absolute inset-0 z-[1]"
        style={{
          background:
            "linear-gradient(90deg, var(--color-canvas) 0%, rgba(7,8,10,0.72) 42%, transparent 78%)",
        }}
        aria-hidden
      />
      <div className="hero-stripe" aria-hidden />

      <NavBar />

      <div
        className="relative z-[2] mx-auto flex max-w-container items-center px-6 pt-10"
        style={{ minHeight: "clamp(480px, 68vh, 700px)" }}
      >
        <div className="hero-col-left max-w-[540px]">
          <span
            className="hero-fade mb-6 inline-flex items-center gap-2 rounded-full border border-hairline bg-surface/50 px-4 py-1.5 text-xs text-mute backdrop-blur-sm"
            style={{ ["--d" as string]: "80ms" }}
          >
            <span className="text-accent-blue">✦</span> AI-powered resume &amp; ATS platform
          </span>

          <h1
            className="m-0 font-semibold leading-[1.05] tracking-[-0.5px] text-ink sm:tracking-[-1px]"
            style={{
              fontFeatureSettings: "var(--font-features-display)",
              fontSize: "clamp(30px, 6.4vw, 66px)",
            }}
          >
            {HEADLINE.map((line, i) => (
              <span
                key={i}
                className="reveal-line block"
                style={{ ["--d" as string]: `${i * 90}ms` }}
              >
                {line}
              </span>
            ))}
          </h1>

          <p
            className="hero-fade mt-5 max-w-md text-[17px] leading-relaxed text-body"
            style={{ ["--d" as string]: "360ms" }}
          >
            Build an ATS-ready resume &amp; tailored cover letters with AI — check your ATS score,
            fix missing keywords, and download in one click.
          </p>

          <div
            className="hero-fade mt-8 flex flex-wrap gap-3"
            style={{ ["--d" as string]: "440ms" }}
          >
            <Button href="/signup" variant="primary">
              Build Your Resume
            </Button>
            <Button href="/demo" variant="install">
              ▶ See Live Demo
            </Button>
          </div>
        </div>
      </div>

      <TrustStrip />
    </div>
  );
}
