# Podcast Overhaul Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Fix Rutger's accent drift with a new accent-locked voice + renderer tuning, modernise his podcast register (light touch), bring all 8 episode scripts in line with the new website voice, raise their value/entertainment, then regenerate every episode.

**Architecture:** Per-episode dialogue scripts (`scripts/podcasts/<slug>/script.md` + `voices.json`) are rendered by `scripts/podcasts/_shared/render-podcast.mjs` via ElevenLabs Text-to-Dialogue (eleven_v3), ffmpeg-mastered to -16 LUFS, output to `public/audio/podcasts/<slug>/ep01.mp3`. A new ElevenLabs-designed voice replaces Rutger's voiceId across every `voices.json`. Regeneration is gated on Rutger approving the designed voice sample.

**Tech Stack:** Node 20 (built-in fetch/https), ElevenLabs API (text-to-voice/design + text-to-dialogue + text-to-speech), ffmpeg 8.

**Spec:** `web/docs/superpowers/specs/2026-05-30-podcast-overhaul-design.md`

**Working dir for all commands:** `C:/Flowcode/RTNL/web`

---

## File structure

| File | Responsibility | Action |
|---|---|---|
| `scripts/podcasts/_shared/design-voice.mjs` | Design + save an ElevenLabs voice from a description, emit a sample MP3 | Create |
| `scripts/podcasts/_shared/render-podcast.mjs` | Renderer — batch-size + stability tuning | Modify |
| `docs/podcasts/rutger-voice.md` | Canonical Rutger *podcast* voice profile | Create |
| `docs/weekly/AGENT-RUNBOOK.md` | Point the weekly Routine at the voice profile | Modify |
| `scripts/podcasts/<slug>/script.md` (×7) | Rewritten dialogue | Modify |
| `scripts/podcasts/multiplier-myth/{script.md,voices.json}` | Reconstructed episode | Create |
| `scripts/podcasts/*/voices.json` | Swap Rutger voiceId (post-approval) | Modify |
| `scripts/podcasts/podcasts-index.json` | Update multiplier-myth `src`/`cast`/`duration` | Modify |

**Cast voice IDs (existing, reuse):** FRITS `zoiHymAGyFOFuS51xKG1`, DINO `3DEd8bTvQonz90PbbWXC`, ORACLE `I1aZXfdukqudcrBcjAWi`, ANGELA `gZWyS8DEXz4sJeL2FPEZ`, MARIE `ddUqaOAX9uaMFHJ1LLHg`. RUTGER (current, to be replaced) `3UDL95XpjDt8BT7uFojh`.

---

## PHASE A — everything up to the voice-approval gate

### Task 1: Voice-design script + design the Rutger voice

**Files:**
- Create: `scripts/podcasts/_shared/design-voice.mjs`
- Reference (read for the proven API shape, do not modify): `scripts/design-and-generate-voices.mjs`

- [ ] **Step 1: Create `design-voice.mjs`** — a small CLI that designs a voice from a description, saves it, and writes a sample MP3.

