# Podcast overhaul — design spec

**Date:** 2026-05-30
**Status:** awaiting review
**Owner:** Rutger (final editor); execution by Claude Code

## Goal

Fix Rutger's voice, modernise how he speaks in the podcasts, bring every
script in line with the just-shipped website voice (Dutch-modest; "Conductor
of Change" and the "Tuit Doctrine"/"doctrine" framing retired; `/doctrine` →
`/how-i-think`), raise the value + entertainment of each episode, then
regenerate all of them.

## Inventory (8 episodes)

| Slug | Cast | In renderer tree? | Notes |
|---|---|---|---|
| multiplier-myth | RUTGER + guest | **No (legacy)** | Audio only at `/audio/multiplier-myth-ep02.mp3`; no script/voices in repo. Off/abrupt ending, thin substance. Needs full reconstruction. (Old index said "Maya" — dropped; recast with an existing-voice guest.) |
| thirty-minute-kitchen | RUTGER + FRITS | Yes (+reactions.json) | Strong; ends well. |
| agent-inclusive | RUTGER + ANGELA | Yes | Strong; ending trails off. |
| creative-video-models | RUTGER + DINO | Yes | Strong; ending trails off. |
| creative-interactivity | RUTGER + ORACLE + MARIE | Yes | Strong; **flattest ending** ("Thank you both"). |
| creative-character-sheet | RUTGER + DINO + MARIE | Yes | Strong. |
| about-rutger | FRITS, DINO, ORACLE, ANGELA, MARIE (no host) | Yes | **Comedy built on retired terms** (self-nickname "Conductor of Change"; "Tuit Doctrine"). Needs joke re-anchoring. |
| weekly-01 | RUTGER + ORACLE + FRITS | Yes | "Conductor-of-Change" in header; "doctrine" line; `&apos;` encoding bugs; most lecture-shaped. |

## Locked decisions

1. **Accent fix = new accent-locked voice + renderer tuning.**
2. **Rutger texture = light touch.** Modernise his register to the new voice
   profile; keep the existing straight-man / guests-carry-the-banter dynamic.
3. **Multiplier Myth = reconstruct with an existing-cast guest** (no new voice).
   "Maya" is dropped (it was just how the episode got flagged). Leaning **Oracle**
   (a clean business/strategy foil who defends efficiency and gets reframed); the
   existing painted portrait `multiplier-myth.png` may need a re-render to match
   the recast guest — tracked as a follow-up, not a blocker.

## Root cause: accent drift

Rutger's voiceId (`3UDL95XpjDt8BT7uFojh`) is consistent across episodes. The
renderer (`scripts/podcasts/_shared/render-podcast.mjs`) splits each episode
into ≤1800-char batches; **each batch is a separate Text-to-Dialogue (eleven_v3)
request**. The only cross-batch consistency levers are a shared `seed` and
`stability` (currently 0.5 = "Natural", which permits expressive — and accent —
variation). Longer episodes (weekly = 4 batches) drift most. The current voice
is not strongly accent-locked, so v3 re-performs the accent per batch.

## Workstreams

### 1 · Accent fix (renderer + voice)
- **Design a dedicated Rutger voice** via ElevenLabs Voice Design (reuse the
  machinery in `scripts/design-and-generate-voices.mjs`): warm, measured,
  mid-40s male, **mild consistent Dutch-accented English**, conversational.
  Generate a short sample MP3. **GATE: Rutger approves the sample before it
  replaces the voiceId and before any episode is regenerated.**
  (Rutger is the only new voice; the Multiplier Myth guest reuses an existing
  cast voice — no Maya voice.)
- **Renderer tuning** (in `render-podcast.mjs`):
  - Raise `MAX_DIALOGUE_CHARS` toward the ~2000 cap (fewer independent
    generations → less cross-batch drift). Verify against current docs.
  - Raise default `stability` to a more accent-stable setting, set per episode
    via `_dialogue`. Keep ≤ Robust so audio tags still work where they matter;
    weekly (news, fewer tags) can go highest.
  - Keep the shared per-episode `seed`.
- Validate the fix on **weekly-01** first (worst offender); listen before
  rolling settings to the rest.

