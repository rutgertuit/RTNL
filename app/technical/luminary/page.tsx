import type { Metadata } from "next";
import Link from "next/link";
import { Nav } from "@/components/nav/Nav";
import { Footer } from "@/components/footer/Footer";
import { AppChrome } from "@/components/chrome/AppChrome";
import { Breadcrumb } from "@/components/breadcrumb/Breadcrumb";

const TITLE = "Luminary";
const TAGLINE = "A voice-first deep-research agent.";
const DESCRIPTION =
  "Luminary is a voice-first deep-research agent. Talk to one of four ElevenLabs voice agents about anything — markets, companies, science, history — and it runs a multi-phase research pipeline behind the scenes (query analysis, study planning, iterative source-grounded research, claim validation, QA anticipation, synthesis), then reads the result back to you, or turns it into a two-host podcast. Built on Google ADK + Gemini, multi-provider routing (OpenAI o4-mini, Grok), and ElevenLabs. Runs on Cloud Run.";

const REPO_URL = "https://github.com/rutgertuit/Luminary";

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
      "@id": "https://rutgertuit.nl/technical/luminary#article",
      headline: TITLE,
      description: DESCRIPTION,
      url: "https://rutgertuit.nl/technical/luminary",
      author: { "@id": "https://rutgertuit.nl/#person" },
      inLanguage: "en",
      proficiencyLevel: "Expert",
      about: { "@id": "https://rutgertuit.nl/technical/luminary#repo" },
    },
    {
      "@type": "SoftwareSourceCode",
      "@id": "https://rutgertuit.nl/technical/luminary#repo",
      name: "Luminary",
      description: DESCRIPTION,
      codeRepository: REPO_URL,
      programmingLanguage: ["Python", "TypeScript", "JavaScript"],
      runtimePlatform: "Google Cloud Run",
      author: { "@id": "https://rutgertuit.nl/#person" },
      applicationCategory: "ResearchAgent",
      operatingSystem: "Cloud (containerised)",
    },
  ],
};

interface DepthRow {
  name: string;
  trigger: string;
  pipeline: string;
  budget: string;
}
const DEPTH_TABLE: DepthRow[] = [
  {
    name: "Quick",
    trigger: '"quick look at X" · "brief on X"',
    pipeline: "Single researcher, no follow-ups.",
    budget: "~3 min",
  },
  {
    name: "Standard",
    trigger: "(default)",
    pipeline:
      "Sub-question fan-out → parallel research → follow-ups → synthesis.",
    budget: "~10 min",
  },
  {
    name: "Deep",
    trigger: '"deep dive on X" · "comprehensive analysis of X"',
    pipeline:
      "Multi-study iterative pipeline: query analysis → study planning → iterative research → claim validation → QA anticipation → strategic analysis → master synthesis.",
    budget: "up to 60 min",
  },
];

interface ModelRow {
  phase: string;
  model: string;
}
const MODEL_TABLE: ModelRow[] = [
  { phase: "Query analysis", model: "Gemini 2.5 Flash" },
  { phase: "Study planning", model: "Gemini 2.5 Flash" },
  {
    phase: "Study research",
    model: "Gemini 2.5 Flash (with google_search grounding)",
  },
  {
    phase: "Complex study research",
    model: "Gemini Deep Research (autonomous agent)",
  },
  {
    phase: "Study synthesis",
    model: "OpenAI o4-mini → Gemini Pro → Flash (fallback chain)",
  },
  { phase: "Master synthesis", model: "OpenAI o4-mini → Gemini Pro → Flash" },
  {
    phase: "Claim validation",
    model: "OpenAI o4-mini (contradiction detection)",
  },
  { phase: "Strategic analysis", model: "Gemini 2.5 Pro" },
  { phase: "Verification", model: "Gemini 2.5 Flash (with web_search tool)" },
];

