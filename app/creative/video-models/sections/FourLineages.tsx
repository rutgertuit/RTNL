"use client";

import { useState } from "react";

interface EvolutionRow {
  version: string;
  date: string;
  adds: string;
}

interface Lineage {
  id: string;
  eyebrow: string;
  name: string;
  honestTradeoff: string;
  pickFor: string;
  evolution: EvolutionRow[];
  wontDo: string;
  /** Subtle current-default tag (Omni only). */
  isCurrentDefault?: boolean;
}

const LINEAGES: Lineage[] = [
  {
    id: "veo",
    eyebrow: "CINEMATIC VIDEO · DIFFUSION · DEC 2024 → MAR 2026",
    name: "Veo · 4 generations",
    honestTradeoff:
      "Highest cinematic ceiling. Lowest editing flexibility. Every prompt regenerates the whole scene.",
    pickFor:
      "Sizzle reels. Single-shot cinematic clips. Anything where the brief is \"render this thing once, beautifully.\" If you find yourself wanting to change one element of the output, you're using the wrong tool — switch to Omni.",
    evolution: [
      { version: "Veo (1)", date: "May 2024", adds: "1080p text-to-video, sub-minute clips" },
      { version: "Veo 2", date: "Dec 2024", adds: "4K, improved physics rendering" },
      { version: "Veo 3", date: "May 2025", adds: "Native synchronized audio" },
      {
        version: "Veo 3.1 + Fast + Lite",
        date: "Oct 2025 → Mar 2026",
        adds: "Reference images, video extension, cost-tiered variants",
      },
    ],
    wontDo:
      "Multi-turn edits. Camera relocalization without re-rendering. Audio-driven visual sync from an uploaded waveform. Long-form narrative continuity beyond ~60 seconds. (For any of those, see Omni in Card 4.)",
  },
  {
    id: "lyria",
    eyebrow: "MUSIC · TEMPORAL AUDIO LATENT DIFFUSION · NOV 2023 → MAR 2026",
    name: "Lyria · 3 generations + RealTime",
    honestTradeoff:
      "Custom soundtracks that don't sound like stock library. Limited structural compositional control unless you go Pro tier. Vocals are convincing in 30-second windows, less so over three minutes.",
    pickFor:
      "Background tracks for video projects where licensing would be prohibitive. Podcast intros. Adaptive game music (via RealTime). Sketching out a melodic idea before committing to a real production. Not for final-master tracks you're shipping to streaming services — you'll outgrow the model's structural understanding fast.",
    evolution: [
      { version: "Lyria (1)", date: "Nov 2023", adds: "YouTube Dream Track experiment, short vocal templates" },
      { version: "Lyria 2", date: "May 2025", adds: "General availability via Vertex AI, broader developer access" },
      { version: "Lyria 3", date: "Feb 2026", adds: "30s tracks with vocals + lyrics, in Gemini app" },
      { version: "Lyria 3 Pro", date: "Mar 2026", adds: "Up to 3-min tracks, structural awareness (intros/verses/choruses)" },
      { version: "Lyria RealTime", date: "(in development)", adds: "2-second chunks for live, interactive generation" },
    ],
    wontDo:
      "Replace a composer for a feature-film score. Generate truly polyphonic complex arrangements. Sound consistently like a specific named artist (legally won't, technically could). Compose against picture without Omni in the loop — Lyria takes text/image cues, not video.",
  },
  {
    id: "genie",
    eyebrow: "INTERACTIVE WORLDS · AUTOREGRESSIVE FRAME PREDICTION · FEB 2024 → MAY 2026",
    name: "Genie · 3 generations + Project Genie",
    honestTradeoff:
      "Real-time interactive 3D worlds from a single prompt. Significant input latency. 60-second session ceiling. The most ambitious of the four, and currently the roughest in practice.",
    pickFor:
      "Rapid-prototyping a game environment before any engine work. AI agent training environments. Spatial reasoning research. Generating a \"what does this place feel like to walk through\" mood-board for an architectural or product concept. Not for shipping a playable game (yet).",
    evolution: [
      { version: "Genie (1)", date: "Feb 2024", adds: "2D interactive environments from text/image" },
      { version: "Genie 2", date: "Dec 2024", adds: "3D environments, first-person navigation" },
      { version: "Genie 3", date: "Aug 2025", adds: "720p @ 24fps, world memory for cross-session consistency" },
      { version: "Project Genie", date: "Jan 2026", adds: "Public access via Google AI Ultra" },
      { version: "Genie + Maps", date: "May 2026", adds: "Street View grounding — fantastical worlds anchored in real geography" },
    ],
    wontDo:
      "Hold consistency beyond 60 seconds of exploration. Match a game engine's input latency. Produce assets you can export to Unity/Unreal — output is a session, not files. Run without a top-tier subscription (compute cost containment).",
  },
  {
    id: "omni",
    eyebrow: "UNIFIED MULTIMODAL TRANSFORMER · MAY 2026",
    name: "Gemini Omni · Flash now, Pro upcoming",
    honestTradeoff:
      "Single-pass any-to-any generation, conversational editing, audio-visual sync from raw waveforms. Currently capped at 10-second clips. One of the most capable AI video tools as of May 2026, and the most limited in clip length.",
    pickFor:
      "Anything that needs more than one round of editing. Anything where audio drives visuals (or vice versa). Anything where the brief is closer to a conversation than a document. The default tool unless one of the other three lineages is specifically better for the job.",
    evolution: [
      { version: "Omni Flash", date: "May 2026", adds: "10-second clips with synced audio, conversational editing, single-pass architecture" },
      { version: "Omni Pro", date: "Announced, future release", adds: "Specs not yet public" },
    ],
    wontDo:
      "Clips longer than 10 seconds (a deployment decision, not a model ceiling). Rigid-body physics edge cases without artifacts (collapsing structures, complex collisions). Replace Lyria for music-as-music or Genie for interactive worlds. Run cheaply at scale — the unified architecture is compute-heavy.",
    isCurrentDefault: true,
  },
];

