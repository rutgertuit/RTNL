import type { Metadata } from "next";
import Link from "next/link";
import { Nav } from "@/components/nav/Nav";
import { Footer } from "@/components/footer/Footer";
import { AppChrome } from "@/components/chrome/AppChrome";
import { Breadcrumb } from "@/components/breadcrumb/Breadcrumb";

const TITLE = "Shop Life";
const TAGLINE = "A voice-first family assistant, designed for the car.";
const DESCRIPTION =
  "Shop Life is a voice-controlled family assistant for productivity during commute time. Three capabilities behind one voice interface: family calendar management with proactive WhatsApp conflict alerts, automated meal planning that adds the resulting shopping list directly to the Picnic cart, and a deep-research + debate system for personal learning. Built on ElevenLabs Conversational AI + Gemini 2.5 + Google Cloud, with WhatsApp as the asynchronous approval surface. Dutch-market focus: Picnic for grocery delivery.";

const REPO_URL = "https://github.com/rutgertuit/smart-family-assistant";

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
      "@id": "https://rutgertuit.nl/technical/shop-life#article",
      headline: TITLE,
      description: DESCRIPTION,
      url: "https://rutgertuit.nl/technical/shop-life",
      author: { "@id": "https://rutgertuit.nl/#person" },
      inLanguage: "en",
      proficiencyLevel: "Expert",
      about: { "@id": "https://rutgertuit.nl/technical/shop-life#repo" },
    },
    {
      "@type": "SoftwareSourceCode",
      "@id": "https://rutgertuit.nl/technical/shop-life#repo",
      name: "Smart Personal Family Assistant",
      description: DESCRIPTION,
      codeRepository: REPO_URL,
      programmingLanguage: ["Python"],
      runtimePlatform: "Google Cloud Run",
      author: { "@id": "https://rutgertuit.nl/#person" },
      applicationCategory: "FamilyProductivityAssistant",
      operatingSystem: "Cloud (containerised)",
    },
  ],
};

interface UseCase {
  name: string;
  what: string;
  where: string;
  flow: string;
}
const USE_CASES: UseCase[] = [
  {
    name: "Family calendar",
    what: "Natural-language event creation, conflict detection, and proactive WhatsApp reminders against a shared family calendar.",
    where: "While driving",
    flow: "Voice → parser → Google Calendar API → conflict check → WhatsApp confirm + reminder.",
  },
  {
    name: "Meal planning + grocery",
    what: "Recipe brainstorming over voice; shopping list generated from the chosen plan; Picnic cart populated automatically; final approval via WhatsApp before checkout.",
    where: "Commute home",
    flow: "Voice → Spoonacular for recipes → list generation → Picnic API cart add → WhatsApp approval gate → checkout.",
  },
  {
    name: "Research + debate",
    what: "Deep research on any topic over voice, with WhatsApp notification when ready. Once it's in the knowledge base, the assistant can hold a real debate with you about it — RAG-backed against the research it just did.",
    where: "Long drives, personal learning time",
    flow: "Voice → research orchestrator → Vertex AI embeddings → KB → debate agent (RAG over the same KB) → voice reply.",
  },
];

interface StackRow {
  layer: string;
  detail: string;
}
const STACK: StackRow[] = [
  {
    layer: "Voice interface",
    detail: "ElevenLabs Conversational AI — inbound + outbound voice. Designed for hands-free use while driving.",
  },
  {
    layer: "Parsing + classification",
    detail: "Google Gemini 2.5 Flash — fast intent + entity extraction from the conversation transcript.",
  },
  {
    layer: "Research + reasoning",
    detail: "Google Gemini 2.5 Pro — the heavier-lift layer for the research subsystem and debate responses.",
  },
  {
    layer: "Embeddings + RAG",
    detail: "Vertex AI text-embedding-004 — vectorises the research output so the debate agent can retrieve relevant chunks per turn.",
  },
  {
    layer: "Backend",
    detail: "Python 3.11 + FastAPI on Google Cloud Run. Docker-built, GitHub-deployed. Secrets in Google Secret Manager.",
  },
  {
    layer: "Data + storage",
    detail: "BigQuery as the data warehouse, Cloud Storage for documents.",
  },
];

interface Integration {
  name: string;
  role: string;
}
const INTEGRATIONS: Integration[] = [
  {
    name: "Google Calendar API",
    role: "Family calendar read/write. The source of truth for what's already booked.",
  },
  {
    name: "WhatsApp Business API (via PyWa)",
    role: "Asynchronous approval surface + proactive reminders. Critical for the car use case — voice for input, WhatsApp for review.",
  },
  {
    name: "Spoonacular API",
    role: "Recipe data for the meal-planning conversations.",
  },
  {
    name: "Picnic API",
    role: "Grocery cart automation. The shopping list lands in the cart, the WhatsApp gate keeps the human in the loop before checkout.",
  },
];

