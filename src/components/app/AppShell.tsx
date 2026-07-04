"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/components/providers/AuthProvider";
import { Logo } from "@/components/landing/Logo";
import { PLAN_LABELS, hasAppAccess, isAdminUser } from "@/lib/types";

const NAV = [
  { href: "/dashboard", label: "Dashboard", icon: "▦" },
  { href: "/resumes", label: "Resumes", icon: "▤" },
  { href: "/cover-letters", label: "Cover Letters", icon: "✎" },
  { href: "/ats", label: "ATS Score", icon: "◎" },
  { href: "/billing", label: "Billing", icon: "❖" },
  { href: "/account", label: "Account", icon: "⚙" },
];

/** Protected shell: redirects to /login when signed out; renders sidebar + topbar. */
export function AppShell({ children }: { children: React.ReactNode }) {
  const { user, loading, isPro, signOut } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!loading && !user) router.replace("/login");
  }, [loading, user, router]);

  if (loading || !user) {
    return (
      <div className="flex min-h-screen items-center justify-center text-sm text-mute">
        Loading…
      </div>
    );
  }

  const access = hasAppAccess(user); // Pro or admin — controls the Upgrade nudge
  const admin = isAdminUser(user);

  return (
    <div className="flex min-h-screen">
      {/* sidebar */}
      <aside className="hidden w-[232px] shrink-0 flex-col border-r border-hairline px-4 py-5 md:flex">
        <div className="px-2">
          <Logo />
        </div>
        <nav className="mt-7 flex flex-1 flex-col gap-1">
          {NAV.map((item) => {
            const active = pathname === item.href || pathname.startsWith(item.href + "/");
            return (
              <Link
                key={item.href}
                href={item.href}
                className={
                  "flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors " +
                  (active
                    ? "bg-surface-card text-ink"
                    : "text-mute hover:bg-surface-elevated hover:text-ink")
                }
              >
                <span className="text-stone">{item.icon}</span>
                {item.label}
              </Link>
            );
          })}
        </nav>
        {admin && (
          <Link
            href="/admin"
            className="rounded-md px-3 py-2 text-sm text-accent-yellow hover:bg-surface-elevated"
          >
            ★ Admin Panel
          </Link>
        )}
        <button
          onClick={() => {
            signOut();
            router.replace("/login");
          }}
          className="mt-2 rounded-md px-3 py-2 text-left text-sm text-mute hover:bg-surface-elevated hover:text-ink"
        >
          ⏻ Sign out
        </button>
      </aside>

      {/* main */}
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex items-center justify-between border-b border-hairline px-6 py-3.5">
          <div className="flex items-center gap-2 md:hidden">
            <Logo />
          </div>
          <div className="hidden text-sm text-mute md:block">
            Welcome back, <span className="text-ink">{user.name}</span>
          </div>
          <div className="flex items-center gap-3">
            <span
              className={
                "rounded-full border px-3 py-1 font-mono text-[11px] uppercase tracking-[1px] " +
                (access
                  ? "border-transparent bg-accent-yellow font-semibold text-black"
                  : "border-hairline text-mute")
              }
            >
              {admin ? "Admin" : isPro ? PLAN_LABELS[user.plan] : "Free plan"}
            </span>
            {!access && (
              <Link
                href="/pricing"
                className="rounded-md bg-primary px-3 py-1.5 text-[13px] font-medium text-on-primary hover:bg-primary-pressed"
              >
                Subscribe
              </Link>
            )}
          </div>
        </header>

        {/* mobile nav — includes Admin + Sign out since the sidebar is hidden here */}
        <div className="flex gap-1 overflow-x-auto border-b border-hairline px-4 py-2 md:hidden">
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="whitespace-nowrap rounded-md px-3 py-1.5 text-[13px] text-mute hover:text-ink"
            >
              {item.label}
            </Link>
          ))}
          {admin && (
            <Link
              href="/admin"
              className="whitespace-nowrap rounded-md px-3 py-1.5 text-[13px] font-medium text-accent-yellow"
            >
              ★ Admin
            </Link>
          )}
          <button
            onClick={() => {
              signOut();
              router.replace("/login");
            }}
            className="whitespace-nowrap rounded-md px-3 py-1.5 text-[13px] text-mute hover:text-ink"
          >
            ⏻ Sign out
          </button>
        </div>

        <main className="flex-1 px-6 py-7">{children}</main>
      </div>
    </div>
  );
}