export function FourLineages() {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  return (
    <section className="rt-bi__section rt-bi-lineages" data-bi-section="lineages" id="lineages">
      <div className="rt-bi__eyebrow">CATALOG · WHAT EACH MODEL IS ACTUALLY FOR</div>
      <h2 className="rt-bi__heading">Four lineages. One family.</h2>
      <p className="rt-bi__body">
        The shrinking brief in Section 1 is the <em>consequence</em>. The cause is that Google
        quietly built four parallel model families between 2023 and 2026, and then collapsed them
        into one. To understand the collapse, it helps to see what each was actually for — and
        what it&apos;s still actually for, even after Omni absorbed the rendering jobs.
      </p>
      <p className="rt-bi__body">Four cards below. Pick the one you&apos;re closest to using.</p>

      <div className="rt-bi-lineages__grid">
        {LINEAGES.map((l) => {
          const isOpen = expandedId === l.id;
          const bodyId = `lineage-body-${l.id}`;
          return (
            <article
              key={l.id}
              className={`rt-bi-lineage ${isOpen ? "is-open" : ""}`}
            >
              <button
                type="button"
                className="rt-bi-lineage__head"
                onClick={() => setExpandedId(isOpen ? null : l.id)}
                aria-expanded={isOpen}
                aria-controls={bodyId}
              >
                <div className="rt-bi-lineage__eyebrow">
                  {l.eyebrow}
                  {l.isCurrentDefault && (
                    <span className="rt-bi-lineage__default-tag">CURRENT DEFAULT</span>
                  )}
                </div>
                <h3 className="rt-bi-lineage__name">{l.name}</h3>
                <p className="rt-bi-lineage__tradeoff">{l.honestTradeoff}</p>
                <span className="rt-bi-lineage__more" aria-hidden>
                  {isOpen ? "Less ↑" : "More ↓"}
                </span>
              </button>

              {isOpen && (
                <div className="rt-bi-lineage__body" id={bodyId}>
                  <div className="rt-bi-lineage__block">
                    <span className="rt-bi-lineage__block-label">WHAT I&apos;D PICK IT FOR</span>
                    <p>{l.pickFor}</p>
                  </div>

                  <div className="rt-bi-lineage__block">
                    <span className="rt-bi-lineage__block-label">EVOLUTION</span>
                    <table className="rt-bi-lineage__table">
                      <thead>
                        <tr>
                          <th>Version</th>
                          <th>Date</th>
                          <th>Adds</th>
                        </tr>
                      </thead>
                      <tbody>
                        {l.evolution.map((row, i) => (
                          <tr key={`${l.id}-${i}`}>
                            <td>{row.version}</td>
                            <td>{row.date}</td>
                            <td>{row.adds}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  <div className="rt-bi-lineage__block rt-bi-lineage__block--limit">
                    <span className="rt-bi-lineage__block-label">WHAT IT WON&apos;T DO</span>
                    <p>{l.wontDo}</p>
                  </div>
                </div>
              )}
            </article>
          );
        })}
      </div>

      <p className="rt-bi__closer">
        All four still exist as products. Omni didn&apos;t kill them — it consolidated the{" "}
        <em>rendering pipeline</em>, not the <em>roadmap</em>. Veo 3.1 Lite still ships because
        cost-tiered batch rendering is a different job than conversational editing. Lyria RealTime
        still ships because adaptive game music is a different job than one-shot composition. Pick
        the model that matches the job. The marketing department&apos;s &quot;Omni does
        everything&quot; is true at a high level and unhelpful at a workflow level.
      </p>
    </section>
  );
}
