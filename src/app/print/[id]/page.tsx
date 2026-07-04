"use client";

import { use, useEffect, useState } from "react";
import { ResumePreview } from "@/components/resume/ResumePreview";
import type { Resume } from "@/lib/types";

/**
 * Clean, standalone print view — renders ONLY the resume (no nav/sidebar/editor)
 * and triggers the browser print dialog. "Save as PDF" then produces a single
 * clean resume page instead of the whole app UI.
 */
export default function PrintResumePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [resume, setResume] = useState<Resume | null | undefined>(undefined);

  useEffect(() => {
    fetch(`/api/resumes/${id}`)
      .then((r) => (r.ok ? r.json() : { resume: null }))
      .then((d) => setResume(d.resume ?? null))
      .catch(() => setResume(null));
  }, [id]);

  useEffect(() => {
    if (resume) {
      // ?noprint => auto print dialog skip (testing/preview ke liye)
      if (new URLSearchParams(window.location.search).has("noprint")) return;
      const t = setTimeout(() => window.print(), 700);
      return () => clearTimeout(t);
    }
  }, [resume]);

  if (resume === undefined) return <div style={{ padding: 40, fontFamily: "sans-serif" }}>Loading…</div>;
  if (resume === null) return <div style={{ padding: 40, fontFamily: "sans-serif" }}>Resume not found.</div>;

  return (
    <div className="print-wrap">
      <ResumePreview data={resume.data} template={resume.template} />
      <style>{`
        html, body { background:#fff; margin:0; padding:0; }
        .print-wrap { max-width:820px; margin:0 auto; padding:24px; }
        /* Screen-wali shadow/rounded hata do; print ke liye saaf paper */
        .print-wrap .rp-paper { box-shadow:none !important; border-radius:0 !important; min-height:auto !important; }
        @media print {
          @page { margin:12mm; }
          .print-wrap { max-width:none; margin:0; padding:0; }
          .print-wrap .rp-paper { box-shadow:none !important; }
        }
      `}</style>
    </div>
  );
}
