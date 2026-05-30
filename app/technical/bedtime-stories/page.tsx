import type { Metadata } from "next";
import Link from "next/link";
import { Nav } from "@/components/nav/Nav";
import { Footer } from "@/components/footer/Footer";
import { AppChrome } from "@/components/chrome/AppChrome";
import { Breadcrumb } from "@/components/breadcrumb/Breadcrumb";

const TITLE = "Bedtime Stories";
const TAGLINE = "A Dutch AI bedtime-story generator. Creature Team Verhalenmachine.";
const DESCRIPTION =
  "Bedtime Stories — Creature Team Verhalenmachine — is a Dutch-language AI bedtime-story generator for kids. Build a fantasy world with characters, configure a story (chapters, age range, narrative arc, learning goals), and the app generates a multi-chapter illustrated story complete with educational quizzes, hero portraits, chapter illustrations, coloring pages, and a parent-only reading aid. Built on Next.js 16 + Gemini 3.1 Pro + Imagen 4, with Firestore + GCS for sync and persistence.";

const REPO_URL = "https://github.com/rutgertuit/creature-team-stories";

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
      "@id": "https://rutgertuit.nl/technical/bedtime-stories#article",
      headline: TITLE,
      description: DESCRIPTION,
      url: "https://rutgertuit.nl/technical/bedtime-stories",
      author: { "@id": "https://rutgertuit.nl/#person" },
      inLanguage: "en",
      proficiencyLevel: "Expert",
      about: { "@id": "https://rutgertuit.nl/technical/bedtime-stories#repo" },
    },
    {
      "@type": "SoftwareSourceCode",
      "@id": "https://rutgertuit.nl/technical/bedtime-stories#repo",
      name: "Creature Team Verhalenmachine",
      description: DESCRIPTION,
      codeRepository: REPO_URL,
      programmingLanguage: ["TypeScript"],
      runtimePlatform: "Google Cloud Run",
      author: { "@id": "https://rutgertuit.nl/#person" },
      applicationCategory: "ChildrensStoryGenerator",
      operatingSystem: "Cloud (containerised)",
    },
  ],
};

interface Capability {
  name: string;
  what: string;
}
const CAPABILITIES: Capability[] = [
  {
    name: "Conversational world-building",
    what: "Chat with the world editor (Gemini structured output) to add characters, traits, places, items. The world log updates in place — kids design the universe before the story starts.",
  },
  {
    name: "Three-state character toggle",
    what: "Every character is Mee (forced in), Thuis (forced out), or Willekeurig (random). Story cast is hard-capped at 7 characters — beyond that, narrative coherence collapses.",
  },
  {
    name: "Story generation",
    what: "Pick chapter count, target age, narrative arc, and learning goals. Outline first, then chapters generated in parallel batches of 3 with per-chapter retry. Each chapter ships with a self-read section, a 500–600 word parent-aid section, 5 quiz challenges, and an image prompt.",
  },
  {
    name: "Image generation",
    what: "Imagen 4 handles covers, in-chapter illustrations, coloring pages, character profile pictures, and per-pose character sheets. Generated assets are persisted to GCS and recovered on demand.",
  },
  {
    name: "Parchment reader",
    what: "Story renderer styled like a story book (Fredoka + Nunito, parchment background). Print mode generates separate parent and child booklet layouts via window.print().",
  },
  {
    name: "Parent lock",
    what: "PIN-gates settings, image regeneration, and any cost-sensitive surfaces. The grown-ups stay in control.",
  },
  {
    name: "Story archive + variation tracker",
    what: "Every generated story is saved. Past titles and synopses feed back into the prompt so the next story doesn't repeat itself.",
  },
  {
    name: "Cloud sync",
    what: "Firestore-backed sync for worlds, characters, and saved stories. Auto-sync runs in the background so a story started on one device finishes on another.",
  },
];

interface DesignChoice {
  title: string;
  body: string;
}
const DESIGN_CHOICES: DesignChoice[] = [
  {
    title: "Outline first, then chapters in parallel",
    body: "The pipeline generates an outline, then fans out three chapters at a time with per-chapter retry. Promise.allSettled keeps a single failing chapter from killing the run.",
  },
  {
    title: "Story cast is hard-capped at 7",
    body: "Beyond seven, the model starts losing track of who is in the room. The cap was enforced after early stories with larger casts kept producing characters who appeared once and vanished.",
  },
  {
    title: "Never pretty-print the world log into a prompt",
    body: "The world holds ~50 characters with long descriptions. JSON.stringify with indentation blows the token budget. Compact helpers in store.ts (buildWorldSummary, plus 200-char truncation in story prompts, 150-char in chat prompts) are mandatory.",
  },
  {
    title: "Outline is passed as one-line-per-chapter into the chapter prompts",
    body: "Same token-budget reason. The chapter generator sees the outline as a list of one-liners, not the structured JSON, so each per-chapter call stays focused.",
  },
  {
    title: "Dutch in, Dutch out — except imagePrompt",
    body: "All UI text and generation prompts are in Dutch (the kids are the audience). The single English string in the pipeline is the imagePrompt — Imagen 4 performs measurably better on English visual prompts than on Dutch ones.",
  },
  {
    title: "Model name is locked",
    body: "gemini-3.1-pro-preview is the only AI model wired in. Switching it requires re-verifying every prompt and structured-output schema still parses. Not a casual bump.",
  },
  {
    title: "Client-only — no SSR",
    body: "Components are 'use client'. The Zustand store relies on localStorage, which doesn't exist server-side. Persistence: localStorage for the active session, Firestore for the cross-device archive.",
  },
];

