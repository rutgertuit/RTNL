import type { Metadata } from "next";
import Link from "next/link";
import { Nav } from "@/components/nav/Nav";
import { Footer } from "@/components/footer/Footer";
import { AppChrome } from "@/components/chrome/AppChrome";
import { Breadcrumb } from "@/components/breadcrumb/Breadcrumb";

const TITLE = "Prism";
const TAGLINE = "Agentic creative-agency tooling for YouTube.";
const DESCRIPTION =
  "Prism turns static brand assets into platform-ready video variants (16:9 + 9:16 Shorts), localised, brand-compliance-checked, and ready to push to Google Ads. Designed so a single Client Service Director can run more of the creative workflow that normally takes several people. GCP-native, YouTube-first, Benelux mid-market focus for the MVP. 10 Cloud Run services + a Next.js cockpit + a Composer DAG live in the iamagency project, europe-west4.";

const REPO_URL = "https://github.com/rutgertuit/prism";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  openGraph: { title: TITLE, description: DESCRIPTION, type: "article" },
  robots: { index: true, follow: true },
};

const ld = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "TechArticle",
      "@id": "https://rutgertuit.nl/technical/prism#article",
      headline: TITLE,
      description: DESCRIPTION,
      url: "https://rutgertuit.nl/technical/prism",
      author: { "@id": "https://rutgertuit.nl/#person" },
      inLanguage: "en",
      proficiencyLevel: "Expert",
      about: { "@id": "https://rutgertuit.nl/technical/prism#repo" },
    },
    {
      "@type": "SoftwareSourceCode",
      "@id": "https://rutgertuit.nl/technical/prism#repo",
      name: "Prism",
      description: DESCRIPTION,
      codeRepository: REPO_URL,
      programmingLanguage: ["Python", "TypeScript", "HCL"],
      runtimePlatform: "Google Cloud Run + Cloud Composer",
      author: { "@id": "https://rutgertuit.nl/#person" },
      applicationCategory: "CreativeAgencyTooling",
      operatingSystem: "Cloud (containerised)",
    },
  ],
};

interface IASection {
  num: string;
  name: string;
  what: string;
}
const IA_SECTIONS: IASection[] = [
  {
    num: "01",
    name: "Setup",
    what: "Onboarding wizard (per-client OAuth), Brand Kit extraction from PDFs or website URLs, client doc linkage. Skip-OAuth path lets a client onboard without Google linkage.",
  },
  {
    num: "02",
    name: "Create",
    what: "Brief form with cost-cap + budget tier. Generate service renders 16:9 variants via Veo 3 + Imagen 3 with cost pre-projection before any provider call.",
  },
  {
    num: "03",
    name: "Recut",
    what: "Reframe service produces 9:16 Shorts via vigenair + an FFmpeg worker. Dub service handles translation (Ariel) + Chirp 3 HD voice (no voice cloning in MVP).",
  },
  {
    num: "04",
    name: "Distribute",
    what: "Judge service runs compliance scoring (Gemini-as-judge, binary pass/fail). Ads service pushes the campaign — always PAUSED — and uploads to YouTube as UNLISTED. Insights service rolls VTR signals + creative DNA + prompt hints back into the Signal Wall.",
  },
];

interface ServiceRow {
  name: string;
  dir: string;
  job: string;
}
const SERVICES: ServiceRow[] = [
  {
    name: "Shared foundations",
    dir: "services/_shared/",
    job: "Audit logging via wrap(), shared JobState contract, register_service(), strict /healthz probe enforced on every revision.",
  },
  {
    name: "Brand Kit",
    dir: "services/brand_kit/",
    job: "Gemini-based brand-asset extraction from PDFs OR website URL distillation (v1.2).",
  },
  {
    name: "Onboarding Wizard",
    dir: "services/onboarding_wizard/",
    job: "Per-client OAuth + prechecks + linked client doc. Skip-OAuth path supported.",
  },
  {
    name: "Generate",
    dir: "services/generate/",
    job: "Veo 3 + Imagen 3 variant rendering (16:9). Cost-cap pre-projected before any provider call.",
  },
  {
    name: "Reframe",
    dir: "services/reframe/",
    job: "9:16 Smart-Reframe via vigenair + the FFmpeg worker.",
  },
  {
    name: "FFmpeg worker",
    dir: "services/ffmpeg_worker/",
    job: "Internal Cloud Run worker — pixel ops + keyframe extraction. Invoker-locked to Reframe + Judge.",
  },
  {
    name: "Dub",
    dir: "services/dub/",
    job: "Ariel-powered translation + Chirp 3 HD dubbing. No voice cloning in MVP.",
  },
  {
    name: "Judge",
    dir: "services/judge/",
    job: "Compliance scoring (Gemini-as-judge) — binary pass/fail; never a third state.",
  },
  {
    name: "Ads",
    dir: "services/ads/",
    job: "Google Ads campaign push (always PAUSED) + UNLISTED YouTube upload.",
  },
  {
    name: "Insights",
    dir: "services/insights/",
    job: "VTR signals, creative DNA, prompt hint generation. Cost rollup + 7d-trailing VTR mart + brand-colour segmentation.",
  },
];

