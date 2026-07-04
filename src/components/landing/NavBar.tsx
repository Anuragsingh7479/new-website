import Link from "next/link";
import { Logo } from "./Logo";
import { Button } from "@/components/ui/Button";

const NAV_LINKS = [
  { label: "Live Demo", href: "/demo" },
  { label: "Templates", href: "/#templates" },
  { label: "ATS Score", href: "/ats" },
  { label: "Pricing", href: "/pricing" },
];

/** Shared top navigation (faithful to the original hero nav). */
export function NavBar() {
  return (
    <nav className="relative z-[5] mx-auto flex max-w-container items-center justify-between px-6 py-5">
      <div className="flex items-center gap-10">
        <Logo />
        <div className="nav-links flex items-center gap-[26px]">
          {NAV_LINKS.map((l) => (
            <Link
              key={l.label}
              href={l.href}
              className="text-sm tracking-[0.2px] text-mute no-underline transition-colors hover:text-ink"
            >
              {l.label}
            </Link>
          ))}
        </div>
      </div>
      <div className="flex items-center gap-[10px]">
        <Button href="/login" variant="secondary" size="sm">
          Sign in
        </Button>
        <Button href="/signup" variant="primary" size="sm">
          Build Your Resume
        </Button>
      </div>
    </nav>
  );
}
