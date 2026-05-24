import { Cortex } from "@/components/cortex/Cortex";

const PROJECTS = [
  {
    id: "D · 01",
    name: "Luminary",
    desc:
      "Multi-agent research orchestrator. Locally compiled briefs that get longer the more you trust them.",
    tags: ["NEXT.JS · TS", "GEMMA · LOCAL"],
    status: "open",
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
      "Family narrator with a curated character library. Lives behind the [redacted family] VLAN at [redacted].",
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
            Six projects, one rack, one Pi5 named hermes.
          </h2>
          <p className="rt-tech__lead">
            Built locally, broken locally, documented in the order I figured them out. Not a portfolio —
            a log of what runs on top of which other piece.
          </p>
        </header>

        <div className="rt-tech__topology">
          <div className="rt-tech__topology-frame">
            <span className="rt-tech__topology-frame__dot" aria-hidden />
            <span className="eyebrow">HOMELAB · LIVE · HERMES · 24/7</span>
          </div>
          <div className="rt-tech__topology-readout">
            <div>
              <strong>25</strong> nodes
            </div>
            <div>
              <strong>25</strong> active edges
            </div>
            <div>VLAN · isolated</div>
          </div>
          <Cortex width={900} height={600} rotate={false} />
          <div className="rt-tech__topology-legend">
            <div>
              <span className="dot dot--warm" /> Frontier / hub
            </div>
            <div>
              <span className="dot dot--cool" /> Creative output
            </div>
            <div>
              <span className="dot dot--neutral" /> Tool / agent / device
            </div>
            <div>
              <span className="line" /> Active dot-flow on hover
            </div>
          </div>
        </div>

        <div className="rt-tech__grid">
          {PROJECTS.map((p) => (
            <article
              key={p.id}
              className={`rt-tile ${p.status === "private" ? "rt-tile--private" : ""}`}
              data-corner={p.id.replace("D · ", "NODE-")}
            >
              <div className="rt-tile__head">
                <span className="rt-tile__id">{p.id}</span>
                <span className={`rt-tile__status rt-tile__status--${p.status}`}>
                  {p.status === "private" ? "PRIVATE · NO REPO" : "OPEN · GITHUB"}
                </span>
              </div>
              <h3 className="rt-tile__name">{p.name}</h3>
              <p className="rt-tile__desc">{renderDesc(p.desc, p.status)}</p>
              <div className="rt-tile__tags">
                {p.tags.map((t) => (
                  <span key={t} className="rt-tile__tag">
                    {t}
                  </span>
                ))}
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
