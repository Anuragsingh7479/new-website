import type { ResumeData, TemplateId } from "@/lib/types";

/**
 * Renders a resume onto a white "paper" surface. Each template is a distinct
 * visual treatment of the same data. Pure + deterministic so it can also be
 * reused by the PDF/DOCX exporters later.
 */
export function ResumePreview({
  data,
  template,
}: {
  data: ResumeData;
  template: TemplateId;
}) {
  const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
    <div style={{ marginTop: 18 }}>
      <h3 className={`rp-h rp-h-${template}`}>{title}</h3>
      {children}
    </div>
  );

  const contact = [data.email, data.phone, data.location, data.website].filter(Boolean);

  const Experience = () => (
    <Section title="Experience">
      {data.experience.map((e) => (
        <div key={e.id} style={{ marginBottom: 12 }}>
          <div style={{ fontSize: 13, fontWeight: 600 }}>
            {e.role}
            {e.company ? ` · ${e.company}` : ""}
          </div>
          <div style={{ fontSize: 11, color: "#777", margin: "1px 0 4px" }}>{e.period}</div>
          <ul style={{ margin: 0, paddingLeft: 16 }}>
            {e.bullets.filter(Boolean).map((b, i) => (
              <li key={i} style={{ fontSize: 12, lineHeight: 1.55, color: "#333", marginBottom: 2 }}>
                {b}
              </li>
            ))}
          </ul>
        </div>
      ))}
    </Section>
  );

  const Education = () => (
    <Section title="Education">
      {data.education.map((ed) => (
        <div key={ed.id} style={{ marginBottom: 8 }}>
          <div style={{ fontSize: 13, fontWeight: 600 }}>{ed.degree}</div>
          <div style={{ fontSize: 11, color: "#777" }}>
            {ed.school} · {ed.period}
          </div>
        </div>
      ))}
    </Section>
  );

  const Skills = () => (
    <Section title="Skills">
      <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
        {data.skills.filter(Boolean).map((s, i) => (
          <span key={i} className={`rp-skill rp-skill-${template}`}>
            {s}
          </span>
        ))}
      </div>
    </Section>
  );

  const Summary = () =>
    data.summary ? (
      <Section title="Summary">
        <div style={{ fontSize: 12.5, lineHeight: 1.6, color: "#333" }}>{data.summary}</div>
      </Section>
    ) : null;

  const Header = ({ light }: { light?: boolean }) => (
    <div>
      <div className={`rp-name rp-name-${template}`} style={light ? { color: "#fff" } : undefined}>
        {data.fullName}
      </div>
      <div className={`rp-title rp-title-${template}`}>{data.jobTitle}</div>
      <div
        className={`rp-contact rp-contact-${template}`}
        style={{ color: light ? "#cdddef" : "#666" }}
      >
        {contact.map((c, i) => (
          <span key={i}>{c}</span>
        ))}
      </div>
    </div>
  );

  // Layout family: sidebar (two-column) / band (top color block) / single column.
  const SIDEBAR: TemplateId[] = ["creative", "sidebar"];
  const BAND: TemplateId[] = ["professional", "corporate", "onyx"];
  const isSidebar = SIDEBAR.includes(template);
  const isBand = BAND.includes(template);

  return (
    <div className={`rp-paper rp-${template}`}>
      <RpStyles />
      {(template === "modern" || template === "bold") && <div className="rp-accent" />}

      {isBand && (
        <div className="rp-band">
          <Header light />
        </div>
      )}

      {isSidebar ? (
        <div className="rp-grid">
          <div className="rp-side">
            <Header light />
            <Skills />
          </div>
          <div className="rp-main">
            <Summary />
            <Experience />
            <Education />
          </div>
        </div>
      ) : (
        <div className="rp-pad">
          {!isBand && <Header />}
          <Summary />
          <Experience />
          <Education />
          <Skills />
        </div>
      )}
    </div>
  );
}

