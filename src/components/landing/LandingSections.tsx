import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Reveal } from "./Reveal";
import { TiltCard } from "./TiltCard";

const FEATURES = [
  { icon: "✦", title: "AI Resume Builder", desc: "Generate summaries, bullet points, skills & experience with AI." },
  { icon: "◎", title: "ATS Score Checker", desc: "See your score, missing keywords, grammar & fixes." },
  { icon: "▤", title: "12 Templates", desc: "Modern, professional, minimal & premium designs." },
  { icon: "✎", title: "AI Cover Letters", desc: "Tailored, company-specific letters in seconds." },
  { icon: "⬇", title: "PDF Download", desc: "Export a clean, ATS-ready one-page resume." },
  { icon: "◆", title: "Live Preview", desc: "Edit on the left, watch your resume update instantly." },
];

const STEPS = [
  { n: "01", title: "Add your details", desc: "Fill in your experience — or let AI draft it for you." },
  { n: "02", title: "Optimize with AI", desc: "Improve bullets, fix ATS keywords, pick a template." },
  { n: "03", title: "Download & apply", desc: "Export a polished PDF and start applying with confidence." },
];

export function Features() {
  return (
    <section id="features" className="mx-auto max-w-container px-6 py-24">
      <Reveal className="mx-auto max-w-xl text-center">
        <h2 className="text-3xl font-semibold tracking-[-0.6px] sm:text-4xl">
          Everything you need to get hired
        </h2>
        <p className="mt-3 text-mute">
          AI writing, ATS analysis, beautiful templates and one-click export — in one place.
        </p>
      </Reveal>

      <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {FEATURES.map((f, i) => (
          <Reveal key={f.title} delay={(i % 3) * 90}>
            <TiltCard className="h-full rounded-xl border border-hairline bg-surface p-6 hover:border-hairline-strong">
              <div className="grid h-11 w-11 place-items-center rounded-lg bg-surface-card text-lg text-accent-blue">
                {f.icon}
              </div>
              <h3 className="mt-4 text-base font-semibold">{f.title}</h3>
              <p className="mt-1.5 text-sm leading-relaxed text-mute">{f.desc}</p>
            </TiltCard>
          </Reveal>
        ))}
      </div>
    </section>
  );
}

export function HowItWorks() {
  return (
    <section className="border-y border-hairline bg-surface/30">
      <div className="mx-auto max-w-container px-6 py-24">
        <Reveal className="text-center">
          <h2 className="text-3xl font-semibold tracking-[-0.6px] sm:text-4xl">How it works</h2>
          <p className="mt-3 text-mute">Three steps to a resume that gets noticed.</p>
        </Reveal>
        <div className="mt-14 grid gap-6 md:grid-cols-3">
          {STEPS.map((s, i) => (
            <Reveal key={s.n} delay={i * 120}>
              <div className="rounded-xl border border-hairline bg-surface p-7">
                <div className="font-mono text-3xl font-bold text-accent-blue/80">{s.n}</div>
                <h3 className="mt-3 text-lg font-semibold">{s.title}</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-mute">{s.desc}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

export function TemplatesTeaser() {
  const names = ["Modern", "Professional", "Minimal", "Corporate", "Creative", "Executive", "Elegant", "Sidebar", "Bold", "Onyx"];
  return (
    <section id="templates" className="mx-auto max-w-container px-6 py-24 text-center">
      <Reveal>
        <span className="rounded-full border border-hairline px-3 py-1 text-xs text-mute">12 templates</span>
        <h2 className="mx-auto mt-4 max-w-xl text-3xl font-semibold tracking-[-0.6px] sm:text-4xl">
          Templates that recruiters love
        </h2>
        <p className="mx-auto mt-3 max-w-lg text-mute">
          Switch designs instantly — from clean &amp; minimal to bold &amp; premium.
        </p>
      </Reveal>
      <Reveal delay={120} className="mt-8 flex flex-wrap justify-center gap-2.5">
        {names.map((n) => (
          <span key={n} className="rounded-full border border-hairline bg-surface px-4 py-2 text-sm text-body">
            {n}
          </span>
        ))}
      </Reveal>
      <Reveal delay={200} className="mt-8">
        <Button href="/demo">See a live example →</Button>
      </Reveal>
    </section>
  );
}

export function FinalCTA() {
  return (
    <section className="relative overflow-hidden border-t border-hairline">
      <div
        className="pointer-events-none absolute inset-0"
        style={{ background: "radial-gradient(ellipse 60% 80% at 50% 120%, rgba(74,108,220,0.28), transparent 70%)" }}
        aria-hidden
      />
      <div className="relative mx-auto max-w-container px-6 py-28 text-center">
        <Reveal>
          <h2 className="mx-auto max-w-2xl text-3xl font-semibold tracking-[-0.8px] sm:text-5xl">
            Ready to build a resume that gets you hired?
          </h2>
          <p className="mx-auto mt-4 max-w-lg text-mute">
            Start free in seconds. Upgrade to Pro to download and unlock premium templates.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Button href="/signup">Build Your Resume — Free</Button>
            <Button href="/pricing" variant="install">
              View Pricing
            </Button>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

export function LandingSections() {
  return (
    <>
      <Features />
      <HowItWorks />
      <TemplatesTeaser />
      <FinalCTA />
    </>
  );
}