interface StackRow {
  layer: string;
  detail: string;
}
const STACK: StackRow[] = [
  {
    layer: "Framework",
    detail: "Next.js 16.1.6 (App Router, React 19, server actions for the 14 API routes).",
  },
  {
    layer: "Language",
    detail: "TypeScript 5 (strict mode).",
  },
  {
    layer: "Styling",
    detail: "Tailwind CSS v4 via @tailwindcss/postcss. Dark theme with CSS variables in globals.css. Fredoka (display) + Nunito (body).",
  },
  {
    layer: "State",
    detail: "Zustand v5 with persist middleware → localStorage (key: world-smid-store).",
  },
  {
    layer: "AI",
    detail: "Google Gemini 3.1 Pro Preview via @google/genai for text + structured output. Imagen 4 for every image surface.",
  },
  {
    layer: "Storage",
    detail: "Firestore for worlds + archive, GCS for generated images.",
  },
  {
    layer: "Runtime",
    detail: "Google Cloud Run europe-west4. Source deploy — no Dockerfile, no cloudbuild.yaml; gcloud run deploy auto-containerises the Next.js app.",
  },
];

export default function BedtimeStoriesPage() {
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
          { label: "Bedtime Stories" },
        ]}
      />
      <article className="rt-tuit rt-techwrite section section--surface">
        <div className="container">
          <header className="rt-techwrite__head">
            <div className="eyebrow eyebrow--warm">
              D · 04 · TECHNICAL WRITE-UP
            </div>
            <h1 className="rt-tuit__title">{TITLE}.</h1>
            <p className="rt-techwrite__tagline">{TAGLINE}</p>
            <p className="rt-tuit__lead">
              Build a fantasy world with characters. Configure a story.
              Get a multi-chapter illustrated bedtime story, complete
              with a parent reading aid, quizzes, hero portraits,
              coloring pages, and a parchment reader that prints as
              separate parent and child booklets. Dutch in, Dutch out.
              For one specific family first; published as a portfolio
              version so the engineering work is legible.
            </p>
            <ul className="rt-techwrite__meta">
              <li>
                <span className="eyebrow">REPO</span>{" "}
                <a href={REPO_URL} target="_blank" rel="noopener noreferrer">
                  github.com/rutgertuit/creature-team-stories →
                </a>
              </li>
              <li>
                <span className="eyebrow">RUNTIME</span> Google Cloud Run
                · europe-west4
              </li>
              <li>
                <span className="eyebrow">LANGUAGE</span> Nederlands (UI
                + generated stories)
              </li>
              <li>
                <span className="eyebrow">STATUS</span> Open portfolio
                version · private family deployment runs on the homelab
              </li>
            </ul>
          </header>

          <section className="rt-techwrite__section">
            <div className="eyebrow">01 · WHAT IT DOES</div>
            <h2>Eight capabilities, one bedtime.</h2>
            <p>
              The app is built around the{" "}
              <strong>Creature Team</strong> universe — a pre-loaded
              cast of around fifty heroes, sidekicks, and villains the
              kids can mix and match. Everything else is configuration
              on top of that.
            </p>
            <ul className="rt-techwrite__stack">
              {CAPABILITIES.map((c) => (
                <li key={c.name}>
                  <strong>{c.name}</strong> — {c.what}
                </li>
              ))}
            </ul>
          </section>

          <section className="rt-techwrite__section">
            <div className="eyebrow">02 · NOTABLE DESIGN CHOICES</div>
            <h2>The invariants worth knowing.</h2>
            <p>
              These are the non-obvious rules the codebase depends on —
              the kind of detail that costs a weekend to learn the hard
              way. Surfaced here so the next maintainer (future me)
              doesn&apos;t.
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
            <div className="eyebrow">03 · STACK</div>
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

          <section className="rt-techwrite__section rt-techwrite__section--closer">
            <div className="eyebrow eyebrow--warm">WHY THIS EXISTS</div>
            <p>
              The honest version: kids ask for the same kinds of stories
              with the same characters again and again, and reading
              every one out loud at 9pm is a real time and energy
              expense. Bedtime Stories absorbs the part of that loop
              that is mechanical — the chapter generation, the
              illustration, the variation tracking — and leaves the
              choosing to the family. The published portfolio version
              is the same engine that runs the private family
              deployment; the private one carries the family&apos;s own
              characters and worlds, which stay on the homelab. Same{" "}
              <Link href="/technical/luminary">
                separate-the-engine-from-the-prompt
              </Link>{" "}
              instinct as the rest of the stack — same engine, two
              completely different worlds running on top.
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