interface DesignChoice {
  title: string;
  body: string;
}
const DESIGN_CHOICES: DesignChoice[] = [
  {
    title: "Voice in, WhatsApp out",
    body: "Voice is the right input mode for the car. It's the wrong review mode — you can't proofread a shopping list out loud. WhatsApp closes the loop asynchronously: the voice agent acts; the WhatsApp thread reviews and approves before any irreversible action (cart checkout, calendar invite).",
  },
  {
    title: "Approval gate before any irreversible action",
    body: "Calendar inserts and Picnic checkouts both pause at a confirm step. The agent does not commit to anything that touches another human's day without a yes on the WhatsApp thread.",
  },
  {
    title: "Car-time productivity, not work-time displacement",
    body: "The system is explicitly designed for commute time — the part of the day where work-grade AI tools can't be used due to security constraints. It reclaims a slot that was already there, instead of fragmenting focused work hours.",
  },
  {
    title: "Same lineage as the rest of the stack",
    body: "ElevenLabs Conversational AI + Gemini + Cloud Run is the same family the rutgertuit.nl site and Luminary both sit on. Cross-project know-how compounds — the auth, the secret management, and the deployment pattern were already paid for.",
  },
  {
    title: "Dutch-market focus",
    body: "Picnic isn't a stand-in for an abstract grocery API — it's the actual delivery service the household uses, so the integration is genuinely useful, not a demo.",
  },
];

export default function ShopLifePage() {
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
          { label: "Shop Life" },
        ]}
      />
      <article className="rt-tuit rt-techwrite section section--surface">
        <div className="container">
          <header className="rt-techwrite__head">
            <div className="eyebrow eyebrow--warm">
              D · 02 · TECHNICAL WRITE-UP
            </div>
            <h1 className="rt-tuit__title">{TITLE}.</h1>
            <p className="rt-techwrite__tagline">{TAGLINE}</p>
            <p className="rt-tuit__lead">
              The commute is unproductive on purpose — work-grade tools
              can&apos;t be used in the car. Shop Life claims that slot
              for family coordination and personal learning instead. Talk
              to it. It handles calendar, meals, and research. WhatsApp
              keeps you in the loop on anything irreversible.
            </p>
            <ul className="rt-techwrite__meta">
              <li>
                <span className="eyebrow">REPO</span>{" "}
                <a href={REPO_URL} target="_blank" rel="noopener noreferrer">
                  github.com/rutgertuit/smart-family-assistant →
                </a>
              </li>
              <li>
                <span className="eyebrow">RUNTIME</span> Google Cloud Run
              </li>
              <li>
                <span className="eyebrow">STATUS</span> Open · personal
                project · Dutch-market
              </li>
            </ul>
          </header>

          <section className="rt-techwrite__section">
            <div className="eyebrow">01 · THREE USE CASES</div>
            <h2>Three jobs, one voice interface.</h2>
            <p>
              Each use case lives behind the same voice agent. Intent
              detection routes the conversation, the relevant subsystem
              handles it, and WhatsApp surfaces the receipt.
            </p>
            <div className="rt-techwrite__table">
              <table>
                <thead>
                  <tr>
                    <th>Capability</th>
                    <th>What it does</th>
                    <th>Where</th>
                    <th>Flow</th>
                  </tr>
                </thead>
                <tbody>
                  {USE_CASES.map((u) => (
                    <tr key={u.name}>
                      <td>
                        <strong>{u.name}</strong>
                      </td>
                      <td>{u.what}</td>
                      <td>{u.where}</td>
                      <td>
                        <code>{u.flow}</code>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          <section className="rt-techwrite__section">
            <div className="eyebrow">02 · STACK</div>
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
            <div className="eyebrow">03 · INTEGRATIONS</div>
            <h2>The four load-bearing APIs.</h2>
            <p>
              Each external API is doing real work, not abstract demo
              work — the calendar is the family calendar, the WhatsApp
              thread is the actual family chat, the Picnic cart is the
              one that actually checks out at the door.
            </p>
            <ul className="rt-techwrite__stack">
              {INTEGRATIONS.map((i) => (
                <li key={i.name}>
                  <strong>{i.name}</strong> — {i.role}
                </li>
              ))}
            </ul>
          </section>

          <section className="rt-techwrite__section">
            <div className="eyebrow">04 · NOTABLE DESIGN CHOICES</div>
            <h2>The non-obvious decisions.</h2>
            <dl className="rt-techwrite__choices">
              {DESIGN_CHOICES.map((c) => (
                <div key={c.title}>
                  <dt>{c.title}</dt>
                  <dd>{c.body}</dd>
                </div>
              ))}
            </dl>
          </section>

          <section className="rt-techwrite__section rt-techwrite__section--closer">
            <div className="eyebrow eyebrow--warm">WHY THIS EXISTS</div>
            <p>
              The honest version: most family coordination is invisible
              labour that ends up on whoever has the bandwidth to track
              it. AI is genuinely useful when it absorbs the
              tracking — not when it tries to replace the actual decision
              about which meal to cook or which afternoon to free up.
              That&apos;s the line Shop Life tries to hold. Same{" "}
              <Link href="/technical/luminary">multi-agent
              separate-the-engine-from-the-prompt</Link> instinct as
              Luminary, applied to the part of the day work tools
              can&apos;t reach.
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
