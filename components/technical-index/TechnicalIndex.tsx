import { Cortex } from "@/components/cortex/Cortex";
import Link from "next/link";

const PROJECTS = [
  {
    id: "D · 01",
    name: "Luminary",
    desc:
      "Voice-first deep-research agent. Multi-phase pipeline (query analysis → study planning → iterative source-grounded research → claim validation → synthesis) that reads the result back aloud. Google ADK + Gemini + ElevenLabs on Cloud Run.",
    tags: ["GOOGLE ADK", "GEMINI", "ELEVENLABS"],
    status: "open",
    href: "https://github.com/rutgertuit/Luminary",
  },
  {
    id: "D · 02",
    name: "Shop Life",
    desc:
      "Smart-family assistant for grocery + meal planning. Runs on a Pi5 with a small Whisper instance.",
    tags: ["WHISPER", "PI5"],
    status: "open",
  },
  {
    id: "D · 03",
    name: "Clout Cannon",
    desc: "Social posting / scheduling tool — built to fail loudly, not silently.",
    tags: ["BUN", "CRON"],
    status: "open",
  },
  {
    id: "D · 04",
    name: "Bedtime Stories",
    desc:
      "A local narrator with a curated character library. Lives on the homelab and is not exposed to the public internet.",
    tags: ["VEO", "LOCAL TTS"],
    status: "private",
  },
  {
    id: "D · 05",
    name: "AgentC Arena",
    desc: "LLM head-to-head evaluation rig. Same prompt, four models, one human jury.",
    tags: ["BENCHMARK"],
    status: "open",
  },
  {
    id: "GAME",
    name: "Agent Inclusive Sim",
    desc: "Interactive Jiskefet-inspired turn-based simulator. Survive 30 turns of exponential AI upgrades and reach a $100B valuation.",
    tags: ["SIMULATION", "TACTICAL"],
    status: "game",
  },
  {
    id: "D · 06",
    name: "Homelab Stack",
    desc:
      "OPNsense + VLAN isolation + RTX 5090 / 5060 / Pi5 hermes. The hardware that runs all of the above.",
    tags: ["OPNSENSE", "VLAN"],
    status: "open",
  },
] as const;

function renderDesc(desc: string, status: string) {
  if (status !== "private") return desc;
  const [a, restA] = desc.split("[redacted family]");
  const [b, restB] = (restA ?? "").split("[redacted]");
  return (
    <>
      {a}
      <span className="rt-redact rt-redact--warm">[redacted family]</span>
      {b}
      <span className="rt-redact">[redacted]</span>
      {restB ?? "."}
    </>
  );
}

export function TechnicalIndex() {
  return (
    <section className="rt-tech section section--sunken" id="technical">
      <div className="container">
        <header className="rt-tech__head">
          <div className="eyebrow eyebrow--warm">03 · TECHNICAL / DEEP END</div>
          <h2 className="rt-tech__title">
            Six projects, one rack, one Pi5 named Hermes.
          </h2>
          <p className="rt-tech__lead">
            Built locally, broken locally, documented in the order I figured them out. Not a
            portfolio &mdash; a log of what runs on top of which other piece.
          </p>
        </header>

        <div className="rt-tech__topology">
          <div className="rt-tech__topology-frame">
            <span className="rt-tech__topology-frame__dot" aria-hidden />
            <span className="eyebrow">HOMELAB · LIVE · HERMES · 24/7</span>
          </div>
          <div className="rt-tech__topology-readout">
            <div>
              <strong>22</strong> nodes
            </div>
            <div>
              <strong>30</strong> active edges
            </div>
            <div>VLAN · isolated</div>
          </div>
          <Cortex variant="tech" width={900} height={600} rotate={false} />
          <div className="rt-tech__topology-legend">
            <div>
              <span className="dot dot--warm" /> Theme node
            </div>
            <div>
              <span className="dot dot--cool" /> Infra node
            </div>
            <div>
              <span className="dot dot--neutral" /> Project
            </div>
            <div>
              <span className="line" /> Active dot-flow on hover
            </div>
          </div>
        </div>

        <div className="rt-tech__grid">
          {PROJECTS.map((p) => {
            const isGame = p.status === "game";
            const content = (
              <>
                <div className="rt-tile__head">
                  <span className="rt-tile__id" style={isGame ? { color: "var(--color-accent-warm)" } : undefined}>
                    {p.id}
                  </span>
                  <span className={`rt-tile__status rt-tile__status--${p.status}`}>
                    {p.status === "game"
                      ? "GAME · LIVE SIMULATION"
                      : p.status === "private"
                      ? "PRIVATE · NO REPO"
                      : "OPEN · GITHUB"}
                  </span>
                </div>
                <h3 className="rt-tile__name" style={isGame ? { color: "var(--color-accent-warm-strong)" } : undefined}>
                  {p.name}
                </h3>
                <p className="rt-tile__desc">
                  {isGame ? p.desc : renderDesc(p.desc, p.status)}
                </p>
                <div className="rt-tile__tags">
                  {p.tags.map((t) => (
                    <span
                      key={t}
                      className="rt-tile__tag"
                      style={isGame ? { borderColor: "var(--color-accent-warm)" } : undefined}
                    >
                      {t}
                    </span>
                  ))}
                </div>
              </>
            );

            if (isGame) {
              return (
                <Link
                  key={p.id}
                  href="/technical/agent-game"
                  className="rt-tile rt-tile--game"
                  data-corner="GAME"
                >
                  {content}
                </Link>
              );
            }

            const externalHref = "href" in p ? (p as { href: string }).href : undefined;
            if (externalHref) {
              return (
                <a
                  key={p.id}
                  href={externalHref}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rt-tile rt-tile--linked"
                  data-corner={p.id.replace("D · ", "NODE-")}
                >
                  {content}
                </a>
              );
            }

            return (
              <article
                key={p.id}
                className={`rt-tile ${p.status === "private" ? "rt-tile--private" : ""}`}
                data-corner={p.id.replace("D · ", "NODE-")}
              >
                {content}
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