interface DesignChoice {
  title: string;
  body: string;
}
const DESIGN_CHOICES: DesignChoice[] = [
  {
    title: "Plan/confirm gate before deep runs",
    body: "Deep mode has a 60-minute budget. Luminary builds the study plan first, reads it back over voice for confirmation, and only then executes. `AUTO_PROCEED_*` env vars tune this per depth.",
  },
  {
    title: "Cancellation is async-safe",
    body: "A user-initiated cancel raises a module-level `ResearchCancelled` that every task handler re-raises. No orphaned threads, no zombie LLM calls.",
  },
  {
    title: "Checkpoints to GCS",
    body: "Long deep runs persist intermediate state to Google Cloud Storage. A crashed run resumes instead of restarting.",
  },
  {
    title: "Memory + knowledge graph",
    body: "Past research findings get re-injected into related queries. The knowledge graph tracks entities across studies so cross-study claims can be validated and contradictions surfaced.",
  },
  {
    title: "Per-agent KB cap",
    body: "Each ElevenLabs voice agent has at most MAX_AGENT_KB_DOCS research docs attached at a time (default 3). Oldest is evicted on new attach so the agent's working set stays sharp.",
  },
  {
    title: "Two-host podcast generation",
    body: "Any synthesis can be re-rendered as a 2-host podcast (Maya + Barnaby) via ElevenLabs TTS. This is the same lineage the rutgertuit.nl podcasts ship on.",
  },
];