```js
#!/usr/bin/env node
/**
 * Design an ElevenLabs voice from a text description and emit a sample MP3
 * for human approval. No episode is regenerated here.
 *
 * Usage:
 *   node scripts/podcasts/_shared/design-voice.mjs \
 *     --name "Rutger (podcast)" \
 *     --desc "Warm, measured Dutch man in his mid-40s speaking English with a mild, consistent Dutch accent. Relaxed expert-peer tone, conversational, light musical cadence, never lecturing." \
 *     --out scratch/voices/rutger-sample.mp3
 *
 * Prints the new permanent voice_id. Drop it into voices.json once approved.
 */
import fs from "node:fs/promises";
import path from "node:path";

const WEB_ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), "..", "..", "..");
async function loadKey() {
  if (process.env.ELEVENLABS_API_KEY) return process.env.ELEVENLABS_API_KEY;
  const raw = await fs.readFile(path.join(WEB_ROOT, ".env.local"), "utf8").catch(() => "");
  const m = raw.match(/^ELEVENLABS_API_KEY=(.*)$/m);
  return m ? m[1].replace(/^"|"$/g, "") : null;
}
function arg(flag, def) { const i = process.argv.indexOf(flag); return i > -1 ? process.argv[i + 1] : def; }

const SAMPLE_TEXT =
  "So here's the thing — most of the panic about AI is the wrong panic. " +
  "Walk into a rented holiday kitchen: the cooking hasn't changed, only the drawers. " +
  "The real question is simple. What does this actually change for the person on the other end?";

const apiKey = await loadKey();
if (!apiKey) { console.error("ELEVENLABS_API_KEY missing."); process.exit(3); }
const name = arg("--name"); const desc = arg("--desc"); const out = arg("--out", "scratch/voices/sample.mp3");
const text = arg("--text", SAMPLE_TEXT);
if (!name || !desc) { console.error("Need --name and --desc."); process.exit(2); }

const H = { "xi-api-key": apiKey, "Content-Type": "application/json" };

// 1. design → previews[].generated_voice_id
const design = await fetch("https://api.elevenlabs.io/v1/text-to-voice/design", {
  method: "POST", headers: H, body: JSON.stringify({ voice_description: desc, text }),
}).then(async (r) => { if (!r.ok) throw new Error(`design ${r.status}: ${await r.text()}`); return r.json(); });
const gen = design.previews[0].generated_voice_id;
console.log("generated_voice_id:", gen);

// 2. save → permanent voice_id
const saved = await fetch("https://api.elevenlabs.io/v1/text-to-voice", {
  method: "POST", headers: H,
  body: JSON.stringify({ generated_voice_id: gen, voice_name: name, voice_description: desc }),
}).then(async (r) => { if (!r.ok) throw new Error(`save ${r.status}: ${await r.text()}`); return r.json(); });
console.log("PERMANENT voice_id:", saved.voice_id);

// 3. sample MP3 (eleven_v3 to match the renderer)
const audio = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${saved.voice_id}?output_format=mp3_44100_128`, {
  method: "POST", headers: { ...H, Accept: "audio/mpeg" },
  body: JSON.stringify({ text, model_id: "eleven_v3", voice_settings: { stability: 0.5, similarity_boost: 0.75 } }),
}).then(async (r) => { if (!r.ok) throw new Error(`tts ${r.status}: ${await r.text()}`); return r.arrayBuffer(); });
await fs.mkdir(path.join(WEB_ROOT, path.dirname(out)), { recursive: true });
await fs.writeFile(path.join(WEB_ROOT, out), Buffer.from(audio));
console.log("sample written:", out);
```

- [ ] **Step 2: Confirm the API field names against the reference file.** Open `scripts/design-and-generate-voices.mjs` and verify the design endpoint path (`/v1/text-to-voice/design`), the save endpoint (`/v1/text-to-voice`), and the body keys (`voice_description`, `generated_voice_id`, `voice_name`). If they differ, match the reference (it is known-working).

- [ ] **Step 3: Design the Rutger voice + sample.**

Run:
```bash
node scripts/podcasts/_shared/design-voice.mjs \
  --name "Rutger Tuit (podcast)" \
  --desc "Warm, measured Dutch man in his mid-40s speaking fluent English with a mild, consistent Dutch accent — clear /r/ and slightly flattened vowels, but easy to understand. Relaxed expert-peer tone, conversational, light musical cadence with the occasional dry aside. Never lecturing, never broadcast-announcer." \
  --out scratch/voices/rutger-sample.mp3
```
Expected: prints `PERMANENT voice_id: <id>` and writes `scratch/voices/rutger-sample.mp3`. **Record the voice_id** — it is needed in Phase B.

- [ ] **Step 4: Commit the script (not the sample).**
```bash
git add scripts/podcasts/_shared/design-voice.mjs
git commit -m "feat(podcasts): voice-design CLI for an accent-locked Rutger voice"
```
> The `scratch/` sample is the artifact Rutger listens to at the gate. Do not commit audio samples.

---

### Task 2: Renderer tuning for cross-batch consistency

**Files:** Modify `scripts/podcasts/_shared/render-podcast.mjs`

- [ ] **Step 1: Verify the current Text-to-Dialogue character cap.** Use Context7 (`mcp__context7`) or fetch `https://elevenlabs.io/docs/api-reference/text-to-dialogue/convert` to confirm the max total characters across `inputs[].text` per request. Note the number.

