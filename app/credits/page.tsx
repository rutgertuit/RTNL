import type { Metadata } from "next";
import { Nav } from "@/components/nav/Nav";
import { Footer } from "@/components/footer/Footer";
import { AppChrome } from "@/components/chrome/AppChrome";
import { Breadcrumb } from "@/components/breadcrumb/Breadcrumb";

const TITLE = "Credits";
const DESCRIPTION =
  "Everything this site was built from. Frameworks, models, repos, the YouTubers I learn from, and a thank-you to the people using AI as a value multiplier rather than a replacement.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  openGraph: { title: TITLE, description: DESCRIPTION, type: "website" },
  robots: { index: true, follow: true },
};

interface CreditItem {
  name: string;
  href?: string;
  note: string;
}

const FRAMEWORKS: CreditItem[] = [
  { name: "Next.js", href: "https://nextjs.org", note: "App router, server components, the whole site sits on it." },
  { name: "React", href: "https://react.dev", note: "" },
  { name: "TypeScript", href: "https://www.typescriptlang.org", note: "Strict mode. Worth every red squiggle." },
  { name: "Vite", href: "https://vite.dev", note: "Both sibling apps (Snoek & Partners, AI-ftershow) build on Vite." },
  { name: "Tailwind CSS", href: "https://tailwindcss.com", note: "Used inside the iframe games. The main site is plain CSS + tokens." },
  { name: "lucide-react", href: "https://lucide.dev", note: "Icons, including the ones inside Snoek & Partners." },
  { name: "ffmpeg", href: "https://ffmpeg.org", note: "The mastering chain on every podcast episode." },
];

const MODELS: CreditItem[] = [
  { name: "Google Gemini", href: "https://ai.google.dev", note: "Gemini 3.5 Flash powers the Prompt Scribe exhibit and the in-game chaos engine." },
  { name: "Nano Banana / Imagen", href: "https://ai.google.dev/gemini-api/docs/image-generation", note: "Image generation for the article illustrations + portrait sets." },
  { name: "Veo 2, Veo 3, Veo 3.1, Omni", href: "https://deepmind.google/technologies/veo/", note: "Every clip in the video-models article. Subject of its own piece." },
  { name: "NotebookLM", href: "https://notebooklm.google.com", note: "Featured in the Interactivity article; the audio-overview pattern inspired the podcast format." },
  { name: "ElevenLabs", href: "https://elevenlabs.io", note: "Every synthetic voice on this site is from ElevenLabs Voice Design + their TTS API." },
];

const INFRASTRUCTURE: CreditItem[] = [
  { name: "Google Cloud Run", note: "Hosts the Next.js container in europe-west4." },
  { name: "Google Cloud Build", note: "Pushes to main fire RTNLPUSH; one-step deploy." },
  { name: "Google Secret Manager", note: "Holds the Gemini API key, bound cross-project from rutger-dml." },
];

const EXTERNAL_REPOS: CreditItem[] = [
  {
    name: "google-gemini/cookbook",
    href: "https://github.com/google-gemini/cookbook",
    note: "Reference examples for the Veo + Nano Banana render scripts. The polling-and-download pattern in render-clip.py came straight from here.",
  },
  {
    name: "googleapis/python-genai",
    href: "https://github.com/googleapis/python-genai",
    note: "The Python Gemini SDK used in render-clip.py and the Win95 portrait generator.",
  },
  {
    name: "google-gemini/generative-ai-js",
    href: "https://github.com/google-gemini/generative-ai-js",
    note: "JS SDK conventions for the /api/gemini server route powering the Prompt Scribe exhibit.",
  },
  {
    name: "vercel/next.js",
    href: "https://github.com/vercel/next.js",
    note: "The framework. Everything from app-router conventions to next/image lives downstream of this repo.",
  },
  {
    name: "vitejs/vite",
    href: "https://github.com/vitejs/vite",
    note: "Build tool for both sibling apps (Snoek & Partners, AI-ftershow). The base-URL trick that makes the iframe game resolve under /boardroom-game/ is a Vite feature.",
  },
];

const SIBLING_REPOS: CreditItem[] = [
  { name: "github.com/rutgertuit/RTNL", href: "https://github.com/rutgertuit/RTNL", note: "This site." },
  { name: "Snoek & Partners (Boardroom_Game)", note: "Sibling repo. The Dutch ad-agency roguelite, embedded via iframe at /creative/boardroom-game." },
  { name: "AI-ftershow (DML)", href: "https://rutger-dml.web.app", note: "Sibling app. The Prompt Scribe live exhibit was ported from here." },
  { name: "rutgertuit/Luminary", href: "https://github.com/rutgertuit/Luminary", note: "Voice-first deep-research agent. Referenced in the Interactivity article." },
];

