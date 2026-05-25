"use client";

import { ClipPanel } from "../ClipPanel";

interface JobBlock {
  title: string;
  caption: string;
  clipSlug: string;
  hasAudio: boolean;
  dimmed?: boolean;
}

const JOBS: JobBlock[] = [
  {
    title: "Change the butterfly to a bee. Don't change anything else.",
    caption:
      "The edit lives in the conversation, not the regenerated scene. Veo would have given you a new flower in a new room.",
    clipSlug: "omni-butterfly-to-bee",
    hasAudio: false,
  },
  {
    title: "Visuals choreographed to a track you upload.",
    caption:
      "The model isn't generating audio to match video. It's parsing your audio's amplitude peaks and treating them as a visual timeline. Veo couldn't read the file at all.",
    clipSlug: "omni-audio-sync-windows",
    hasAudio: true,
  },
  {
    title: "Words on screen that don't garble.",
    caption:
      "Diffusion text usually drifts mid-frame. Single-pass tokenization locks letters to the temporal grid. This was the hardest of the three, technically.",
    clipSlug: "omni-kinetic-typography",
    hasAudio: true,
  },
  {
    title: "Long-form continuity. Still not solved.",
    caption:
      "Omni Flash caps at 10 seconds. That's a deployment decision — the model could go longer, the GPU bill becomes prohibitive. Rigid-body physics edge cases (collisions, collapses) also still misbehave. The architectural shift didn't fix everything; it shifted the frontier.",
    clipSlug: "omni-honest-failure",
    hasAudio: false,
    dimmed: true,
  },
];