export default function LuminaryPage() {
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
          { label: "Luminary" },
        ]}
      />
      <article className="rt-tuit rt-techwrite section section--surface">
        <div className="container">
          <header className="rt-techwrite__head">
            <div className="eyebrow eyebrow--warm">
              D · 01 · TECHNICAL WRITE-UP
            </div>
            <h1 className="rt-tuit__title">{TITLE}.</h1>
            <p className="rt-techwrite__tagline">{TAGLINE}</p>
            <p className="rt-tuit__lead">
              Talk to one of four voice agents about anything — markets,
              companies, science, history. Luminary picks a depth, runs a
              real source-grounded research pipeline, and reads the result
              back. Optionally turns it into a two-host podcast.
            </p>
            <ul className="rt-techwrite__meta">
              <li>
                <span className="eyebrow">REPO</span>{" "}
                <a href={REPO_URL} target="_blank" rel="noopener noreferrer">
                  github.com/rutgertuit/Luminary →
                </a>
              </li>
              <li>
                <span className="eyebrow">RUNTIME</span> Google Cloud Run ·
                europe-west4
              </li>
              <li>
                <span className="eyebrow">STATUS</span> Open · personal
                project
              </li>
            </ul>
          </header>

          <section className="rt-techwrite__section">
            <div className="eyebrow">01 · WHAT IT DOES</div>
            <h2>Three depths, picked automatically from voice.</h2>
            <p>
              Trigger it by saying something to one of the voice agents —
              Maya, Barnaby, Consultant, or Rutger. Luminary detects depth
              from the phrasing and routes accordingly. Each run is a
              real, source-grounded investigation — not a single LLM call.
              Cross-study claim validation catches contradictions across
              sources before they reach you. QA anticipation pre-answers
              the follow-up questions you&apos;re likely to ask.
            </p>
            <div className="rt-techwrite__table">
              <table>
                <thead>
                  <tr>
                    <th>Depth</th>
                    <th>Voice trigger</th>
                    <th>Pipeline</th>
                    <th>Budget</th>
                  </tr>
                </thead>
                <tbody>
                  {DEPTH_TABLE.map((d) => (
                    <tr key={d.name}>
                      <td>
                        <strong>{d.name}</strong>
                      </td>
                      <td>
                        <code>{d.trigger}</code>
                      </td>
                      <td>{d.pipeline}</td>
                      <td>{d.budget}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          <section className="rt-techwrite__section">
            <div className="eyebrow">02 · ARCHITECTURE</div>
            <h2>One orchestrator, one deep pipeline, 24 ADK-built agents.</h2>
            <p>
              An ElevenLabs voice agent posts to a webhook
              (HMAC-verified). The research orchestrator detects depth,
              gates plan-confirm if deep, injects memory and the knowledge
              graph, and hands off to the deep pipeline. Studies fan out
              in parallel. A synthesis evaluator loops with a gap analyzer
              until findings stop changing. Claim validation catches
              cross-study contradictions, QA anticipation pre-answers
              the obvious follow-ups, and a master synthesis lands the
              answer. Results are persisted to GCS, attached to the
              agent&apos;s knowledge base for the next voice turn, and
              optionally produced as a two-host podcast.
            </p>
            <pre
              aria-label="Luminary high-level architecture, ASCII"
              className="rt-techwrite__diagram"
            >{`ElevenLabs voice agent  ──▶  webhook /webhook/elevenlabs (HMAC-verified)
                                        │
                                        ▼
                          ┌──────────────────────────┐
                          │  research_orchestrator   │
                          │  ─ depth detection       │
                          │  ─ plan/confirm gate     │
                          │  ─ memory + KG injection │
                          └──────────┬───────────────┘
                                     ▼
              ┌───────────────────────────────────────────────┐
              │                deep_pipeline                  │
              │                                               │
              │   query_analyzer ─▶ study_planner ─▶ iterative│
              │           ▼                                   │
              │   parallel(researcher × N studies)            │
              │           ▼                                   │
              │   synthesis_evaluator ─▶ gap_analyzer (loop)  │
              │           ▼                                   │
              │   claim_validator ─▶ qa_anticipator           │
              │           ▼                                   │
              │   strategic_analyst ─▶ master synthesis       │
              └───────────────────────┬───────────────────────┘
                                      ▼
                       GCS results · memory · knowledge graph
                                      ▼
                       agent KB attach  →  next voice turn
                       podcast_generator (optional, 2-host)
                       Observable dashboard (\`/explore\`)`}</pre>
          </section>

          <section className="rt-techwrite__section">
            <div className="eyebrow">03 · MODEL ROUTING</div>
            <h2>Each phase, the model that fits.</h2>
            <p>
              Multi-provider routing is the point. No single model is the
              right tool for every phase, so each phase gets its own
              default and a fallback chain. Everything is overridable at
              runtime via env vars (<code>GEMINI_MODEL</code>,{" "}
              <code>GEMINI_PRO_MODEL</code>,{" "}
              <code>OPENAI_REASONING_MODEL</code>).
            </p>
            <div className="rt-techwrite__table">
              <table>
                <thead>
                  <tr>
                    <th>Pipeline phase</th>
                    <th>Default model</th>
                  </tr>
                </thead>
                <tbody>
                  {MODEL_TABLE.map((m) => (
                    <tr key={m.phase}>
                      <td>{m.phase}</td>
                      <td>
                        <code>{m.model}</code>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          <section className="rt-techwrite__section">
            <div className="eyebrow">04 · NOTABLE DESIGN CHOICES</div>
            <h2>The non-obvious decisions that shape what it can do.</h2>
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
            <div className="eyebrow">05 · STACK</div>
            <h2>What runs underneath.</h2>
            <ul className="rt-techwrite__stack">
              <li>
                <strong>Google ADK</strong> — the agent framework. 24
                purpose-built agents (query_analyzer, study_planner,
                iterative_researcher, claim_validator, qa_anticipator,
                strategic_analyst, synthesis_evaluator, podcast_generator,
                watch_checker, memory_extractor, …).
              </li>
              <li>
                <strong>Gemini</strong> — 2.5 Flash for analysis + grounded
                study research, 2.5 Pro for strategic analysis, Deep Research
                as an autonomous agent for complex studies.
              </li>
              <li>
                <strong>OpenAI o4-mini</strong> — synthesis + claim
                validation. Better contradiction detection at this price
                point than the Gemini alternatives during evaluation.
              </li>
              <li>
                <strong>Grok</strong> — optional secondary provider for
                specific phases.
              </li>
              <li>
                <strong>ElevenLabs Conversational + TTS</strong> — four
                inbound voice agents and the outbound podcast generator.
              </li>
              <li>
                <strong>Flask + Gunicorn</strong> — Python backend.
                Blueprints for health, webhook, ui_api, explore.
              </li>
              <li>
                <strong>Observable Framework</strong> — the{" "}
                <code>/explore</code> dashboard. Visualises research jobs,
                costs, pipeline traces, knowledge graph. Built into the
                Docker image.
              </li>
              <li>
                <strong>Google Cloud Run + Secret Manager + GCS</strong> —
                serverless runtime, secrets, results persistence.
                Multi-stage Dockerfile (Node 20 builds the dashboard,
                Python 3.11 runs the app).
              </li>
            </ul>
          </section>

          <section className="rt-techwrite__section rt-techwrite__section--closer">
            <div className="eyebrow eyebrow--warm">WHY THIS EXISTS</div>
            <p>
              For me, voice turned out to be a better way into deep research
              than typing. Typing a query into a chatbox is a bottleneck —
              most of the research I actually want to do happens when I&apos;m
              walking, driving, between meetings. Luminary is the version
              that lets me hand off a question in motion and get a
              source-grounded answer back as audio. The fact that it can
              also export to a two-host podcast is the seam where this
              project and the{" "}
              <Link href="/podcasts">rutgertuit.nl podcasts</Link> meet:
              same ElevenLabs lineage, same prompted-then-chosen
              production rule.
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
