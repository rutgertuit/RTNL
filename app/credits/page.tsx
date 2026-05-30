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

interface AssetCredit {
  /** What you see on the site. */
  output: string;
  /** Where on the site you see it. */
  where: string;
  /** Which model produced it. */
  model: string;
  /** Locked prompt template / style prelude path in the repo. */
  promptTemplate?: string;
  /** Optional script path that owns the prompt template. */
  script?: string;
  /** Any extra production note (the lesson learned, the gotcha). */
  note?: string;
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
  { name: "Google Gemini", href: "https://ai.google.dev", note: "Gemini 2.5 Flash powers the Prompt Scribe exhibit and the in-game chaos engine." },
  { name: "Nano Banana (gemini-2.5-flash-image)", href: "https://ai.google.dev/gemini-api/docs/image-generation", note: "Image generation for the article 9:16 illustrations, the Win95 character portraits across both games, and the dark-editorial podcast group comps." },
  { name: "Veo 2, Veo 3, Veo 3.1, Omni", href: "https://deepmind.google/technologies/veo/", note: "Every clip in the video-models article. Subject of its own piece." },
  { name: "NotebookLM", href: "https://notebooklm.google.com", note: "Featured in the Interactivity article; the audio-overview pattern inspired the podcast format." },
  { name: "ElevenLabs (eleven_v3 Text-to-Dialogue)", href: "https://elevenlabs.io", note: "Every synthetic voice on this site is from ElevenLabs Voice Design + the Text-to-Dialogue API. Six recurring voices: Rutger, Frits, Dino, Oracle, Angela, Marie." },
  { name: "Whisk", href: "https://labs.google/fx/tools/whisk", note: "Reference-conditioned image generation. Used in the Character Sheet tutorial." },
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
    name: "googleapis/js-genai (@google/genai)",
    href: "https://github.com/googleapis/js-genai",
    note: "JS SDK conventions for the /api/gemini server route powering the Prompt Scribe exhibit. Replaces the now-deprecated google-gemini/generative-ai-js.",
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

const ASSET_CREDITS: AssetCredit[] = [
  {
    output: "Hero portrait cycle (6 photographic)",
    where: "/ (homepage hero), /#media-kit",
    model: "Photographic — not AI-generated. Studio session.",
    note: "The site has three visual registers. This is the only one that's a real camera. Everywhere else is prompted, then chosen.",
  },
  {
    output: "Article illustrations (12 × 9:16 dark)",
    where: "/business/multiplier-myth, /business/thirty-minute-kitchen, /business/agent-inclusive (4 per article, alternating sides per stage)",
    model: "Nano Banana (gemini-2.5-flash-image)",
    promptTemplate: "drop/article-image-prompts.md",
    note: "12 paste-ready 9:16 prompts, one per article stage.",
  },
  {
    output: "Win95 character portraits (15 — 8 boardroom + 7 agent-game)",
    where: "/creative/boardroom-game (iframe), /technical/agent-game",
    model: "Nano Banana (gemini-2.5-flash-image)",
    promptTemplate: "scripts/generate-win95-portraits.py · STYLE_PRELUDE",
    script: "scripts/generate-win95-portraits.py",
    note: "Microsoft Bob / Encarta '95 register. Real-figure caricatures get the satirical-rename + IMAGE_OTHER guard workaround.",
  },
  {
    output: "Podcast painted group portraits (8 × 1:1)",
    where: "/podcasts",
    model: "Nano Banana (gemini-2.5-flash-image), reference-conditioned via 7 character sheets",
    promptTemplate: "scripts/generate-podcast-portraits.py · STYLE_PRELUDE + COMP_FRAMING_TEMPLATE",
    script: "scripts/generate-podcast-portraits.py",
    note: "Dark editorial painted register — third register, distinct from the photographic + Win95 ones. Sheets in drop/podcast-character-sheets/ are passed as multi-image refs at comp time.",
  },
  {
    output: "Video clips (Veo lineage — 8 in section 1 + 5 across other sections)",
    where: "/creative/video-models",
    model: "Veo 2, Veo 3, Veo 3.1 (Fast + Lite), Omni",
    promptTemplate: "drop/Model_Explainer/structured/ (per-section locked prompts)",
    script: "scripts/render-clip.py",
    note: "Locked prompts for each comparison clip — re-runnable end-to-end.",
  },
  {
    output: "Podcast audio (8 episodes — 6 article companions + 1 special + 1 weekly)",
    where: "/podcasts and each article's PodcastTab",
    model: "ElevenLabs eleven_v3 Text-to-Dialogue, 6 voices",
    promptTemplate: "scripts/podcasts/<slug>/script.md + voices.json",
    script: "scripts/render-podcast.mjs",
    note: "Sequential dialogue from the Text-to-Dialogue API. Marie Furie's voice is used only for short interjections (locked: never solo guest, never monologue).",
  },
  {
    output: "Podcast overlap layer (backchannels + laughs over the dialogue base)",
    where: "Kitchen episode (others on the roadmap)",
    model: "ffmpeg adelay + amix",
    script: "scripts/overlay-reactions.mjs",
    note: "Layered on top of the eleven_v3 base. Lesson from the first pass: laughs need a real punchline, backchannels read naturally everywhere — start with backchannels.",
  },
  {
    output: "Site code (Next.js app + React server components + TypeScript)",
    where: "Every page on rutgertuit.nl",
    model: "Claude (Sonnet + Opus 4.6/4.7) via Claude Code",
    note: "Pair-programming session by session. The visible craft is in the small things — accessible breadcrumbs, OG cards per route, the 'height: auto !important' next/image fix, JSON-LD per route. Prompted, then chosen.",
  },
  {
    output: "Prose (articles, FAQ answers, bios, /how-i-think entries)",
    where: "Everywhere there is text",
    model: "Drafted with Claude · edited by Rutger",
    promptTemplate: "docs/brand-voice-guideline.md (the Audience Test + Tuit Post structure)",
    note: "Every paragraph passes the Audience Test (Dutch CMO / Agency CEO) or gets cut. No 'AI Thought Leader' language. Personal-views disclaimer governs every page.",
  },
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
  "@graph": [
    {
      "@type": "WebPage",
      "@id": "https://rutgertuit.nl/credits#page",
      name: TITLE,
      description: DESCRIPTION,
      url: "https://rutgertuit.nl/credits",
      inLanguage: "en",
      about: { "@id": "https://rutgertuit.nl/#person" },
    },
    {
      "@type": "CreativeWork",
      "@id": "https://rutgertuit.nl/credits#site-credits",
      name: "rutgertuit.nl — production credits",
      description:
        "Per-asset-class production credits for rutgertuit.nl, mapping each visible output (illustrations, video, voice, prose, code) to the model that generated it and the prompt template that drives it. Re-runnable from the repo.",
      url: "https://rutgertuit.nl/credits",
      hasPart: ASSET_CREDITS.map((a) => ({
        "@type": "CreativeWork",
        name: a.output,
        creator: a.model,
        isBasedOn: a.promptTemplate
          ? `https://github.com/rutgertuit/RTNL/blob/main/${a.promptTemplate.split(" ")[0]}`
          : undefined,
        productionCompany: a.script
          ? `https://github.com/rutgertuit/RTNL/blob/main/${a.script}`
          : undefined,
        ...(a.note ? { description: a.note } : {}),
      })),
    },
  ],
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
            <div className="eyebrow">03 &middot; BY ASSET CLASS</div>
            <h2>What you see, by what made it.</h2>
            <p className="rt-credits__note rt-credits__note--block">
              The same cut as above, organised by output instead of by
              tool. Per asset class: the model, the locked prompt template
              in the repo, and the script that owns it. Re-runnable —
              point a fresh checkout at the same prompts and the same
              outputs come back out.
            </p>
            <ul className="rt-credits__asset-list">
              {ASSET_CREDITS.map((a) => (
                <li key={a.output} className="rt-credits__asset">
                  <div className="rt-credits__asset-output">{a.output}</div>
                  <dl className="rt-credits__asset-meta">
                    <div>
                      <dt>Where</dt>
                      <dd>{a.where}</dd>
                    </div>
                    <div>
                      <dt>Model</dt>
                      <dd>{a.model}</dd>
                    </div>
                    {a.promptTemplate && (
                      <div>
                        <dt>Prompt template</dt>
                        <dd><code>{a.promptTemplate}</code></dd>
                      </div>
                    )}
                    {a.script && (
                      <div>
                        <dt>Script</dt>
                        <dd><code>{a.script}</code></dd>
                      </div>
                    )}
                  </dl>
                  {a.note && <p className="rt-credits__asset-note">{a.note}</p>}
                </li>
              ))}
            </ul>
          </section>

          <section className="rt-credits__section">
            <div className="eyebrow">04 &middot; INFRASTRUCTURE</div>
            <h2>Where it lives.</h2>
            <CreditList items={INFRASTRUCTURE} />
          </section>

          <section className="rt-credits__section">
            <div className="eyebrow">05 &middot; OPEN-SOURCE REPOS USED</div>
            <h2>Code I pulled from.</h2>
            <p className="rt-credits__note rt-credits__note--block">
              The external GitHub repos this site was built on top of. The
              examples in <em>google-gemini/cookbook</em> in particular saved
              hours on the render scripts.
            </p>
            <CreditList items={EXTERNAL_REPOS} />
          </section>

          <section className="rt-credits__section">
            <div className="eyebrow">06 &middot; SIBLING REPOS</div>
            <h2>Mine.</h2>
            <CreditList items={SIBLING_REPOS} />
          </section>

          <section className="rt-credits__section">
            <div className="eyebrow">07 &middot; PEOPLE I LEARN FROM</div>
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
              And finally &mdash; to <em>everyone</em> using AI to do more
              rather than to do the same thing with fewer people. That&apos;s
              the part that makes this worth building.
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
