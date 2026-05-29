"use client";

import { useState, type KeyboardEvent } from "react";
import { ClipPanel } from "../ClipPanel";

function splitLabel(text: string): { label: string; rest: string } {
  const idx = text.indexOf(":");
  if (idx === -1) return { label: "", rest: text };
  return {
    label: text.slice(0, idx + 1),
    rest: text.slice(idx + 1).trimStart(),
  };
}

interface OutputClip {
  slug: string;
  label: string;
  hasAudio: boolean;
}

interface FollowupTurn {
  /** Single-line follow-up brief, e.g. "Make the player groove." */
  brief: string;
  /** The clip rendered from that follow-up. */
  clip: OutputClip;
}

interface Stop {
  index: number;
  label: string;
  modelLine: string;
  wordCount: number;
  /** Reference-image filename (under /assets/portraits/) when attached. */
  referenceImage?: string;
  /** Initial brief text — paragraphs separated by blank lines. */
  brief: string;
  /** One or more output clips for this stop. Stop 3 has two tiers (Fast + Lite);
   *  Stop 4 has one initial render + optional follow-ups below. */
  clips: OutputClip[];
  /** Stop 4 only: each follow-up has its own short brief and rendered clip. */
  followups?: FollowupTurn[];
  /** Architectural-state annotation. */
  annotationState: string;
  /** What the brief has to carry / what changed annotation. */
  annotationDelta: string;
  /** Optional third annotation (honest note). */
  annotationHonest?: string;
}

const STOPS: Stop[] = [
  {
    index: 1,
    label: "Veo 2 · Dec 2024 · 260 words",
    modelLine: "VEO 2",
    wordCount: 260,
    clips: [
      { slug: "veo2-moog-260w", label: "VEO 2 · DEC 2024 · 260 WORDS", hasAudio: false },
    ],
    brief: `A medium-shot, eye-level cinematic video. A bald man in his early forties — full beard, light stubble at the jawline, dark slate-grey hoodie under a heavier black overshirt — is seated at a vintage analog synthesizer in a converted Rotterdam warehouse studio. The synth is a Moog Voyager, wood side-panels, two-handed posture, his right hand on the keys at mid-keyboard, his left hand adjusting the cutoff knob in the upper-left corner of the panel.

Soft, even key light from camera-left at roughly 3200K. A cooler 4500K rim light from camera-right, separating him from the dark concrete wall behind. Visible dust particles in the shafts of light. Camera: 35mm lens, slight push-in at 5% over the eight-second duration. The subject is fully concentrated; he does not look at the camera. He plays three or four chords across the eight seconds. His hand on the cutoff knob moves once, slowly, mid-clip.

Frame the shot tight enough to read his face but wide enough to include the synth panel from edge to edge. Exposure values warmer in the midtones, deep blacks in the shadows. Style reference: cinematic film, 1080p, 24 fps, slight cinematic film grain. No text on screen.

*No music in the generated audio — the synth itself should not be audible, this clip will be scored separately in post.*`,
    annotationState:
      "Architectural state: Latent diffusion, no native audio path, no multi-turn memory.",
    annotationDelta:
      "What the brief has to carry: The entire world. Coordinates, color temperatures, lens choice, posture, motion timing. The last line of the prompt is a workaround for a capability the model doesn't have.",
  },
  {
    index: 2,
    label: "Veo 3 · May 2025 · 140 words",
    modelLine: "VEO 3",
    wordCount: 140,
    clips: [
      { slug: "veo3-moog-140w", label: "VEO 3 · MAY 2025 · 140 WORDS", hasAudio: true },
    ],
    brief: `Cinematic medium-shot of a bald, bearded man at a vintage Moog synthesizer in a Rotterdam warehouse studio. He's playing a slow, contemplative four-chord progression — left hand sweeping the cutoff knob, right hand on the keys. Warm key light from the left, cooler rim light separating him from the concrete wall behind. Soft dust in the air. 35mm, slow 5% push-in over eight seconds. He is fully absorbed; doesn't look at the camera.

*Audio: the actual synth notes the chord progression is producing — analog, mid-warm, slight resonance sweep on the cutoff. Light room tone in the background, no other music or speech.*

1080p, 24fps, cinematic film stock feel.`,
    annotationState:
      "What changed: Native synchronized audio. The 'no music, score later' workaround dissolves — the model now generates the sound the scene visibly produces.",
    annotationDelta:
      "What the brief lost: Hardware specifications. The brief talks about lighting in adjectives now. The model fills in the rest.",
  },
  {
    index: 3,
    label: "Veo 3.1 · Oct 2025 · 45 words + reference image",
    modelLine: "VEO 3.1",
    wordCount: 45,
    referenceImage: "08-desk.png",
    clips: [
      { slug: "veo31-fast", label: "VEO 3.1 FAST", hasAudio: true },
      { slug: "veo31-lite", label: "VEO 3.1 LITE", hasAudio: true },
    ],
    brief: `A slow, contemplative eight seconds of this character playing the Moog. Warm key light from camera-left, cooler rim light from the right. The cutoff knob sweep is audible. Slight push-in. Cinematic, film-grain finish.`,
    annotationState:
      "What changed: Reference-image conditioning. The character no longer has to be described — they're attached.",
    annotationDelta:
      "What the brief lost: The entire wardrobe paragraph. The full description of the man. The model gets him from the image; the words don't have to carry him anymore.",
    annotationHonest:
      "Honest note: Two tiers shown side-by-side — Fast and Lite render the same brief at different compute budgets. The cost story of Section 5 starts here. Reference conditioning carries body, wardrobe, and presence reliably; face precision drifts because the reference is a back-view portrait.",
  },
  {
    index: 4,
    label: "Omni · May 2026 · 14 words + 3 follow-ups",
    modelLine: "GEMINI OMNI FLASH",
    wordCount: 14,
    referenceImage: "08-desk.png",
    clips: [
      { slug: "omni-moog-turn1", label: "OMNI · TURN 1 · INITIAL", hasAudio: true },
    ],
    brief: `Me at the Moog. Eight seconds. Cinematic, slow chord progression. Warm + cool light mix.`,
    followups: [
      {
        brief: "Make the player groove.",
        clip: { slug: "omni-moog-turn2-groove", label: "OMNI · TURN 2 · GROOVE", hasAudio: true },
      },
      {
        brief: "Change this into a Moog matriarch — using a pic.",
        clip: { slug: "omni-moog-turn3-matriarch", label: "OMNI · TURN 3 · MATRIARCH", hasAudio: true },
      },
      {
        brief: "Change the environment into a Roman sauna.",
        clip: { slug: "omni-moog-turn4-sauna", label: "OMNI · TURN 4 · ROMAN SAUNA", hasAudio: true },
      },
    ],
    annotationState:
      "What changed: Native multi-turn context, single-pass attention across modalities. The brief no longer has to be complete — it can be a sentence followed by a series of notes.",
    annotationDelta:
      "What the brief lost: Itself, almost. Each follow-up costs nothing — the model still has the scene in working memory and edits inside it instead of regenerating.",
    annotationHonest:
      "Honest note: Same imperfect reference as Stop 3, much better face recovery. Each Turn 2/3/4 edit preserves what wasn't asked to change — the Moog, the lighting, the camera angle, the room — and only re-renders what the new line names. That conservation across turns is the architectural delta.",
  },
];

