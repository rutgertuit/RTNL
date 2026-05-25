// Deterministic conversational-edit mock for Section 4.
// Keyword trigger map + fallback. Pure function. Unit-testable.
// The voice rule: every response describes an EDIT, not a regeneration.

export interface SlotState {
  referenceImage: boolean; // 08-desk.png attached by default
  audioWaveform: boolean; // optional toggle
  cameraTemplate: boolean; // optional toggle
}

export interface OverlayBadge {
  id: string;
  text: string;
}

export interface TranscriptMessage {
  role: "user" | "omni";
  text: string;
}

export interface SimState {
  slots: SlotState;
  transcript: TranscriptMessage[];
  overlays: OverlayBadge[];
  turn: number;
}

export const INITIAL_STATE: SimState = {
  slots: {
    referenceImage: true,
    audioWaveform: false,
    cameraTemplate: false,
  },
  transcript: [
    {
      role: "user",
      text: "[reference image attached: 08-desk.png]\nMe at the Moog. Eight seconds. Cinematic, slow chord progression. Warm + cool light mix.",
    },
    {
      role: "omni",
      text: "Generated. The character matches the reference's body and wardrobe — face is reconstructed from the partial signal. Eight-second clip at 1080p with synced synth audio. Slow push-in across the duration.",
    },
  ],
  overlays: [{ id: "initial", text: "Push-in: slow · Reference: 08-desk.png · Audio: synth synced" }],
  turn: 1,
};

interface Trigger {
  keywords: RegExp;
  /** May depend on slot state (e.g., audio requires waveform slot). */
  applies?: (slots: SlotState) => boolean;
  buildResponse: (input: string) => { reply: string; overlay: string };
}

const TRIGGERS: Trigger[] = [
  {
    keywords: /\b(golden hour|warm light|softer light|brighter|sunset)\b/i,
    buildResponse: (input) => ({
      reply: `Adjusted lighting to ${describeLight(input)}. Preserved the Moog, the dust particles, the camera angle. Added a soft volumetric beam from the upper-left. The synth panel highlights now read warmer.`,
      overlay: `Lighting: ${describeLight(input).split(" ")[0] ?? "warm"}`,
    }),
  },
  {
    keywords: /\b(camera|pan|push[- ]?in|pull[- ]?out|slower|faster|zoom|dolly|tilt)\b/i,
    buildResponse: (input) => ({
      reply: `Modified camera path: ${describeCamera(input)}. Subject and lighting preserved. The push-in arc was re-keyed; key frames at 0.0s, 4.0s, 8.0s.`,
      overlay: `Camera: ${describeCamera(input)}`,
    }),
  },
  {
    keywords: /\b(audio|sync|beat|drop|snare|kick|hat|tempo)\b/i,
    applies: (s) => s.audioWaveform,
    buildResponse: () => ({
      reply: "Bound visual beats to the uploaded audio waveform. Camera shake locked to the bass drops; the cutoff-knob sweep is now timed to the audio's filter-sweep peak. Visual transient detection from the amplitude envelope.",
      overlay: "Audio-locked: beat → camera",
    }),
  },
  {
    keywords: /\b(wall|room|right|left|brick|background|behind|window|expand)\b/i,
    buildResponse: (input) => ({
      reply: `Expanded scene boundary to the ${describeDirection(input)}. ${describeMaterial(input)} now visible at the edge of the frame. Subject position unchanged; lighting auto-rebalanced to account for the new spatial reflection.`,
      overlay: `Scene: opened ${describeDirection(input)}`,
    }),
  },
  {
    keywords: /\b(bee|butterfly|change|replace|swap|substitute)\b/i,
    buildResponse: (input) => ({
      reply: `Localized substitution along the motion path${input.toLowerCase().includes("bee") ? " — bee" : ""}. Surrounding scene preserved. Motion vectors recomputed only inside the substitution bounding box.`,
      overlay: "Substitution: localized",
    }),
  },
];

function describeLight(input: string): string {
  if (/golden/i.test(input)) return "a warm golden-hour key";
  if (/sunset/i.test(input)) return "a low-angle warm sunset wash";
  if (/softer/i.test(input)) return "a softened key with a wider source";
  if (/brighter/i.test(input)) return "a brighter overall exposure";
  return "a warmer key light";
}

function describeCamera(input: string): string {
  const l = input.toLowerCase();
  if (l.includes("slower")) return "push-in slowed";
  if (l.includes("faster")) return "push-in accelerated";
  if (l.includes("pull")) return "pull-out reframe";
  if (l.includes("pan")) return "horizontal pan added";
  if (l.includes("tilt")) return "tilt added";
  if (l.includes("zoom")) return "zoom adjusted";
  return "camera path updated";
}

function describeDirection(input: string): string {
  const l = input.toLowerCase();
  if (l.includes("right")) return "right";
  if (l.includes("left")) return "left";
  return "right";
}

function describeMaterial(input: string): string {
  const l = input.toLowerCase();
  if (l.includes("brick")) return "Brick wall";
  if (l.includes("window")) return "High windows";
  return "Side wall";
}

const FALLBACK: Trigger["buildResponse"] = (input) => ({
  reply: `Updated the scene to reflect: "${input}". Previous state preserved where not contradicted. Re-render in place; no regeneration of the surrounding context.`,
  overlay: "Edit applied · context preserved",
});

export function step(state: SimState, userInput: string): SimState {
  const trimmed = userInput.trim();
  if (!trimmed) return state;

  const trigger = TRIGGERS.find(
    (t) => t.keywords.test(trimmed) && (t.applies ? t.applies(state.slots) : true),
  );
  const { reply, overlay } = trigger
    ? trigger.buildResponse(trimmed)
    : FALLBACK(trimmed);

  return {
    ...state,
    turn: state.turn + 1,
    transcript: [
      ...state.transcript,
      { role: "user", text: trimmed },
      { role: "omni", text: reply },
    ],
    overlays: [...state.overlays, { id: `t${state.turn + 1}`, text: overlay }],
  };
}

export function toggleSlot(
  state: SimState,
  slot: keyof SlotState,
): SimState {
  return {
    ...state,
    slots: { ...state.slots, [slot]: !state.slots[slot] },
  };
}

export function reset(): SimState {
  return INITIAL_STATE;
}
