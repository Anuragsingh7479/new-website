import Link from "next/link";
import { Logo } from "./Logo";

const SUPPORT_EMAIL = process.env.NEXT_PUBLIC_SUPPORT_EMAIL ?? "anuragsingh02100@gmail.com";
const SUPPORT_PHONE = "+91 92591 59318";

const COLUMNS = [
  {
    title: "Product",
    links: [
      { label: "Resume Builder", href: "/signup" },
      { label: "Cover Letters", href: "/signup" },
      { label: "ATS Score Checker", href: "/ats" },
      { label: "Templates", href: "/#templates" },
      { label: "Pricing", href: "/pricing" },
    ],
  },
  {
    title: "Company",
    links: [
      { label: "Help Center", href: "/help" },
      { label: "FAQ", href: "/faq" },
      { label: "Contact Support", href: "/contact" },
    ],
  },
  {
    title: "Legal",
    links: [
      { label: "Terms of Service", href: "/terms" },
      { label: "Refund Policy", href: "/terms" },
      { label: "Privacy Policy", href: "/terms" },
    ],
  },
];

export function Footer() {
  return (
    <footer className="border-t border-hairline">
      <div className="mx-auto grid max-w-container gap-10 px-6 py-14 sm:grid-cols-2 lg:grid-cols-[1.6fr_1fr_1fr_1fr]">
        <div>
          <Logo />
          <p className="mt-4 max-w-[280px] text-sm leading-relaxed text-mute">
            AI-powered resume &amp; cover letter builder with an ATS analyzer. Build a resume that
            beats the ATS and gets you hired faster.
          </p>
          <div className="mt-5 space-y-1.5 text-sm">
            <a href={`mailto:${SUPPORT_EMAIL}`} className="block text-mute no-underline hover:text-ink">
              ✉ {SUPPORT_EMAIL}
            </a>
            <a
              href={`tel:${SUPPORT_PHONE.replace(/\s/g, "")}`}
              className="block text-mute no-underline hover:text-ink"
            >
              ☎ {SUPPORT_PHONE}
            </a>
          </div>
        </div>

        {COLUMNS.map((col) => (
          <div key={col.title}>
            <h3 className="mb-3 text-[13px] font-medium text-ink">{col.title}</h3>
            <ul className="space-y-2.5">
              {col.links.map((l) => (
                <li key={l.label}>
                  <Link
                    href={l.href}
                    className="text-sm text-mute no-underline transition-colors hover:text-ink"
                  >
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div className="border-t border-hairline">
        <div className="mx-auto flex max-w-container flex-col gap-3 px-6 py-6 text-[13px] text-stone sm:flex-row sm:items-center sm:justify-between">
          <span>© {new Date().getFullYear()} NextHireAI. All rights reserved.</span>
          <div className="flex flex-wrap gap-x-5 gap-y-1">
            <Link href="/terms" className="text-mute no-underline hover:text-ink">
              Terms
            </Link>
            <Link href="/terms" className="text-mute no-underline hover:text-ink">
              Privacy
            </Link>
            <Link href="/terms" className="text-mute no-underline hover:text-ink">
              Refunds
            </Link>
            <Link href="/contact" className="text-mute no-underline hover:text-ink">
              Support
            </Link>
          </div>
        </div>
        <div className="mx-auto max-w-container px-6 pb-6 text-[11px] leading-relaxed text-stone/80">
          NextHireAI helps you create resumes and cover letters with AI. Results depend on your
          input and target roles; we do not guarantee interviews or job offers. Payments are
          processed securely and subscriptions are governed by our Terms &amp; Refund Policy.
        </div>
      </div>
    </footer>
  );
}