export function PipelineCollapse() {
  return (
    <section
      className="rt-bi__section rt-bi-arch"
      data-bi-section="architecture"
      id="architecture"
    >
      <div className="rt-bi__eyebrow">
        ARCHITECTURE · CASCADE VS. SINGLE-PASS
      </div>
      <h2 className="rt-bi__heading">Why one model replaced three.</h2>

      <p className="rt-bi__body">
        Until May 2026 the standard way to make AI video with sound was a
        chain of tools. Veo renders the picture. A separate model dubs in
        audio. A separate editor handles the cuts. A separate watermarking
        pass embeds provenance. Four tools, four context windows, four
        moments where the seams can show.
      </p>
      <p className="rt-bi__body">
        The seams <em>do</em> show. Audio drifts a few frames out of lip-sync
        by the second cut. The character&apos;s hand looks slightly different
        in the close-up because the second tool didn&apos;t see the first
        tool&apos;s full latent state. Six hours of post-production go into
        hiding what is, structurally, the same problem: every tool only sees
        its own slice.
      </p>
      <p className="rt-bi__body">
        Gemini Omni doesn&apos;t fix that problem. <strong>It refuses to have
        it.</strong>
      </p>
      <p className="rt-bi__body">Here&apos;s what changed under the hood.</p>

      <div className="rt-bi-arch__diagram" aria-label="Cascade pipeline versus single-pass architecture diagram">
        <div className="rt-bi-arch__panel rt-bi-arch__panel--cascade">
          <div className="rt-bi-arch__panel-label">PANEL A · CASCADE</div>
          <svg viewBox="0 0 600 360" role="img" aria-labelledby="cascade-title">
            <title id="cascade-title">Cascade pipeline</title>
            <defs>
              <marker
                id="arrow-cascade"
                viewBox="0 0 10 10"
                refX="8"
                refY="5"
                markerWidth="6"
                markerHeight="6"
                orient="auto"
              >
                <path d="M 0 0 L 10 5 L 0 10 z" fill="#6E6A60" />
              </marker>
            </defs>

            {/* Stage boxes — text prompt → Veo render → audio dub → editor → watermark */}
            {[
              { x: 30, y: 60, w: 110, label: "TEXT PROMPT", sub: "the brief" },
              { x: 160, y: 60, w: 110, label: "VEO RENDER", sub: "pixels + text" },
              { x: 290, y: 60, w: 110, label: "AUDIO DUB", sub: "+ rendered video" },
              { x: 420, y: 60, w: 110, label: "EDITOR CUT", sub: "+ clips" },
            ].map((b, i) => (
              <g key={`cascade-stage-${i}`}>
                <rect
                  x={b.x}
                  y={b.y}
                  width={b.w}
                  height={70}
                  fill="#141416"
                  stroke="#6E6A60"
                  strokeWidth={1}
                />
                <text
                  x={b.x + b.w / 2}
                  y={b.y + 28}
                  fill="#F2EEE5"
                  fontFamily="IBM Plex Mono, monospace"
                  fontSize={11}
                  textAnchor="middle"
                  letterSpacing="0.12em"
                >
                  {b.label}
                </text>
                <text
                  x={b.x + b.w / 2}
                  y={b.y + 50}
                  fill="#6E6A60"
                  fontFamily="IBM Plex Mono, monospace"
                  fontSize={10}
                  textAnchor="middle"
                >
                  {b.sub}
                </text>
              </g>
            ))}

            {/* Arrows between stages */}
            {[140, 270, 400].map((x, i) => (
              <line
                key={`cascade-arrow-${i}`}
                x1={x}
                y1={95}
                x2={x + 20}
                y2={95}
                stroke="#6E6A60"
                strokeWidth={1.2}
                markerEnd="url(#arrow-cascade)"
              />
            ))}

            {/* Watermark + final output drop */}
            <rect x="290" y="190" width="110" height="50" fill="#141416" stroke="#6E6A60" strokeWidth={1} />
            <text x="345" y="218" fill="#F2EEE5" fontFamily="IBM Plex Mono, monospace" fontSize={11} textAnchor="middle" letterSpacing="0.12em">WATERMARK</text>
            <text x="345" y="232" fill="#6E6A60" fontFamily="IBM Plex Mono, monospace" fontSize={10} textAnchor="middle">provenance pass</text>
            <line x1="475" y1="130" x2="475" y2="215" stroke="#6E6A60" strokeWidth={1.2} />
            <line x1="475" y1="215" x2="405" y2="215" stroke="#6E6A60" strokeWidth={1.2} markerEnd="url(#arrow-cascade)" />

            <rect x="220" y="290" width="170" height="50" fill="#0B0B0C" stroke="#C8553D" strokeWidth={1.2} />
            <text x="305" y="318" fill="#E8623E" fontFamily="IBM Plex Mono, monospace" fontSize={11} textAnchor="middle" letterSpacing="0.12em">FINAL OUTPUT</text>
            <text x="305" y="332" fill="#B8B2A4" fontFamily="IBM Plex Mono, monospace" fontSize={10} textAnchor="middle">~6 h post-production</text>
            <line x1="305" y1="240" x2="305" y2="285" stroke="#6E6A60" strokeWidth={1.2} markerEnd="url(#arrow-cascade)" />
          </svg>
          <p className="rt-bi-arch__panel-note">
            Accumulates errors. Loses character consistency across cuts. Audio
            drifts. Six hours of post-production go into hiding the seams.
          </p>
        </div>

        <div className="rt-bi-arch__panel rt-bi-arch__panel--unified">
          <div className="rt-bi-arch__panel-label">PANEL B · SINGLE-PASS</div>
          <svg viewBox="0 0 600 360" role="img" aria-labelledby="unified-title">
            <title id="unified-title">Single-pass unified architecture</title>
            <defs>
              <marker
                id="arrow-uni"
                viewBox="0 0 10 10"
                refX="8"
                refY="5"
                markerWidth="6"
                markerHeight="6"
                orient="auto"
              >
                <path d="M 0 0 L 10 5 L 0 10 z" fill="#5B85C4" />
              </marker>
              <radialGradient id="latent-glow" cx="50%" cy="50%" r="60%">
                <stop offset="0%" stopColor="#4A6FA5" stopOpacity={0.45} />
                <stop offset="100%" stopColor="#4A6FA5" stopOpacity={0} />
              </radialGradient>
            </defs>

            {/* Input pills (4 stacked at top) */}
            {[
              { y: 24, label: "TEXT" },
              { y: 56, label: "IMAGE" },
              { y: 88, label: "AUDIO" },
              { y: 120, label: "REFERENCE" },
            ].map((p, i) => (
              <g key={`input-${i}`}>
                <rect x="50" y={p.y} width="140" height="22" rx={11} fill="#141416" stroke="#6E6A60" strokeWidth={1} />
                <text x="120" y={p.y + 15} fill="#F2EEE5" fontFamily="IBM Plex Mono, monospace" fontSize={10} textAnchor="middle" letterSpacing="0.14em">{p.label}</text>
              </g>
            ))}

            {/* Convergence lines into shared space */}
            {[35, 67, 99, 131].map((y, i) => (
              <line key={`conv-${i}`} x1="190" y1={y} x2="280" y2={180} stroke="#5B85C4" strokeWidth={1} opacity={0.7} />
            ))}

            {/* Shared latent space — central node */}
            <circle cx="350" cy="180" r="100" fill="url(#latent-glow)" />
            <circle cx="350" cy="180" r="70" fill="#0B0B0C" stroke="#5B85C4" strokeWidth={1.5} />
            <text x="350" y="172" fill="#F2EEE5" fontFamily="IBM Plex Mono, monospace" fontSize={10} textAnchor="middle" letterSpacing="0.16em">SHARED LATENT</text>
            <text x="350" y="186" fill="#F2EEE5" fontFamily="IBM Plex Mono, monospace" fontSize={10} textAnchor="middle" letterSpacing="0.16em">SPACE</text>
            <text x="350" y="206" fill="#6E6A60" fontFamily="IBM Plex Mono, monospace" fontSize={9} textAnchor="middle">attention across all modalities</text>

            {/* Output pill */}
            <line x1="350" y1="250" x2="350" y2="295" stroke="#5B85C4" strokeWidth={1.5} markerEnd="url(#arrow-uni)" />
            <rect x="170" y="300" width="360" height="40" fill="#0B0B0C" stroke="#5B85C4" strokeWidth={1.2} />
            <text x="350" y="318" fill="#F2EEE5" fontFamily="IBM Plex Mono, monospace" fontSize={11} textAnchor="middle" letterSpacing="0.14em">VIDEO + SYNCED AUDIO + WATERMARK</text>
            <text x="350" y="332" fill="#5B85C4" fontFamily="IBM Plex Mono, monospace" fontSize={10} textAnchor="middle">in one render</text>
          </svg>
          <p className="rt-bi-arch__panel-note">
            Single coherent pass. The model sees every modality at once. Audio
            amplitude peaks are mapped to visual timeline as part of the same
            computation that places the pixels.
          </p>
        </div>
      </div>

      <h3 className="rt-bi-arch__jobs-head">What it enabled — three jobs.</h3>

      <div className="rt-bi-arch__jobs">
        {JOBS.map((j) => (
          <article
            key={j.clipSlug}
            className={`rt-bi-arch__job ${j.dimmed ? "rt-bi-arch__job--fail" : ""}`}
          >
            <ClipPanel
              slug={j.clipSlug}
              label={j.title.toUpperCase()}
              autoLoop={!j.dimmed}
              hasAudio={j.hasAudio}
              dimmed={j.dimmed}
            />
            <h4>{j.title}</h4>
            <p>{j.caption}</p>
            {j.dimmed && (
              <span className="rt-bi-arch__job-warn">HONEST LIMITATION</span>
            )}
          </article>
        ))}
      </div>

      <p className="rt-bi__closer">
        The architectural collapse is real, but it isn&apos;t total. Three
        creative jobs became natively possible. One important class of job
        didn&apos;t get solved. The marketing department&apos;s &quot;Omni
        does everything&quot; is a useful sentence in a keynote and a
        misleading one in a procurement meeting.
      </p>

      <p className="rt-bi__bridge">
        The most visible consequence of single-pass attention is that the
        editing surface is no longer a timeline. It&apos;s a conversation.
        Section 4 lets you have one.
      </p>
    </section>
  );
}
