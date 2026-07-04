"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useAuth } from "@/components/providers/AuthProvider";
import { usePremium } from "@/components/providers/PremiumProvider";
import { ResumePreview } from "./ResumePreview";
import { AtsCard } from "@/components/ats/AtsCard";
import { Field, Input, Textarea, Label } from "@/components/ui/Field";
import { Button } from "@/components/ui/Button";
import * as data from "@/lib/data";
import { aiSummary, aiImprove, aiBullets, aiSkills } from "@/lib/ai/mock";
import {
  PREMIUM_TEMPLATES,
  type Resume,
  type ResumeData,
  type TemplateId,
} from "@/lib/types";

const TEMPLATES: { id: TemplateId; label: string }[] = [
  { id: "modern", label: "Modern" },
  { id: "professional", label: "Professional" },
  { id: "minimal", label: "Minimal" },
  { id: "corporate", label: "Corporate" },
  { id: "compact", label: "Compact" },
  { id: "student", label: "Student" },
  { id: "creative", label: "Creative" },
  { id: "executive", label: "Executive" },
  { id: "elegant", label: "Elegant" },
  { id: "sidebar", label: "Sidebar" },
  { id: "bold", label: "Bold" },
  { id: "onyx", label: "Onyx" },
];

export function ResumeBuilder({ initial }: { initial: Resume }) {
  const { user, hasAccess } = useAuth();
  const { requirePro } = usePremium();
  const [resume, setResume] = useState<Resume>(initial);
  const [saved, setSaved] = useState(true);
  const [busy, setBusy] = useState<string | null>(null);
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Debounced autosave.
  const scheduleSave = useCallback(
    (next: Resume) => {
      setSaved(false);
      if (saveTimer.current) clearTimeout(saveTimer.current);
      saveTimer.current = setTimeout(async () => {
        if (user) await data.saveResume(user.uid, { ...next, updatedAt: Date.now() });
        setSaved(true);
      }, 600);
    },
    [user]
  );

  function patch(p: Partial<Resume>) {
    setResume((prev) => {
      const next = { ...prev, ...p };
      scheduleSave(next);
      return next;
    });
  }
  function patchData(p: Partial<ResumeData>) {
    setResume((prev) => {
      const next = { ...prev, data: { ...prev.data, ...p } };
      scheduleSave(next);
      return next;
    });
  }

  useEffect(() => {
    return () => {
      if (saveTimer.current) clearTimeout(saveTimer.current);
    };
  }, []);

  const d = resume.data;

  function setTemplate(id: TemplateId) {
    if (PREMIUM_TEMPLATES.includes(id) && !hasAccess) {
      requirePro("Creative & Executive are premium templates. Upgrade to Pro to use them.");
      return;
    }
    patch({ template: id });
  }

  // Free users get limited AI (allowed in demo). The real server route meters
  // free usage and returns 402 once the monthly limit is hit.
  async function run(key: string, fn: () => Promise<void>) {
    setBusy(key);
    try {
      await fn();
    } finally {
      setBusy(null);
    }
  }

  async function download() {
    if (!requirePro()) return;
    // Latest edit save karo, phir sirf resume wala clean print-view kholo.
    if (user) await data.saveResume(user.uid, { ...resume, updatedAt: Date.now() });
    window.open(`/print/${resume.id}`, "_blank");
  }

  const firstExp = d.experience[0];

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.05fr)]">
      {/* ── Editor ──────────────────────────────────────────────────────── */}
      <div className="space-y-4">
        <div className="flex items-center justify-between gap-3">
          <input
            value={resume.title}
            onChange={(e) => patch({ title: e.target.value })}
            className="min-w-0 flex-1 bg-transparent text-lg font-semibold text-ink outline-none"
            aria-label="Resume title"
          />
          <span className="shrink-0 text-xs text-stone">{saved ? "Saved" : "Saving…"}</span>
        </div>

        <Section title="Details">
          <div className="grid grid-cols-2 gap-3">
            <Field label="Full name">
              <Input value={d.fullName} onChange={(e) => patchData({ fullName: e.target.value })} />
            </Field>
            <Field label="Job title">
              <Input value={d.jobTitle} onChange={(e) => patchData({ jobTitle: e.target.value })} />
            </Field>
            <Field label="Email">
              <Input value={d.email} onChange={(e) => patchData({ email: e.target.value })} />
            </Field>
            <Field label="Phone">
              <Input value={d.phone} onChange={(e) => patchData({ phone: e.target.value })} />
            </Field>
            <Field label="Location">
              <Input value={d.location} onChange={(e) => patchData({ location: e.target.value })} />
            </Field>
            <Field label="Website">
              <Input value={d.website} onChange={(e) => patchData({ website: e.target.value })} />
            </Field>
          </div>
        </Section>

        <Section title="Professional summary">
          <Textarea
            rows={3}
            value={d.summary}
            onChange={(e) => patchData({ summary: e.target.value })}
          />
          <AiRow>
            <AiButton
              busy={busy === "sum"}
              onClick={() =>
                run("sum", async () => patchData({ summary: await aiSummary(d) }))
              }
            >
              AI Summary Generator
            </AiButton>
            <AiButton
              busy={busy === "imp"}
              onClick={() =>
                run("imp", async () => patchData({ summary: await aiImprove(d.summary) }))
              }
            >
              Improve writing
            </AiButton>
          </AiRow>
        </Section>

        <Section title="Experience">
          {firstExp && (
            <>
              <Field label="Role & company">
                <Input
                  value={`${firstExp.role}${firstExp.company ? " · " + firstExp.company : ""}`}
                  onChange={(e) => {
                    const [role, company] = e.target.value.split("·").map((s) => s.trim());
                    updateExp(0, { role: role ?? "", company: company ?? "" });
                  }}
                />
              </Field>
              <Field label="Period">
                <Input
                  value={firstExp.period}
                  onChange={(e) => updateExp(0, { period: e.target.value })}
                />
              </Field>
              <div className="mt-1">
                <Label>Bullet points (one per line)</Label>
                <Textarea
                  rows={4}
                  value={firstExp.bullets.join("\n")}
                  onChange={(e) =>
                    updateExp(0, { bullets: e.target.value.split("\n") })
                  }
                />
              </div>
              <AiRow>
                <AiButton
                  busy={busy === "bul"}
                  onClick={() =>
                    run("bul", async () =>
                      updateExp(0, { bullets: await aiBullets(firstExp.role) })
                    )
                  }
                >
                  AI Bullet Points
                </AiButton>
              </AiRow>
            </>
          )}
        </Section>

        <Section title="Skills">
          <Input
            value={d.skills.join(", ")}
            onChange={(e) =>
              patchData({ skills: e.target.value.split(",").map((s) => s.trim()) })
            }
          />
          <AiRow>
            <AiButton
              busy={busy === "sk"}
              onClick={() =>
                run("sk", async () => patchData({ skills: await aiSkills(d.jobTitle) }))
              }
            >
              AI Skills Suggestion
            </AiButton>
          </AiRow>
        </Section>

        <AtsCard data={d} isPro={hasAccess} />
      </div>

      {/* ── Preview ─────────────────────────────────────────────────────── */}
      <div className="lg:sticky lg:top-4 lg:self-start">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap gap-2">
            {TEMPLATES.map((t) => {
              const locked = PREMIUM_TEMPLATES.includes(t.id) && !hasAccess;
              const active = resume.template === t.id;
              return (
                <button
                  key={t.id}
                  onClick={() => setTemplate(t.id)}
                  className={
                    "rounded-full border px-3.5 py-1.5 text-[13px] transition-colors " +
                    (active
                      ? "border-transparent bg-ink font-semibold text-black"
                      : "border-hairline bg-surface-elevated text-body hover:border-hairline-strong")
                  }
                >
                  {t.label}
                  {locked && <span className="ml-1.5 text-[10px] opacity-70">🔒</span>}
                </button>
              );
            })}
          </div>
          <div className="flex gap-2">
            <Button size="sm" onClick={() => download()}>
              {hasAccess ? "⬇ " : "🔒 "}Download PDF
            </Button>
          </div>
        </div>
        <ResumePreview data={d} template={resume.template} />
      </div>
    </div>
  );

  function updateExp(i: number, p: Partial<ResumeData["experience"][number]>) {
    setResume((prev) => {
      const experience = prev.data.experience.map((e, idx) =>
        idx === i ? { ...e, ...p } : e
      );
      const next = { ...prev, data: { ...prev.data, experience } };
      scheduleSave(next);
      return next;
    });
  }
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-lg border border-hairline bg-surface p-5">
      <h2 className="mb-3 text-sm font-semibold">{title}</h2>
      {children}
    </div>
  );
}

function AiRow({ children }: { children: React.ReactNode }) {
  return <div className="mt-3 flex flex-wrap gap-2">{children}</div>;
}

function AiButton({
  children,
  onClick,
  busy,
}: {
  children: React.ReactNode;
  onClick: () => void;
  busy: boolean;
}) {
  return (
    <button
      onClick={onClick}
      disabled={busy}
      className="inline-flex items-center gap-1.5 rounded-md border border-hairline bg-surface-card px-2.5 py-1.5 text-xs font-medium text-charcoal transition-colors hover:border-hairline-strong hover:bg-surface-elevated disabled:opacity-60"
    >
      <span className="text-accent-yellow">✦</span>
      {busy ? "Generating…" : children}
    </button>
  );
}