interface DesignChoice {
  title: string;
  body: string;
}
const DESIGN_CHOICES: DesignChoice[] = [
  {
    title: "Strict /healthz probe on every revision",
    body: "Every Cloud Run service registers itself through a shared contract and ships a strict /healthz. A revision that doesn't pass doesn't get promoted. Healthchecks are infrastructure, not lore.",
  },
  {
    title: "Cost-cap pre-projected before any provider call",
    body: "Generate doesn't call Veo or Imagen until the projected cost has been computed against the budget tier in the Brief. The cost gate is the contract, not a warning after the fact.",
  },
  {
    title: "Always PAUSED, always UNLISTED",
    body: "Ads pushes campaigns in PAUSED state. YouTube uploads default to UNLISTED. Two safety defaults that make the difference between a tool you trust and a tool you watch closely. The Launch confirm modal in the cockpit makes the operator acknowledge the PAUSED state explicitly before push.",
  },
  {
    title: "Binary pass/fail compliance — never a third state",
    body: "Judge returns pass or fail. No 'maybe', no yellow/amber on compliance surfaces. The review gallery's design language enforces this — there is no third colour. Compliance ambiguity is the bug; remove the bug by removing the third state.",
  },
  {
    title: "Keyboard-first review",
    body: "The Review gallery uses j/k to navigate, a to approve, r to reject. Hover preview, structured toast errors. The Client Service Director is meant to clear a queue, not click through it.",
  },
  {
    title: "Type-the-name safety modal on destructive actions",
    body: "Revoking a client soft-deletes; restoring brings it back. But the revoke modal requires typing the client name. The pattern is borrowed from GitHub repo deletion — the friction is the feature.",
  },
  {
    title: "Audit-log everything via wrap()",
    body: "Every service action is wrapped through a shared audit-logging helper. The platform has a single audit shape, not 10 different per-service ones. Forensics work because the log shape is uniform.",
  },
  {
    title: "Industrial, restrained aesthetic",
    body: "Industrial restraint, no decorative gradients, no compliance yellow. The interface reads as something a working CSD trusts at 18:30 on a deadline day. It stays quiet on purpose.",
  },
];

interface StackRow {
  layer: string;
  detail: string;
}
const STACK: StackRow[] = [
  {
    layer: "Web cockpit",
    detail: "Next.js 14. Surfaces: Flight Deck (dashboard), Brand Kit, Brief, Review gallery, Launch confirm, Insights Signal Wall, Client Settings.",
  },
  {
    layer: "Services",
    detail: "9 FastAPI services + _shared foundations. Each ships a strict /healthz; each registers via the shared contract.",
  },
  {
    layer: "Generative",
    detail: "Veo 3 + Imagen 3 (Generate). Gemini for brand-kit extraction + compliance judging. Ariel + Chirp 3 HD (Dub). No voice cloning in MVP.",
  },
  {
    layer: "Worker pipelines",
    detail: "vigenair + the FFmpeg worker for 9:16 Smart-Reframe. Invoker-locked so only Reframe + Judge can call the worker.",
  },
  {
    layer: "Ingestion",
    detail: "Composer DAGs + dbt mart (fact_creative_performance). Synthetic backfill loader for environments without live ad data.",
  },
  {
    layer: "Infra",
    detail: "Terraform for the iamagency GCP project, europe-west4. Single-region MVP.",
  },
  {
    layer: "Vendored OSS",
    detail: "ariel, vigenair, dreamboard, copycat — pulled in as forks/ submodules and built into the Reframe + Dub paths.",
  },
  {
    layer: "Testing",
    detail: "943 frontend tests + 146 backend tests passing on MVP close. Per-service test suites run through Makefile targets.",
  },
];

