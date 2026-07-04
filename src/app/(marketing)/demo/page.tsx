import type { Metadata } from "next";
import Link from "next/link";
import { ResumePreview } from "@/components/resume/ResumePreview";
import { Button } from "@/components/ui/Button";
import type { ResumeData } from "@/lib/types";

export const metadata: Metadata = {
  title: "Live Demo",
  description: "See a Pro-quality resume built with NextHireAI. Start free, upgrade to download.",
};

const SAMPLE: ResumeData = {
  fullName: "Aarav Sharma",
  jobTitle: "Senior Frontend Engineer",
  email: "aarav@email.com",
  phone: "+91 90000 00000",
  location: "Bengaluru, IN",
  website: "aarav.dev",
  summary:
    "Frontend engineer with 6+ years building fast, accessible web apps in React and TypeScript. Proven record of cutting load times, scaling design systems, and mentoring teams.",
  experience: [
    {
      id: "e1",
      role: "Senior Frontend Engineer",
      company: "Vantage Labs",
      period: "2021 — Present",
      bullets: [
        "Led migration to Next.js, cutting page load time by 42% and boosting Lighthouse to 98.",
        "Architected a design system adopted by 8 product teams, halving UI build time.",
        "Mentored 4 engineers; introduced CI checks that reduced regressions by 30%.",
      ],
    },
    {
      id: "e2",
      role: "Frontend Engineer",
      company: "Cobalt",
      period: "2018 — 2021",
      bullets: [
        "Shipped a real-time dashboard used by 20k+ daily users.",
        "Improved accessibility to WCAG AA across the product.",
      ],
    },
  ],
  education: [{ id: "ed1", degree: "B.Tech, Computer Science", school: "IIT Delhi", period: "2014 — 2018" }],
  skills: ["React", "TypeScript", "Next.js", "Node.js", "Tailwind", "GraphQL", "CI/CD", "Accessibility"],
  projects: [],
};

export default function DemoPage() {
  return (
    <div>
      <div className="mb-10 text-center">
        <span className="rounded-full border border-accent-yellow/40 px-3 py-1 text-xs font-medium text-accent-yellow">
          Pro-quality preview
        </span>
        <h1 className="mt-4 text-3xl font-semibold tracking-[-0.6px] sm:text-4xl">
          This is what you get with NextHireAI
        </h1>
        <p className="mx-auto mt-3 max-w-xl text-mute">
          A polished, ATS-ready resume in minutes. Build &amp; preview for <b className="text-ink">free</b> —
          upgrade to Pro to use premium templates and download as PDF.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <Button href="/signup">Start free</Button>
          <Button href="/pricing" variant="install">
            See pricing
          </Button>
        </div>
      </div>

      <div className="mx-auto max-w-3xl">
        <div className="mb-3 text-center text-xs text-stone">
          Sample resume · &ldquo;Sidebar&rdquo; premium template
        </div>
        <ResumePreview data={SAMPLE} template="sidebar" />
      </div>

      <p className="mt-8 text-center text-sm text-mute">
        Like what you see?{" "}
        <Link href="/signup" className="text-ink hover:underline">
          Create your free account
        </Link>{" "}
        and build yours now.
      </p>
    </div>
  );
}