- [ ] **Step 2: Raise `MAX_DIALOGUE_CHARS`** to `verified_cap − 100` headroom (if the cap is unchanged at ~2000, set `1900`; if it is higher, set accordingly). Fewer batches = fewer independent generations = less accent drift.

Modify line 146:
```js
const MAX_DIALOGUE_CHARS = 1900; // ≤ verified Text-to-Dialogue cap, minus headroom
```

- [ ] **Step 3: Leave `DEFAULT_STABILITY = 0.5`** (the new accent-locked voice should hold at Natural). The per-episode override already exists via `voices.json` `_dialogue.stability`. No code change needed; this step is a confirmation only.

- [ ] **Step 4: Dry-run a couple of episodes to confirm batching still parses and batch count drops or holds.**
```bash
node scripts/podcasts/_shared/render-podcast.mjs weekly-01 --dry-run
node scripts/podcasts/_shared/render-podcast.mjs creative-character-sheet --dry-run
```
Expected: prints turn/batch counts, no errors, batch count ≤ previous.

- [ ] **Step 5: Commit.**
```bash
git add scripts/podcasts/_shared/render-podcast.mjs
git commit -m "perf(podcasts): larger dialogue batches to reduce eleven_v3 accent drift"
```

---

### Task 3: Rutger podcast-voice spec

**Files:** Create `docs/podcasts/rutger-voice.md`

- [ ] **Step 1: Write the profile** capturing: relaxed expert-peer (collaborative, not top-down); accessible enthusiasm lifting on tech topics framed as a creative toolkit; warm, musical pacing with dry asides; sensory analogies (the "holiday kitchen" reframe is the canonical example); active demystification of hype ("what does this actually change for the human? where's the durable edge?"); rule-of-three framings ("measurement, personalization, content"); pragmatism over vanity metrics; human-centric anchoring. **State explicitly that the podcast voice is warmer/looser than the on-stage/presenter voice.** Cross-link `[[feedback-dutch-modesty-voice]]` ideas: no grandiose epithets, no retired terms. Add a short "in scripts" cheat-sheet: short conversational turns, occasional analogy, concede gracefully, land a button.

- [ ] **Step 2: Commit.**
```bash
git add docs/podcasts/rutger-voice.md
git commit -m "docs(podcasts): Rutger podcast-voice profile (relaxed expert-peer)"
```

---

### Task 4: Point the weekly runbook at the voice profile

**Files:** Modify `docs/weekly/AGENT-RUNBOOK.md`

- [ ] **Step 1:** In the persona/voice section, add a line: "Rutger's *podcast* voice is specified in `docs/podcasts/rutger-voice.md` — relaxed expert-peer, warmer than on-stage. Write his lines to that profile." Keep the existing modesty/anti-grandiose guidance.

- [ ] **Step 2: Commit.**
```bash
git add docs/weekly/AGENT-RUNBOOK.md
git commit -m "docs(weekly): point the Routine at the Rutger podcast-voice profile"
```

---

### Tasks 5–12: Script rewrites

**Shared rules for every rewrite (acceptance criteria):**
1. Zero retired terms: no "Conductor of Change", "Tuit Doctrine", "doctrine" framing, "senior brand and AI leader", "Head of Strategic Partnerships", "prominent voice", "sought after", "Board Member". The YouTube claim is allowed as plain prose ("YouTube is tv, social, search and shopping") but never labelled a "doctrine".
2. Rutger's lines follow `docs/podcasts/rutger-voice.md` — **light touch**: modernise his register, add the occasional analogy/demystifying move; do NOT strip the guests' wit or flip the straight-man dynamic.
3. Keep the existing inline v3 audio tags ([laughs], [interrupting], em-dash cut-offs) idiom.
4. Real apostrophes/quotes in the text — never HTML entities like `&apos;` (they break TTS).
5. After each rewrite, verify the parse with `--dry-run` (no errors, expected speakers) before commit.

