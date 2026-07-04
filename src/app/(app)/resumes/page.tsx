"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/providers/AuthProvider";
import { usePremium } from "@/components/providers/PremiumProvider";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { PageHeader } from "@/components/app/PageHeader";
import { EmptyState } from "@/components/app/EmptyState";
import * as data from "@/lib/data";
import { uid, blankResumeData } from "@/lib/data";
import { FREE_RESUME_LIMIT, type Resume } from "@/lib/types";

export default function ResumesPage() {
  const { user, hasAccess } = useAuth();
  const { openUpgrade } = usePremium();
  const router = useRouter();
  const [resumes, setResumes] = useState<Resume[]>([]);

  const reload = () => {
    if (user) data.listResumes(user.uid).then(setResumes);
  };
  useEffect(reload, [user]);

  if (!user) return null;

  async function create() {
    if (!hasAccess && resumes.length >= FREE_RESUME_LIMIT) {
      openUpgrade(
        `Free plan me sirf ${FREE_RESUME_LIMIT} resume ban sakte hain. Unlimited resumes ke liye Pro lein.`
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

  async function duplicate(r: Resume) {
    const now = Date.now();
    const copy: Resume = {
      ...r,
      id: uid(),
      title: `${r.title} (copy)`,
      createdAt: now,
      updatedAt: now,
    };
    await data.saveResume(user!.uid, copy);
    reload();
  }

  async function remove(r: Resume) {
    if (!confirm(`Delete "${r.title}"? This cannot be undone.`)) return;
    await data.deleteResume(user!.uid, r.id);
    reload();
  }

  return (
    <div>
      <PageHeader
        title="Resumes"
        subtitle="Create, edit, duplicate, or delete your resumes."
        action={<Button onClick={create}>+ New Resume</Button>}
      />

      {resumes.length === 0 ? (
        <EmptyState
          icon="▤"
          title="No resumes yet"
          description="Start building an ATS-ready resume with AI assistance."
          action={<Button onClick={create}>Create your first resume</Button>}
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {resumes.map((r) => (
            <Card key={r.id} className="flex flex-col">
              <div className="flex-1">
                <div className="text-base font-medium text-ink">{r.title}</div>
                <div className="mt-1 text-xs capitalize text-mute">{r.template} template</div>
                <div className="mt-0.5 text-xs text-stone">{r.data.fullName}</div>
              </div>
              <div className="mt-4 flex items-center gap-2">
                <Button href={`/resumes/${r.id}`} size="sm">
                  Edit
                </Button>
                <Button size="sm" variant="install" onClick={() => duplicate(r)}>
                  Duplicate
                </Button>
                <button
                  onClick={() => remove(r)}
                  className="ml-auto rounded-md px-2 py-1.5 text-[13px] text-mute hover:text-accent-red"
                >
                  Delete
                </button>
              </div>
            </Card>
          ))}
        </div>
      )}

      <p className="mt-6 text-xs text-stone">
        <Link href="/dashboard" className="hover:text-ink">
          ← Back to dashboard
        </Link>
      </p>
    </div>
  );
}
