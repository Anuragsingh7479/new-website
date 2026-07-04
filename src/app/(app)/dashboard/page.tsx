"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/providers/AuthProvider";
import { usePremium } from "@/components/providers/PremiumProvider";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { PageHeader } from "@/components/app/PageHeader";
import * as data from "@/lib/data";
import { FREE_RESUME_LIMIT, type Resume, type CoverLetter } from "@/lib/types";
import { uid, blankResumeData } from "@/lib/data";

export default function DashboardPage() {
  const { user, isPro, hasAccess } = useAuth();
  const { openUpgrade } = usePremium();
  const router = useRouter();
  const [resumes, setResumes] = useState<Resume[]>([]);
  const [covers, setCovers] = useState<CoverLetter[]>([]);

  useEffect(() => {
    if (!user) return;
    let live = true;
    (async () => {
      const [r, c] = await Promise.all([
        data.listResumes(user.uid),
        data.listCoverLetters(user.uid),
      ]);
      if (live) {
        setResumes(r);
        setCovers(c);
      }
    })();
    return () => {
      live = false;
    };
  }, [user]);

  if (!user) return null;

  async function createResume() {
    if (!hasAccess && resumes.length >= FREE_RESUME_LIMIT) {
      openUpgrade(
        `Free plan me sirf ${FREE_RESUME_LIMIT} resume. Unlimited resumes ke liye Pro lein.`
      );
      return;
    }
    const now = Date.now();
    const r: Resume = {
      id: uid(),
      title: "Untitled resume",
      template: "modern",
      data: blankResumeData(user!.name, user!.email),
      createdAt: now,
      updatedAt: now,
    };
    await data.saveResume(user!.uid, r);
    router.push(`/resumes/${r.id}`);
  }

  const stats = [
    { label: "Resumes", value: resumes.length, href: "/resumes" },
    { label: "Cover letters", value: covers.length, href: "/cover-letters" },
    { label: "Plan", value: isPro ? "Pro" : hasAccess ? "Admin" : "Free", href: "/billing" },
  ];

  return (
    <div>
      <PageHeader
        title={`Welcome, ${user.name}`}
        subtitle="Build, improve, and track your job applications."
        action={<Button onClick={createResume}>+ New Resume</Button>}
      />

      <div className="grid gap-4 sm:grid-cols-3">
        {stats.map((s) => (
          <Link key={s.label} href={s.href}>
            <Card className="transition-colors hover:border-hairline-strong">
              <div className="text-sm text-mute">{s.label}</div>
              <div className="mt-1 text-2xl font-semibold">{s.value}</div>
            </Card>
          </Link>
        ))}
      </div>

      {!hasAccess && (
        <Card className="mt-4 flex flex-wrap items-center justify-between gap-4 border-accent-yellow/40">
          <div>
            <div className="text-sm font-semibold text-ink">You&apos;re on the Free plan 🎉</div>
            <div className="mt-1 text-sm text-mute">
              Build &amp; preview for free. Upgrade to Pro to <b className="text-ink">download</b>,
              unlock the <b className="text-ink">full ATS analysis</b> &amp; premium templates.
            </div>
          </div>
          <Button href="/pricing">Upgrade to Pro</Button>
        </Card>
      )}

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <RecentList
          title="Recent resumes"
          href="/resumes"
          empty="No resumes yet — create your first one."
          items={resumes.slice(0, 4).map((r) => ({
            id: r.id,
            title: r.title,
            sub: `${r.template} · updated ${timeago(r.updatedAt)}`,
            href: `/resumes/${r.id}`,
          }))}
          onCreate={createResume}
        />
        <RecentList
          title="Recent cover letters"
          href="/cover-letters"
          empty="No cover letters yet."
          items={covers.slice(0, 4).map((c) => ({
            id: c.id,
            title: c.title,
            sub: `${c.company || "—"} · updated ${timeago(c.updatedAt)}`,
            href: `/cover-letters/${c.id}`,
          }))}
          onCreate={() => router.push("/cover-letters/new")}
        />
      </div>
    </div>
  );
}

function RecentList({
  title,
  href,
  empty,
  items,
  onCreate,
}: {
  title: string;
  href: string;
  empty: string;
  items: { id: string; title: string; sub: string; href: string }[];
  onCreate: () => void;
}) {
  return (
    <Card>
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-sm font-semibold">{title}</h2>
        <Link href={href} className="text-xs text-mute hover:text-ink">
          View all
        </Link>
      </div>
      {items.length === 0 ? (
        <div className="rounded-md border border-dashed border-hairline px-4 py-8 text-center text-sm text-mute">
          {empty}
          <div className="mt-3">
            <Button size="sm" variant="install" onClick={onCreate}>
              + Create
            </Button>
          </div>
        </div>
      ) : (
        <ul className="divide-y divide-hairline">
          {items.map((it) => (
            <li key={it.id}>
              <Link
                href={it.href}
                className="flex items-center justify-between py-2.5 text-sm hover:text-ink"
              >
                <span className="text-ink">{it.title}</span>
                <span className="text-xs text-stone">{it.sub}</span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </Card>
  );
}

function timeago(ts: number) {
  const s = Math.floor((Date.now() - ts) / 1000);
  if (s < 60) return "just now";
  if (s < 3600) return `${Math.floor(s / 60)}m ago`;
  if (s < 86400) return `${Math.floor(s / 3600)}h ago`;
  return `${Math.floor(s / 86400)}d ago`;
}