### 2 · Rutger podcast-voice spec (light touch)
- Write `web/docs/podcasts/rutger-voice.md` capturing the communicative profile:
  relaxed expert-peer (not lecturing), accessible enthusiasm on tech, warm
  musical pacing with dry asides, sensory analogies (the "holiday kitchen"
  reframe), active demystification of hype ("what does this change for the
  human / where's the durable edge"), rule-of-three framings, pragmatism over
  hype, human-centric. **Note the podcast voice is warmer/looser than the
  on-stage/presenter voice.**
- Apply it to Rutger's lines across all episodes — *light touch*: update his
  register and add the occasional analogy/demystifying move; do **not**
  redistribute all guest wit onto him.
- Update `web/docs/weekly/AGENT-RUNBOOK.md` to point at this voice spec so the
  weekly Routine writes Rutger consistently going forward.

### 3 · Script rewrites (all 8)
Per-episode, in priority order:
- **about-rutger** — re-anchor the two retired-term jokes. The self-nickname
  gag ("Conductor of Change") and self-doctrine gag ("Tuit Doctrine") get
  rebuilt around what's actually on the site now (e.g. the modesty itself, the
  "buries the title, promotes the hobby" read, "YouTube is four surfaces"
  without the "doctrine" label, the `/how-i-think` page).
- **weekly-01** — strip "Conductor-of-Change" from the header, drop the
  "doctrine" line (keep the plain "YouTube is tv, social, search and shopping"
  claim), fix all `&apos;` → real apostrophes, warm up Rutger from briefer to
  relaxed peer.
- **multiplier-myth** — reconstruct as a proper episode in the renderer tree:
  new `scripts/podcasts/multiplier-myth/{script.md,voices.json}` (RUTGER + an
  existing-voice guest, leaning Oracle), a real arc and a satisfying ending (the
  current one stops flat), light-touch Rutger voice. Migrate output to
  `/audio/podcasts/multiplier-myth/ep01.mp3` and update `podcasts-index.json`
  `src` + `cast`. Flag the `multiplier-myth.png` portrait for a follow-up
  re-render to match the recast guest.
- **creative-interactivity, agent-inclusive, creative-video-models** — add a
  thematic closing button (fix the trailing/flat endings) and light-touch
  Rutger lines.
- **thirty-minute-kitchen, creative-character-sheet** — light-touch Rutger pass
  + a consistency scan; otherwise leave the strong material alone.
- Sweep every script for retired terms / old titles ("senior brand and AI
  leader", "Head of Strategic Partnerships", "prominent voice", etc.).

### 4 · Second review pass (your "Fifth")
- After the rewrites, a fresh adversarial read of all 8 scripts: voice
  consistency (Rutger sounds like the spec, accent cues read naturally for
  TTS), website-consistency (zero retired terms), entertainment + a real
  ending on each, factual/disclaimer hygiene (weekly keeps its disclaimer; no
  speaking-for-Google). Fix what it finds.

### 5 · Regenerate all 8 (your "Sixth")
- Only after the voice samples are approved.
- `node scripts/podcasts/_shared/render-podcast.mjs --all --force` (script
  changes require full re-render, not `--remaster`). Multiplier Myth renders
  into the tree for the first time.
- Spot-listen weekly-01 + multiplier-myth + one panel for accent stability and
  voice; re-master (`--remaster --all`) if loudness needs a nudge.
- Update `podcasts-index.json` / `weekly-index.json` if any `src`/`duration`
  changed. Rebuild nothing else (audio is static under `public/`).

## Risks / gates
- **Voice-approval gate is interactive** — Rutger must listen to the designed
  Rutger + Maya samples before regeneration. This is the one step that blocks
  on a human.
- **API cost** — 8 episodes × ~3-4 batches each of Text-to-Dialogue. Bounded;
  full regen authorised, but voice samples come first so we don't pay to
  regenerate with a voice that gets rejected.
- **Determinism** — same seed + same voices + same settings keeps re-renders
  consistent; changing stability/voice intentionally changes output.

## Out of scope
- New episodes beyond the 8. Portrait regeneration (separate task). Wiring/UX of
  the PodcastTab. The agent-game voices.
