import type { Metadata } from "next";
import Link from "next/link";
import { Nav } from "@/components/nav/Nav";
import { Footer } from "@/components/footer/Footer";
import { AppChrome } from "@/components/chrome/AppChrome";
import { Breadcrumb } from "@/components/breadcrumb/Breadcrumb";

const TITLE = "AgentC Arena";
const TAGLINE = "An AI debate arena.";
const DESCRIPTION =
  "AgentC Arena is a multi-agent AI debate platform built on Google ADK. Two researcher agents (Pro + Con) ground their side in evidence, two debater agents argue with configurable personalities (expertise, tone, verbosity), a moderator scores each round, and a judge calls the winner. Four battle modes: structured debate, rap battle, roast, and pitch-off. FastAPI + WebSocket backend, Gemini 2.5 Flash / 2.5 Pro / 3 Pro Preview with thinking modes, deployed on Cloud Run.";

const REPO_URL = "https://github.com/rutgertuit/AgentC";

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
      "@id": "https://rutgertuit.nl/technical/agentc#article",
      headline: TITLE,
      description: DESCRIPTION,
      url: "https://rutgertuit.nl/technical/agentc",
      author: { "@id": "https://rutgertuit.nl/#person" },
      inLanguage: "en",
      proficiencyLevel: "Expert",
      about: { "@id": "https://rutgertuit.nl/technical/agentc#repo" },
    },
    {
      "@type": "SoftwareSourceCode",
      "@id": "https://rutgertuit.nl/technical/agentc#repo",
      name: "AgentC",
      description: DESCRIPTION,
      codeRepository: REPO_URL,
      programmingLanguage: ["Python", "JavaScript"],
      runtimePlatform: "Google Cloud Run",
      author: { "@id": "https://rutgertuit.nl/#person" },
      applicationCategory: "MultiAgentDebatePlatform",
      operatingSystem: "Cloud (containerised)",
    },
  ],
};

interface BattleMode {
  name: string;
  format: string;
  note: string;
}
const BATTLE_MODES: BattleMode[] = [
  {
    name: "Debate",
    format: "Traditional structured debate",
    note: "Pro + Con make evidence-grounded arguments, the moderator scores each round.",
  },
  {
    name: "Rap Battle",
    format: "Lyrical battle with rhyme + wordplay",
    note: "Same multi-agent shape, different prompt + scoring rubric.",
  },
  {
    name: "Roast",
    format: "Comedy roast",
    note: "The agents lean into tone; the moderator scores on punchline density rather than rigour.",
  },
  {
    name: "Pitch Off",
    format: "Startup pitch competition",
    note: "Pro pitches the idea, Con pitches against it; the judge picks the term sheet.",
  },
];

interface AgentRow {
  role: string;
  who: string;
  what: string;
}
const AGENT_ROWS: AgentRow[] = [
  {
    role: "Researchers (Pro + Con)",
    who: "Two grounding agents",
    what: "Generate evidence the debaters can use. Accept file uploads (PDF / DOCX / TXT) and custom source-data injection so the debate can be grounded in your own corpus, not just public web.",
  },
  {
    role: "Debaters (Pro + Con)",
    who: "Two arguing agents",
    what: "Take the research and argue the side. Personality knobs apply here — same evidence, different voice.",
  },
  {
    role: "Moderator",
    who: "Per-round scorer + commentator",
    what: "Reads the round, scores it on the active rubric (changes by battle mode), surfaces commentary for the live transcript.",
  },
  {
    role: "Judge",
    who: "End-of-debate adjudicator",
    what: "Produces the final summary and calls the winner. Supports early-winner thresholds so a one-sided round can end the debate without burning more turns.",
  },
];

interface PersonalityKnob {
  name: string;
  range: string;
  endpoints: string;
}
const PERSONALITY_KNOBS: PersonalityKnob[] = [
  {
    name: "Expertise",
    range: "1–10",
    endpoints: "Novice ↔ PhD-level argumentation",
  },
  {
    name: "Tone",
    range: "1–10",
    endpoints: "Polite / clinical ↔ Aggressive / passionate",
  },
  {
    name: "Verbosity",
    range: "1–10",
    endpoints: "Concise ↔ Elaborate",
  },
];

interface DesignChoice {
  title: string;
  body: string;
}
const DESIGN_CHOICES: DesignChoice[] = [
  {
    title: "Workflow is strictly ordered",
    body: "Initializer → Research Phase → Debate Loop → Final Judge. The debater agents will not argue without research in scope; this is enforced at the coordinator, not just hoped for at the prompt.",
  },
  {
    title: "Minimum-content validation at the boundary",
    body: "100 characters minimum for research, 50 for arguments. Whitespace trimmed and validated post-generation so a model that returns an empty string does not silently drop a round.",
  },
  {
    title: "Session state in one place",
    body: "All debate state lives in `DebateSession` objects managed by a `SessionManager` singleton. Round number is fetched via `get_debate_state()` — both debaters check the same source of truth before arguing.",
  },
  {
    title: "WebSocket as the live surface",
    body: "Every event — research drops, argument lands, moderator scores, judge calls — streams over WebSocket so the arena page renders as the debate happens, not after.",
  },
  {
    title: "30-minute Cloud Run timeout",
    body: "Long debates blow past the default 5-minute timeout; the deploy is configured for up to 30. The deeper-than-default budget is the load-bearing change that makes multi-round formats viable.",
  },
  {
    title: "Custom source-data injection",
    body: "Beyond file uploads, the researchers accept structured custom-source payloads so a corporate brief or a private corpus can ground the round without exposing the source to the public web.",
  },
];