**Per-task verify command pattern:**
```bash
node scripts/podcasts/_shared/render-podcast.mjs <slug> --dry-run
```
Expected: prints turns/batches/speakers, exits 0.

#### Task 5: `about-rutger` (heaviest — re-anchor the jokes)
- [ ] Rewrite `scripts/podcasts/about-rutger/script.md`. The two comedic beats currently built on retired terms must be **re-anchored, not word-swapped**:
  - The "he gave himself a nickname in his own bio" gag (was "Conductor of Change") → rebuild around the *modesty itself* (e.g. the guests note he buries the Google title and leads with "musician and tinkerer"; the joke is how hard he works to seem low-key).
  - The "he named his own doctrine" gag (was "Tuit Doctrine") → rebuild around the `/how-i-think` page and the plain "YouTube is tv, social, search and shopping" line — the joke becomes that he renamed his own grand page to something deliberately humble.
- [ ] Preserve the strong "prompted, then chosen" closing button.
- [ ] `--dry-run`, then commit: `git commit -m "content(podcasts): rewrite about-rutger — re-anchor jokes off retired terms"`

#### Task 6: `weekly-01`
- [ ] Rewrite `scripts/podcasts/weekly-01/script.md`: strip "Conductor-of-Change" from the header comment; drop the "it is the doctrine catching up" line (keep the plain YouTube claim); fix every `&apos;` → `'`; warm Rutger from briefer to relaxed peer (he demystifies the agentic-stack news with an analogy + a rule-of-three, per the voice spec). Keep the disclaimer sign-off.
- [ ] `--dry-run`, then commit: `git commit -m "content(podcasts): clean weekly-01 — de-doctrine, fix encoding, warm Rutger"`

#### Task 7: `multiplier-myth` (reconstruct)
- [ ] Create `scripts/podcasts/multiplier-myth/voices.json` with RUTGER (current id for now — swapped in Phase B) + the chosen guest (default ORACLE `I1aZXfdukqudcrBcjAWi`) + `"_dialogue": { "stability": 0.5 }`. Read `app/business/multiplier-myth/page.tsx` for the article's actual argument first.
- [ ] Create `scripts/podcasts/multiplier-myth/script.md`: a real arc — Oracle defends "AI = do the same work with fewer people"; Rutger reframes to "multiply the part that compounds" using a sensory analogy + rule-of-three; land a satisfying **thematic button** (the original just stopped flat).
- [ ] `--dry-run`, then commit: `git commit -m "content(podcasts): reconstruct Multiplier Myth episode with a real ending"`

#### Task 8: `creative-interactivity` (fix flattest ending)
- [ ] Rewrite the close so it isn't "Thank you both" — land a thematic button on the "live demo gives up the frozen argument" insight. Light Rutger pass.
- [ ] `--dry-run`, commit: `git commit -m "content(podcasts): give creative-interactivity a real ending + voice pass"`

#### Task 9: `agent-inclusive` (fix trailing ending)
- [ ] Add a host close after Angela's last roast so it wraps rather than stops. Light Rutger pass.
- [ ] `--dry-run`, commit: `git commit -m "content(podcasts): button the agent-inclusive ending + voice pass"`

#### Task 10: `creative-video-models` (fix soft ending)
- [ ] Land the closing beat on the strong "next Pieter has a way to eat" thread instead of trailing on banter. Light Rutger pass.
- [ ] `--dry-run`, commit: `git commit -m "content(podcasts): button the video-models ending + voice pass"`

#### Task 11: `thirty-minute-kitchen` (light pass)
- [ ] Light Rutger voice pass + consistency scan only; the arc + ending are strong — do not over-edit.
- [ ] `--dry-run`, commit: `git commit -m "content(podcasts): light Rutger voice pass on thirty-minute-kitchen"`

#### Task 12: `creative-character-sheet` (light pass)
- [ ] Light Rutger voice pass + consistency scan only; strong as-is.
- [ ] `--dry-run`, commit: `git commit -m "content(podcasts): light Rutger voice pass on creative-character-sheet"`

---

### Task 13: Second review pass (your "Fifth")