export default function PrismPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(ld) }}
      />
      <Nav />
      <Breadcrumb
        trail={[
          { label: "Home", href: "/" },
          { label: "Technical / Deep End", href: "/#technical" },
          { label: "Prism" },
        ]}
      />
      <article className="rt-tuit rt-techwrite section section--surface">
        <div className="container">
          <header className="rt-techwrite__head">
            <div className="eyebrow eyebrow--warm">
              D · 07 · TECHNICAL WRITE-UP
            </div>
            <h1 className="rt-tuit__title">{TITLE}.</h1>
            <p className="rt-techwrite__tagline">{TAGLINE}</p>
            <p className="rt-tuit__lead">
              A single Client Service Director running more of the
              YouTube creative workflow that normally takes several
              people. Static brand assets in, platform-ready
              16:9 + 9:16 video variants out, compliance-judged and
              campaign-ready. Built to compress the part of the agency
              workflow that doesn&apos;t need three meetings.
            </p>
            <ul className="rt-techwrite__meta">
              <li>
                <span className="eyebrow">REPO</span>{" "}
                <a href={REPO_URL} target="_blank" rel="noopener noreferrer">
                  github.com/rutgertuit/prism →
                </a>
              </li>
              <li>
                <span className="eyebrow">RUNTIME</span> 10 Cloud Run
                services + Cloud Composer · europe-west4
              </li>
              <li>
                <span className="eyebrow">FOCUS</span> YouTube-first ·
                Benelux mid-market MVP
              </li>
              <li>
                <span className="eyebrow">STATUS</span> MVP closed
                2026-05-01 · published for portfolio transparency
              </li>
            </ul>
          </header>

          <section className="rt-techwrite__section">
            <div className="eyebrow">01 · FOUR-SECTION INFORMATION ARCHITECTURE</div>
            <h2>Setup · Create · Recut · Distribute.</h2>
            <p>
              The cockpit splits the workflow into four explicit
              sections — the operator always knows which stage of the
              process they&apos;re in, and the safety contracts attach
              to the sections, not to individual buttons.
            </p>
            <div className="rt-techwrite__table">
              <table>
                <thead>
                  <tr>
                    <th>Section</th>
                    <th>What it does</th>
                  </tr>
                </thead>
                <tbody>
                  {IA_SECTIONS.map((s) => (
                    <tr key={s.num}>
                      <td>
                        <strong>
                          {s.num} · {s.name}
                        </strong>
                      </td>
                      <td>{s.what}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          <section className="rt-techwrite__section">
            <div className="eyebrow">02 · THE FLEET</div>
            <h2>Nine services + shared foundations.</h2>
            <p>
              Each service is its own Cloud Run revision with a strict
              <code>/healthz</code> probe. Every service registers
              through the same shared contract; every action is audit-
              logged through the same <code>wrap()</code>. One platform
              shape across nine surfaces — not nine accidental
              architectures.
            </p>
            <div className="rt-techwrite__table">
              <table>
                <thead>
                  <tr>
                    <th>Service</th>
                    <th>Directory</th>
                    <th>Job</th>
                  </tr>
                </thead>
                <tbody>
                  {SERVICES.map((s) => (
                    <tr key={s.name}>
                      <td>
                        <strong>{s.name}</strong>
                      </td>
                      <td>
                        <code>{s.dir}</code>
                      </td>
                      <td>{s.job}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          <section className="rt-techwrite__section">
            <div className="eyebrow">03 · NOTABLE DESIGN CHOICES</div>
            <h2>The safety contracts.</h2>
            <p>
              Most of these aren&apos;t features — they&apos;re
              decisions that make the tool trustable on a deadline day.
              The platform is the contract; the cockpit just enforces
              it on the operator side.
            </p>
            <dl className="rt-techwrite__choices">
              {DESIGN_CHOICES.map((c) => (
                <div key={c.title}>
                  <dt>{c.title}</dt>
                  <dd>{c.body}</dd>
                </div>
              ))}
            </dl>
          </section>

          <section className="rt-techwrite__section">
            <div className="eyebrow">04 · STACK</div>
            <h2>What runs underneath.</h2>
            <div className="rt-techwrite__table">
              <table>
                <thead>
                  <tr>
                    <th>Layer</th>
                    <th>Detail</th>
                  </tr>
                </thead>
                <tbody>
                  {STACK.map((s) => (
                    <tr key={s.layer}>
                      <td>
                        <strong>{s.layer}</strong>
                      </td>
                      <td>{s.detail}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          <section className="rt-techwrite__section">
            <div className="eyebrow">05 · DELIVERY MODEL</div>
            <h2>Built with a multi-agent setup.</h2>
            <p>
              Prism is also a working example of how the project was
              built. Specialist agents work in separate git worktrees,
              a review agent checks every PR, and I gate the merges at
              module boundaries. Locked contracts live
              in <code>FOR_AGENTS.md</code>: what the audit shape must
              be, what the strict /healthz contract is, what the cost-
              cap projection rule says. The same agent discipline that
              ships the four sections of the cockpit ships the
              codebase.
            </p>
          </section>

          <section className="rt-techwrite__section rt-techwrite__section--closer">
            <div className="eyebrow eyebrow--warm">WHY THIS EXISTS</div>
            <p>
              A YouTube-first creative workflow normally takes several
              people — director, editor, dubber, compliance, ads
              ops. A lot of that work is mechanical and
              shouldn&apos;t require a meeting. Prism absorbs the
              mechanical layer so the Client Service Director keeps
              the creative call — what we&apos;re saying, to whom,
              with what cost cap — and the platform handles the rest.
              Same{" "}
              <Link href="/technical/luminary">
                separate-the-engine-from-the-prompt
              </Link>{" "}
              instinct as the rest of the stack, applied to the
              busiest day in an account director&apos;s week.
            </p>
            <p className="rt-techwrite__signoff">
              <a
                href={REPO_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="rt-techwrite__cta"
              >
                Read the source on GitHub →
              </a>
            </p>
          </section>
        </div>
      </article>
      <Footer />
      <AppChrome />
    </>
  );
}