/** Scoped styles for the preview paper + per-template treatments. */
function RpStyles() {
  return (
    <style>{`
      .rp-paper{background:#fff;color:#1a1a1a;border-radius:8px;overflow:hidden;min-height:560px;
        font-family:var(--font-sans);box-shadow:0 18px 50px rgba(0,0,0,.5)}
      .rp-pad{padding:30px 34px}
      .rp-name{font-size:26px;font-weight:700;letter-spacing:-.4px}
      .rp-title{font-size:13px;font-weight:500;margin-top:2px}
      .rp-contact{font-size:11px;margin-top:8px;display:flex;gap:12px;flex-wrap:wrap}
      .rp-h{font-size:11px;letter-spacing:1.5px;text-transform:uppercase;color:#888;margin:0 0 8px;font-weight:600}
      .rp-skill{font-size:11px;background:#f1f1f1;border-radius:4px;padding:3px 8px;color:#333}

      /* modern */
      .rp-modern .rp-accent{height:8px;background:linear-gradient(90deg,#ff5757,#a1131a)}
      /* professional */
      .rp-professional .rp-band{background:#0d2a4a;color:#fff;padding:26px 34px}
      .rp-professional .rp-title-professional{color:#9cc4ef}
      .rp-professional .rp-h-professional{color:#0d2a4a;border-bottom:1.5px solid #0d2a4a;padding-bottom:3px}
      /* minimal */
      .rp-minimal .rp-name{font-weight:600;letter-spacing:-.2px}
      .rp-minimal .rp-h-minimal{color:#aaa;letter-spacing:2px}
      .rp-minimal .rp-skill-minimal{background:transparent;border:1px solid #ddd}
      /* creative */
      .rp-creative .rp-grid{display:grid;grid-template-columns:34% 1fr}
      .rp-creative .rp-side{background:#141414;color:#eee;padding:30px 22px;min-height:560px}
      .rp-creative .rp-side .rp-name{color:#fff;font-size:22px}
      .rp-creative .rp-side .rp-title-creative{color:#ff8a8a}
      .rp-creative .rp-side .rp-contact-creative{flex-direction:column;gap:4px;color:#bbb !important}
      .rp-creative .rp-side .rp-h-creative{color:#ff8a8a}
      .rp-creative .rp-side .rp-skill-creative{background:#262626;color:#eee}
      .rp-creative .rp-main{padding:30px 26px}
      /* executive */
      .rp-executive .rp-name{font-size:30px;font-weight:700;letter-spacing:-.6px;text-align:center}
      .rp-executive .rp-title-executive{text-align:center;color:#a1131a;font-weight:600;letter-spacing:2px;text-transform:uppercase;font-size:11px}
      .rp-executive .rp-contact-executive{justify-content:center;border-top:1px solid #ddd;border-bottom:1px solid #ddd;padding:8px 0;margin-top:12px}
      .rp-executive .rp-h-executive{text-align:center;color:#111}
      /* student */
      .rp-student .rp-name{color:#1f8a5b}
      .rp-student .rp-h-student{color:#1f8a5b}
      .rp-student .rp-skill-student{background:#e7f6ee;color:#1f6e49}

      /* elegant (premium) — refined serif + gold */
      .rp-elegant .rp-pad{padding:34px 42px}
      .rp-elegant .rp-name{font-family:Georgia,'Times New Roman',serif;font-size:30px;font-weight:600;letter-spacing:0;color:#1a1a2e}
      .rp-elegant .rp-title-elegant{color:#b08d57;font-weight:600;letter-spacing:.5px}
      .rp-elegant .rp-h-elegant{font-family:Georgia,serif;color:#1a1a2e;letter-spacing:.5px;text-transform:none;font-size:14px;border-bottom:1px solid #dcc9a3;padding-bottom:4px}
      .rp-elegant .rp-skill-elegant{background:#f7f2e9;color:#7a5f2e;border:1px solid #ecdcbf}

      /* corporate — navy band + blue accent */
      .rp-corporate .rp-band{background:#12324f;color:#fff;padding:24px 34px;border-bottom:4px solid #3b82c4}
      .rp-corporate .rp-band .rp-name{font-size:26px}
      .rp-corporate .rp-title-corporate{color:#a9cdec}
      .rp-corporate .rp-band .rp-contact-corporate{color:#cfe0f0}
      .rp-corporate .rp-h-corporate{color:#12324f;border-left:3px solid #3b82c4;padding-left:8px;letter-spacing:1px}
      .rp-corporate .rp-skill-corporate{background:#eaf1f8;color:#12324f}

      /* sidebar (premium) — navy left column */
      .rp-sidebar .rp-grid{display:grid;grid-template-columns:36% 1fr}
      .rp-sidebar .rp-side{background:#12324f;color:#e8eef5;padding:30px 22px;min-height:560px}
      .rp-sidebar .rp-side .rp-name{color:#fff;font-size:22px}
      .rp-sidebar .rp-side .rp-title-sidebar{color:#9cc4ef}
      .rp-sidebar .rp-side .rp-contact-sidebar{flex-direction:column;gap:4px;color:#c3d4e6 !important}
      .rp-sidebar .rp-side .rp-h-sidebar{color:#9cc4ef}
      .rp-sidebar .rp-side .rp-skill-sidebar{background:#1e456e;color:#e8eef5}
      .rp-sidebar .rp-main{padding:30px 26px}
      .rp-sidebar .rp-main .rp-h-sidebar{color:#12324f;border-bottom:1.5px solid #12324f;padding-bottom:3px}

      /* compact — dense, ATS-friendly */
      .rp-compact .rp-pad{padding:24px 30px}
      .rp-compact .rp-name{font-size:22px}
      .rp-compact .rp-title-compact{font-size:12px}
      .rp-compact .rp-h-compact{font-size:10px;letter-spacing:1px;color:#333;border-bottom:1px solid #ccc;padding-bottom:2px;margin-bottom:5px}
      .rp-compact .rp-skill-compact{background:#eee;font-size:10px;padding:2px 6px}

      /* bold (premium) — big name + filled headers */
      .rp-bold .rp-accent{height:10px;background:#111}
      .rp-bold .rp-name{font-size:32px;font-weight:800;letter-spacing:-1px;color:#111}
      .rp-bold .rp-title-bold{color:#e11d48;font-weight:700;text-transform:uppercase;letter-spacing:1px;font-size:12px}
      .rp-bold .rp-h-bold{background:#111;color:#fff;display:inline-block;padding:3px 9px;border-radius:3px;letter-spacing:1px}
      .rp-bold .rp-skill-bold{background:#111;color:#fff}

      /* onyx (premium) — black header block + gold */
      .rp-onyx .rp-band{background:#0d0d0d;color:#fff;padding:28px 34px}
      .rp-onyx .rp-band .rp-name{font-family:Georgia,serif;font-size:28px}
      .rp-onyx .rp-title-onyx{color:#c9a227;letter-spacing:2px;text-transform:uppercase;font-size:11px}
      .rp-onyx .rp-band .rp-contact-onyx{color:#bdbdbd}
      .rp-onyx .rp-h-onyx{font-family:Georgia,serif;color:#0d0d0d;letter-spacing:1px;text-transform:none;font-size:14px;border-bottom:1px solid #c9a227;padding-bottom:3px}
      .rp-onyx .rp-skill-onyx{background:#0d0d0d;color:#c9a227}
    `}</style>
  );
}