const YOUTUBERS: CreditItem[] = [
  {
    name: "Two Minute Papers",
    href: "https://www.youtube.com/@TwoMinutePapers",
    note: "What a time to be alive — Károly's been my AI-research weather report since 2017.",
  },
  {
    name: "David Ondrej",
    href: "https://www.youtube.com/@DavidOndrej",
    note: "Sharp on what the agentic-AI build stack actually looks like week to week.",
  },
  {
    name: "Colin and Samir",
    href: "https://www.youtube.com/@ColinandSamir",
    note: "Best ongoing read of the creator economy and the YouTube platform.",
  },
  {
    name: "Yaro / yaroflasher",
    href: "https://www.youtube.com/@yaroflasher",
    note: "Editing craft + creator-life from someone who actually does the work.",
  },
];

const ld = {
  "@context": "https://schema.org",
  "@type": "WebPage",
  "@id": "https://rutgertuit.nl/credits#page",
  name: TITLE,
  description: DESCRIPTION,
  url: "https://rutgertuit.nl/credits",
  inLanguage: "en",
  about: { "@id": "https://rutgertuit.nl/#person" },
};

function CreditList({ items }: { items: CreditItem[] }) {
  return (
    <ul className="rt-credits__list">
      {items.map((item) => (
        <li key={item.name}>
          <span className="rt-credits__name">
            {item.href ? (
              <a href={item.href} target="_blank" rel="noopener noreferrer">
                {item.name}
              </a>
            ) : (
              item.name
            )}
          </span>
          {item.note && <span className="rt-credits__note"> &mdash; {item.note}</span>}
        </li>
      ))}
    </ul>
  );
}

export default function CreditsPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(ld) }}
      />
      <Nav />
      <Breadcrumb trail={[{ label: "Home", href: "/" }, { label: "Credits" }]} />
      <article className="rt-tuit rt-credits section section--surface">
        <div className="container">
          <div className="rt-tuit__head">
            <div className="eyebrow eyebrow--warm">CREDITS</div>
            <h1 className="rt-tuit__title">Credit where credit is due.</h1>
            <p className="rt-credits__lead">
              This site is one person + a stack of tools + a small library
              of people I learn from. Naming them here so the receipts are
              public.
            </p>
          </div>

          <section className="rt-credits__section">
            <div className="eyebrow">01 &middot; FRAMEWORKS &amp; TOOLS</div>
            <h2>What it&apos;s built on.</h2>
            <CreditList items={FRAMEWORKS} />
          </section>

          <section className="rt-credits__section">
            <div className="eyebrow">02 &middot; MODELS &amp; APIS</div>
            <h2>What it talks to.</h2>
            <CreditList items={MODELS} />
          </section>

          <section className="rt-credits__section">
            <div className="eyebrow">03 &middot; INFRASTRUCTURE</div>
            <h2>Where it lives.</h2>
            <CreditList items={INFRASTRUCTURE} />
          </section>

          <section className="rt-credits__section">
            <div className="eyebrow">04 &middot; OPEN-SOURCE REPOS USED</div>
            <h2>Code I pulled from.</h2>
            <p className="rt-credits__note rt-credits__note--block">
              The external GitHub repos this site was built on top of. The
              examples in <em>google-gemini/cookbook</em> in particular saved
              hours on the render scripts.
            </p>
            <CreditList items={EXTERNAL_REPOS} />
          </section>

          <section className="rt-credits__section">
            <div className="eyebrow">05 &middot; SIBLING REPOS</div>
            <h2>Mine.</h2>
            <CreditList items={SIBLING_REPOS} />
          </section>

          <section className="rt-credits__section">
            <div className="eyebrow">06 &middot; PEOPLE I LEARN FROM</div>
            <h2>Permanent open tabs.</h2>
            <p className="rt-credits__note rt-credits__note--block">
              Four channels I keep coming back to. None of them sponsored
              anything here; they just kept showing up in my feed and in
              my thinking.
            </p>
            <CreditList items={YOUTUBERS} />
          </section>

          <section className="rt-credits__section rt-credits__section--closer">
            <div className="eyebrow eyebrow--warm">CLOSING THANKS</div>
            <p>
              And finally &mdash; to <em>everyone</em> using AI as a value
              multiplier and not as a cost saver or a replacement. You
              are the reason any of this is worth building. The tools
              only matter in the hands of people who use them to do
              more, not to do the same thing with fewer people.
            </p>
            <p className="rt-credits__signoff">
              &mdash; Rutger
            </p>
          </section>
        </div>
      </article>
      <Footer />
      <AppChrome />
    </>
  );
}