- [ ] **Step 1:** Dispatch a fresh reviewer (subagent) to read all 8 rewritten scripts and check: (a) zero retired terms; (b) Rutger reads like `docs/podcasts/rutger-voice.md`; (c) every episode has a real ending; (d) no `&apos;`/HTML entities; (e) weekly keeps its disclaimer and no speaking-for-Google; (f) entertainment holds. Return a findings list.
- [ ] **Step 2:** Fix every finding inline.
- [ ] **Step 3:** Re-run `--dry-run --all` equivalent (loop each slug) to confirm parses.
```bash
for s in multiplier-myth thirty-minute-kitchen agent-inclusive creative-video-models creative-interactivity creative-character-sheet about-rutger weekly-01; do node scripts/podcasts/_shared/render-podcast.mjs $s --dry-run; done
```
- [ ] **Step 4:** Commit fixes: `git commit -m "content(podcasts): second review-pass fixes across all episodes"`

---

## ⛔ GATE: Rutger approves the designed voice sample

Play `scratch/voices/rutger-sample.mp3`. Do NOT proceed to Phase B until approved. If rejected, re-run Task 1 Step 3 with an adjusted `--desc` and re-sample.

---

## PHASE B — regeneration (post-approval only)

### Task 14: Swap the Rutger voiceId across all episodes

**Files:** Modify every `scripts/podcasts/*/voices.json` that has a `RUTGER` key.

- [ ] **Step 1:** Replace `3UDL95XpjDt8BT7uFojh` with the approved voice_id in: agent-inclusive, creative-character-sheet, creative-interactivity, creative-video-models, thirty-minute-kitchen, weekly-01, multiplier-myth.
- [ ] **Step 2:** Grep to confirm the old id is gone:
```bash
grep -rl "3UDL95XpjDt8BT7uFojh" scripts/podcasts/ || echo "clean"
```
Expected: `clean`.
- [ ] **Step 3:** Commit: `git commit -m "feat(podcasts): switch Rutger to the approved accent-locked voice"`

### Task 15: Regenerate + master + indexes

- [ ] **Step 1:** Full re-render (script + voice changes require `--force`, not `--remaster`):
```bash
node scripts/podcasts/_shared/render-podcast.mjs --all --force
```
Expected: `Summary: { rendered: 8, ... }`, files under `public/audio/podcasts/<slug>/ep01.mp3`.
- [ ] **Step 2:** Update `scripts/podcasts/podcasts-index.json` multiplier-myth entry: `src` → `/audio/podcasts/multiplier-myth/ep01.mp3`, `cast` → `["RUTGER","ORACLE"]` (or chosen guest), refresh `duration` from the rendered file. Update any episode whose duration changed.
- [ ] **Step 3:** Confirm the multiplier-myth article page points at the new audio path if it hard-codes the old `/audio/multiplier-myth-ep02.mp3` (grep `app/` for it; update the PodcastTab `src`).
```bash
grep -rn "multiplier-myth-ep02" app/ public/ || echo "no stale refs"
```
- [ ] **Step 4:** Commit: `git commit -m "content(podcasts): regenerate all episodes + migrate Multiplier Myth into the renderer"`

### Task 16: Spot-check + deploy

- [ ] **Step 1:** Listen to weekly-01 + multiplier-myth + one panel. Confirm Rutger's accent is stable across the whole episode and matches the approved sample. If loudness is off, `node scripts/podcasts/_shared/render-podcast.mjs --all --remaster`.
- [ ] **Step 2:** Ask Rutger whether to deploy. If yes: `git push origin main` (fires the RTNLPUSH Cloud Build → Cloud Run). Verify a couple of `/audio/podcasts/.../ep01.mp3` return 206 live.

---

## Notes / risks
- **Voice approval is the only human gate** — Phase A is fully automatable; Phase B waits on it.
- **API spend** is bounded (8 episodes × ~3 batches) and only happens post-approval.
- **Portrait mismatch:** `multiplier-myth.png` still depicts the old guest — flagged as a follow-up re-render, not a blocker.
- **`scratch/`** is gitignored/uncommitted — samples live there, never committed.
