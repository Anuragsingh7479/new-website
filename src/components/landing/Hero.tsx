import { Button } from "@/components/ui/Button";
import { NavBar } from "./NavBar";
import { Hypercube } from "./Hypercube";
import { TrustStrip } from "./TrustStrip";

// Resume-product headline (3 lines), styled with the original display layout.
const HEADLINE = ["Get hired faster", "with an AI resume", "built to beat ATS."];

/**
 * Direction A hero — centered 3D object flanked by headline (left) and a mono
 * caption (right), exactly as in the original design. Copy rewritten from the
 * generic agency wording to the resume/job-seeker product story.
 */
export function Hero() {
  return (
    <div className="hero-wrap is-in relative">
      <div className="hero-stripe" aria-hidden />
      <NavBar />

      <div
        className="hero-grid mx-auto grid max-w-container items-center gap-6 px-6 pt-14"
        style={{
          gridTemplateColumns: "1fr auto 1fr",
          minHeight: "clamp(420px, 56vh, 600px)",
        }}
      >
        {/* left: headline + CTAs */}
        <div className="hero-col-left max-w-[460px]">
          <h1
            className="m-0 font-semibold leading-[1.05] tracking-[-0.5px] text-ink sm:tracking-[-1px]"
            style={{
              fontFeatureSettings: "var(--font-features-display)",
              fontSize: "clamp(28px, 7vw, 64px)",
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
          <div
            className="hero-fade mt-[30px] flex flex-wrap justify-center gap-[10px] sm:justify-start"
            style={{ ["--d" as string]: "320ms" }}
          >
            <Button href="/signup" variant="primary">
              Build Your Resume
            </Button>
            <Button href="/pricing" variant="install">
              Explore Premium Features
            </Button>
          </div>
        </div>

        {/* center: 3D object */}
        <div
          className="hero-fade flex justify-center"
          style={{ ["--d" as string]: "160ms" }}
        >
          <Hypercube glow="mono" size="md" />
        </div>

        {/* right: mono caption */}
        <div
          className="hero-col-right hero-fade justify-self-end text-left"
          style={{ ["--d" as string]: "400ms" }}
        >
          <div
            className="font-mono text-[11.5px] uppercase leading-[2] tracking-[1.5px] text-mute"
          >
            <div>For job seekers</div>
            <div>landing roles at</div>
            <div>top companies</div>
            <div className="mt-[18px] text-stone">12,000+ resumes built</div>
          </div>
        </div>
      </div>

      <div className="h-16" />
      <TrustStrip />
    </div>
  );
}