export default function AgentCPage() {
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
          { label: "AgentC Arena" },
        ]}
      />
      <article className="rt-tuit rt-techwrite section section--surface">
        <div className="container">
          <header className="rt-techwrite__head">
            <div className="eyebrow eyebrow--warm">
              D · 05 · TECHNICAL WRITE-UP
            </div>
            <h1 className="rt-tuit__title">{TITLE}.</h1>
            <p className="rt-techwrite__tagline">{TAGLINE}</p>
            <p className="rt-tuit__lead">
              Two researcher agents, two debater agents, a moderator, a
              judge. Configurable personalities. Four battle formats from
              formal debate to roast. It&apos;s less about the topic than
              about what it takes to get a multi-agent system to argue
              coherently.
            </p>
            <ul className="rt-techwrite__meta">
              <li>
                <span className="eyebrow">REPO</span>{" "}
                <a href={REPO_URL} target="_blank" rel="noopener noreferrer">
                  github.com/rutgertuit/AgentC →
                </a>
              </li>
              <li>
                <span className="eyebrow">RUNTIME</span> Google Cloud Run
              </li>
              <li>
                <span className="eyebrow">STATUS</span> Open · personal
                project
              </li>
            </ul>
          </header>

          <section className="rt-techwrite__section">
            <div className="eyebrow">01 · BATTLE MODES</div>
            <h2>Four formats, one multi-agent shape.</h2>
            <p>
              Each mode is the same graph of agents with a different
              prompt + scoring rubric. The arena treats &quot;debate&quot;
              and &quot;roast&quot; as variants of the same structural
              problem: two sides, evidence, rounds, a moderator, a judge.
              Change the rubric, change the format — keep the engine.
            </p>
            <div className="rt-techwrite__table">
              <table>
                <thead>
                  <tr>
                    <th>Mode</th>
                    <th>Format</th>
                    <th>Note</th>
                  </tr>
                </thead>
                <tbody>
                  {BATTLE_MODES.map((m) => (
                    <tr key={m.name}>
                      <td>
                        <strong>{m.name}</strong>
                      </td>
                      <td>{m.format}</td>
                      <td>{m.note}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          <section className="rt-techwrite__section">
            <div className="eyebrow">02 · THE AGENTS</div>
            <h2>Six roles, one coordinator.</h2>
            <p>
              A debate coordinator runs the workflow. Sub-agents take the
              roles below; each is an ADK agent with its own instruction
              set and a tightly scoped toolbox so the model doesn&apos;t
              wander.
            </p>
            <div className="rt-techwrite__table">
              <table>
                <thead>
                  <tr>
                    <th>Role</th>
                    <th>Who</th>
                    <th>What it does</th>
                  </tr>
                </thead>
                <tbody>
                  {AGENT_ROWS.map((a) => (
                    <tr key={a.role}>
                      <td>
                        <strong>{a.role}</strong>
                      </td>
                      <td>{a.who}</td>
                      <td>{a.what}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          <section className="rt-techwrite__section">
            <div className="eyebrow">03 · PERSONALITY KNOBS</div>
            <h2>Three sliders. Same evidence, different voice.</h2>
            <p>
              Personality lives at the debater layer, not the researcher
              layer. The Pro and Con debaters take the same researched
              evidence and argue it differently depending on three knobs.
              This is the cleanest reason the rap-battle mode works at
              all: the underlying evidence is sound; tone makes it sound
              like a rap.
            </p>
            <div className="rt-techwrite__table">
              <table>
                <thead>
                  <tr>
                    <th>Knob</th>
                    <th>Range</th>
                    <th>Endpoints</th>
                  </tr>
                </thead>
                <tbody>
                  {PERSONALITY_KNOBS.map((k) => (
                    <tr key={k.name}>
                      <td>
                        <strong>{k.name}</strong>
                      </td>
                      <td>{k.range}</td>
                      <td>{k.endpoints}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
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

          <section className="rt-techwrite__section">
            <div className="eyebrow">05 · STACK</div>
            <h2>What runs underneath.</h2>
            <ul className="rt-techwrite__stack">
              <li>
                <strong>Google ADK</strong> — agent framework. The
                debate coordinator + sub-agents are all ADK constructs;
                tool resolution and per-agent instruction scoping are the
                load-bearing primitives.
              </li>
              <li>
                <strong>Gemini 2.5 Flash, 2.5 Pro, 3 Pro Preview</strong>{" "}
                — Flash for grounding and per-round responses, Pro and 3
                Pro Preview (with thinking modes) for the heavier
                reasoning steps in adjudication.
              </li>
              <li>
                <strong>FastAPI + WebSocket</strong> — Python backend.
                The arena renders live over WebSocket; round transitions,
                research drops, and moderator commentary all stream as
                events.
              </li>
              <li>
                <strong>Vanilla JS frontend</strong> — no framework on
                the page side. Setup form posts the config, the arena
                page subscribes to the WebSocket and renders events as
                they arrive.
              </li>
              <li>
                <strong>Google Cloud Run</strong> — serverless container,
                30-minute timeout, automatic deploys via GitHub push.
              </li>
            </ul>
          </section>

          <section className="rt-techwrite__section rt-techwrite__section--closer">
            <div className="eyebrow eyebrow--warm">WHY THIS EXISTS</div>
            <p>
              Argument is a tool I want models to be better at, not a
              novelty. The arena exists because the multi-agent shape
              (researcher / debater / moderator / judge) generalises:
              once you have it, you can swap the rubric and explore
              completely different formats — strategic briefing,
              boardroom debrief, post-mortem — on the same engine.
              That&apos;s the same instinct as{" "}
              <Link href="/technical/luminary">Luminary</Link>: separate
              the engine from the prompt that drives it, so the engine
              can be re-pointed at the next question without re-writing
              the orchestration.
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