export function BriefingInversion() {
  const [activeIndex, setActiveIndex] = useState<number>(1);
  const activeStop = STOPS.find((s) => s.index === activeIndex) ?? STOPS[0]!;

  const handleStepperKeyDown = (e: KeyboardEvent<HTMLButtonElement>) => {
    const total = STOPS.length;
    let nextIndex: number | null = null;
    if (e.key === "ArrowRight") {
      nextIndex = activeIndex === total ? 1 : activeIndex + 1;
    } else if (e.key === "ArrowLeft") {
      nextIndex = activeIndex === 1 ? total : activeIndex - 1;
    } else if (e.key === "Home") {
      nextIndex = 1;
    } else if (e.key === "End") {
      nextIndex = total;
    }
    if (nextIndex !== null) {
      e.preventDefault();
      setActiveIndex(nextIndex);
      const el = document.getElementById(`bi-tab-${nextIndex}`);
      el?.focus();
    }
  };

  return (
    <section
      className="rt-bi__section rt-bi-brief"
      data-bi-section="brief"
      id="brief"
    >
      <div className="rt-bi__eyebrow">
        MOTION · FOUR VEO GENERATIONS · ONE SCENE
      </div>
      <h2 className="rt-bi__heading">The brief got quieter.</h2>
      <p className="rt-bi__body">
        I&apos;ve been re-prompting the same eight-second scene since late
        2024. Me at the Moog in the studio. A slow four-chord progression,
        warm key light, dust in the air. Nothing fancy. The kind of clip
        I&apos;d cut into a portfolio reel.
      </p>
      <p className="rt-bi__body">
        The output got better, predictably. The brief got shorter, much less
        predictably.{" "}
        <strong>
          Veo 2 needed 260 words and a workaround for the silence. Omni needed
          fourteen words and a follow-up note.
        </strong>{" "}
        Watch the four briefs side-by-side and the architectural story tells
        itself.
      </p>

      <div className="rt-bi-brief__stepper" role="tablist" aria-label="Veo generations">
        {STOPS.map((s) => (
          <button
            key={s.index}
            id={`bi-tab-${s.index}`}
            role="tab"
            aria-selected={s.index === activeIndex}
            aria-controls="bi-brief-tabpanel"
            tabIndex={s.index === activeIndex ? 0 : -1}
            className={`rt-bi-brief__step ${
              s.index === activeIndex ? "is-active" : ""
            }`}
            onClick={() => setActiveIndex(s.index)}
            onKeyDown={handleStepperKeyDown}
          >
            <span className="rt-bi-brief__step-num">{`0${s.index}`}</span>
            <span className="rt-bi-brief__step-model">{s.modelLine}</span>
            <span className="rt-bi-brief__step-words">{s.wordCount}w</span>
          </button>
        ))}
      </div>

      <div
        className="rt-bi-brief__body"
        role="tabpanel"
        id="bi-brief-tabpanel"
        aria-labelledby={`bi-tab-${activeStop.index}`}
      >
        <div className="rt-bi-brief__column rt-bi-brief__column--prompt">
          <div className="rt-bi-brief__col-head">
            <span className="rt-bi-brief__col-label">BRIEF</span>
            <span
              className="rt-bi-brief__wordcount"
              aria-label={`${activeStop.wordCount} words`}
            >
              {activeStop.wordCount}
            </span>
          </div>

          {activeStop.referenceImage && (
            <div className="rt-bi-brief__ref">
              <img
                src={`/assets/portraits/${activeStop.referenceImage}`}
                alt="Reference image attached to the brief"
              />
              <span className="rt-bi-brief__ref-cap">
                [reference image attached: {activeStop.referenceImage}]
              </span>
            </div>
          )}

          <pre className="rt-bi-brief__prose">{activeStop.brief}</pre>

          {activeStop.followups?.map((f, i) => (
            <div className="rt-bi-brief__turn2" key={`${activeStop.index}-fup-${i}`}>
              <span className="rt-bi-brief__turn2-label">
                TURN {i + 2} · FOLLOW-UP
              </span>
              <pre className="rt-bi-brief__prose rt-bi-brief__prose--turn2">
                {f.brief}
              </pre>
            </div>
          ))}
        </div>

        <div className="rt-bi-brief__column rt-bi-brief__column--output">
          <div className="rt-bi-brief__col-head">
            <span className="rt-bi-brief__col-label">OUTPUT</span>
            <span className="rt-bi-brief__col-modelline">
              {activeStop.modelLine}
            </span>
          </div>
          {activeStop.clips.map((c) => (
            <ClipPanel
              key={c.slug}
              slug={c.slug}
              label={c.label}
              hasAudio={c.hasAudio}
            />
          ))}
          {activeStop.followups?.map((f) => (
            <ClipPanel
              key={f.clip.slug}
              slug={f.clip.slug}
              label={f.clip.label}
              hasAudio={f.clip.hasAudio}
            />
          ))}
        </div>
      </div>

      {(() => {
        const a = splitLabel(activeStop.annotationState);
        const b = splitLabel(activeStop.annotationDelta);
        const c = activeStop.annotationHonest
          ? splitLabel(activeStop.annotationHonest)
          : null;
        return (
          <div className="rt-bi-brief__rail">
            <p>
              {a.label && <strong>{a.label}</strong>} {a.rest}
            </p>
            <p>
              {b.label && <strong>{b.label}</strong>} {b.rest}
            </p>
            {c && (
              <p className="rt-bi-brief__rail-honest">
                {c.label && <strong>{c.label}</strong>} {c.rest}
              </p>
            )}
          </div>
        );
      })()}

      <p className="rt-bi__closer">
        Call it the <strong>Briefing Inversion.</strong> The relationship
        between director and renderer is flipping. The Veo 2 brief reads like
        stage directions because the model couldn&apos;t infer anything — the
        prompt had to be the world. The Omni brief reads like a note to a
        competent colleague who has already read the room. Same scene. Same
        imperfect reference. Different cognitive contract.
      </p>

      <h3 className="rt-bi-brief__table-head">The four-column truth</h3>
      <table className="rt-bi-brief__table">
        <thead>
          <tr>
            <th>Generation</th>
            <th>Brief carries</th>
            <th>Model infers</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td><strong>Veo 2</strong></td>
            <td>The whole world. Hardware-level specs. A workaround for silence.</td>
            <td>Almost nothing — it renders what you describe.</td>
          </tr>
          <tr>
            <td><strong>Veo 3</strong></td>
            <td>Scene + mood + audio direction.</td>
            <td>Hardware-level visual details. The bridge between cutoff knob and sound.</td>
          </tr>
          <tr>
            <td><strong>Veo 3.1</strong></td>
            <td>A paragraph of intent. A reference image. Two compute tiers.</td>
            <td>Character identity. Wardrobe. Camera path from an adjective.</td>
          </tr>
          <tr>
            <td><strong>Omni</strong></td>
            <td>A sentence. A series of follow-up notes that each cost nothing.</td>
            <td>Physical continuity across edits. The architecture of the scene.</td>
          </tr>
        </tbody>
      </table>

      <blockquote className="rt-bi-brief__pull">
        <p>
          <strong>The Briefing Inversion.</strong> The brief used to be the
          world. Now the model is the world, and the brief is a note to it.
        </p>
      </blockquote>

      <p className="rt-bi__bridge">
        That contract change is what the rest of this page is about. The four
        sections below are four different ways of looking at why it happened.
      </p>
    </section>
  );
}
