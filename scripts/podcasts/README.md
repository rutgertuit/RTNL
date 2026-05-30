# Per-page podcast renderer

Two-host (and panel) episodes for the article pages on rutgertuit.nl.
Same pattern as the existing Multiplier Myth podcast — article first,
LLM-drafted dialog, synthetic ElevenLabs voices, ffmpeg-mastered to
-16 LUFS, played back via the sticky `<PodcastTab>` component.

## Directory layout

```
scripts/podcasts/
  _shared/
    render-podcast.mjs   # the renderer — one script for all episodes
  thirty-minute-kitchen/
    script.md            # the dialog
    voices.json          # { SPEAKER: { voiceId, model, stability, ... } }
  agent-inclusive/
    script.md
    voices.json
  creative-interactivity/
    script.md
    voices.json
  creative-video-models/
    script.md
    voices.json
  creative-character-sheet/
    script.md
    voices.json
```

Audio outputs land at `web/public/audio/podcasts/<slug>/ep01.mp3`.

## Usage

```bash
# Once: drop your key into web/.env.local
echo 'ELEVENLABS_API_KEY=sk-...' >> web/.env.local

# List discovered podcasts
node scripts/podcasts/_shared/render-podcast.mjs --list

# Render one
node scripts/podcasts/_shared/render-podcast.mjs thirty-minute-kitchen

# Render all of them
node scripts/podcasts/_shared/render-podcast.mjs --all

# Force overwrite an already-rendered episode
node scripts/podcasts/_shared/render-podcast.mjs <slug> --force

# Print the first few lines without calling the API (sanity check)
node scripts/podcasts/_shared/render-podcast.mjs <slug> --dry-run

# Re-run the ffmpeg mastering chain on already-rendered episodes (no API
# calls — uses the cached per-line MP3s in .lines/). Useful after tweaking
# the mastering chain in render-podcast.mjs.
node scripts/podcasts/_shared/render-podcast.mjs <slug> --remaster
node scripts/podcasts/_shared/render-podcast.mjs --all --remaster
```

## Voice + dialogue settings

- **Rutger** uses his own **remixed voice clone** `j6so4swoRyQ5hVHEur0M` (the
  remix stabilises his accent across batches — a *designed* voice never sounded
  like him). Guests: FRITS `zoiHymAGyFOFuS51xKG1`, DINO `3DEd8bTvQonz90PbbWXC`,
  ORACLE `I1aZXfdukqudcrBcjAWi`, ANGELA `gZWyS8DEXz4sJeL2FPEZ`,
  MARIE `ddUqaOAX9uaMFHJ1LLHg`, SAAR `xBPWZQ2gzFKIn63cFXfT`.
- **Stability `0.5` (Natural)** is the default — high enough that the remixed
  clone holds its accent, low enough that the v3 audio tags still fire. (Robust
  `1.0` would lock harder but mutes `[laughs]`/`[sighs]`; Creative `0.0` drifts.)
- One shared **seed per episode** (derived from the slug, or pinned via
  `_dialogue.seed`) is the only cross-batch consistency lever the dialogue
  endpoint gives us, so batches are kept few and large (`MAX_DIALOGUE_CHARS`).

## Cast — Saar (the naïve glamour)

A recurring comic foil. **Voice `xBPWZQ2gzFKIn63cFXfT`** — a famous, beautiful
Dutch actress with a subtle, raspy, seductive delivery. The whole joke is
**dramatic irony**: she *sounds* like the smartest, most alluring person in the
room and is completely in the dark.

- **Wrong follow-ups.** She asks the question that proves she missed the point.
- **Misquotes / misattributes.** "So what you're saying is —" then mangles it.
- **Literal / actress-world misreadings of jargon.** She filters everything
  through showbiz: "agents" → *talent agents*; "character sheet" → an actor's
  role breakdown; "Veo" → "Vivo". On-theme, never random.
- **Oblivious & charming.** Unbothered by her own errors; name-drops her career.
- **Effect:** the precise guests (Angela, Oracle, Dino) strain not to lose
  patience; Rutger gently redirects. That tension is the comedy.

**Guardrails:** Saar is *seasoning, not the lead* — a few beats per episode, not
every line. Her errors must get corrected so the episode's actual argument still
lands (she sets up clarity, she doesn't bury it). Keep her lines natural and
TTS-safe; let the voice do the seductive work — don't narrate it. Mispronounce
sparingly (one running gag per episode, e.g. "Vivo").

## Mastering chain

`concatAndMaster()` in `_shared/render-podcast.mjs` runs an ffmpeg
`filter_complex`:

1. **Voice chain** (`VOICE_CHAIN`): `highpass=80` → `acompressor` light (3:1) →
   `acompressor` tight (6:1) → `deesser` → `alimiter` (TP -1.5) →
   `atempo=VOICE_TEMPO`.
2. **Tempo** (`VOICE_TEMPO`, default **0.93**) &mdash; slows delivery ~7% so it
   isn't rushed and the gaps between sentences breathe. `atempo` **preserves
   pitch** (the voice doesn't drop). Tune 0.90 (slower) … 0.96 (subtler).
3. **Room tone** (`ROOM_TONE`, `ROOM_TONE_AMPLITUDE` default **0.006**) &mdash; a
   faint band-limited brown-noise floor mixed under the voice (`amix
   normalize=0`). Pure digital silence between turns / at batch seams is the
   biggest "this is AI" tell; the floor bridges it. Tune amplitude up/down.
4. **`loudnorm`** last &mdash; broadcast target -16 LUFS / TP -1.5 / LRA 11.

Tempo + room-tone tweaks are **free**: edit the constants and re-run
`--remaster --all` (no ElevenLabs calls).

## Humanization recipe (delivery, not content)

Scripts are written with natural-speech "imperfections" so the v3 render sounds
like real people, not an AI roundtable. Apply **tastefully — under-do**:

- **Backchannels / reactions**: make flat openers reactive
  (`[chuckles] Read it? Three times, actually.`, `Right—`, `Mm.`).
- **Hesitations**, sparingly (a few per speaker): `Uh,`, `I mean—`, `well,`,
  `look,`.
- **Em-dash (—)** for self-correction / abrupt thought-shift.
- **Ellipsis (…)** for trailing/deliberate pauses &mdash; lean these toward the
  older/deliberate characters (Frits, Dino) for cadence.
- **ALL-CAPS** on ≤1-2 stressed words per speaker, total.
- **v3 tags**: `[chuckles]` / `[sighs]` / `[laughs]` / `[dryly]` only, natural.
  These fire at stability 0.5. **Never** `[pause]` / `[beat]` (not real tags —
  use `…` / `—`). **Never** HTML entities like `&apos;` (they break TTS).
- **Marie** stays SHORT — precision interjections only; never lengthen her.

## script.md format

```
RUTGER:  Line of dialog.

FRITS:   Multi-sentence lines stay together until the next speaker
         label. Indentation does not matter.

# Comments start with # or // and are ignored.
```

Speaker labels are uppercase + colon. Every speaker label in the
script must have an entry in `voices.json` or the renderer aborts.

## voices.json format

```json
{
  "RUTGER": {
    "voiceId": "...",
    "model": "eleven_v3",
    "stability": 0.55,
    "similarity": 0.85,
    "style": 0
  },
  "FRITS": { "voiceId": "zoiHymAGyFOFuS51xKG1", ... }
}
```

Keys are SPEAKER labels (uppercase). The placeholder
`REPLACE_WITH_HOST_VOICE_ID` is in every podcast's voices.json for
the RUTGER (host) line — swap in the actual voice ID once you've
chosen it.

## Adding a new episode

1. `mkdir scripts/podcasts/<new-slug>`
2. Drop a `voices.json` next to a `script.md`.
3. Run `--dry-run` first to sanity-check the parse.
4. Render. Audio appears at `web/public/audio/podcasts/<slug>/ep01.mp3`.
5. Mount `<PodcastTab src="/audio/podcasts/<slug>/ep01.mp3" .../>`
   on the relevant article page.

## Per-line caching

Each line renders to `web/public/audio/podcasts/<slug>/.lines/<NNN>_<speaker>.mp3`
and is only re-rendered if missing (or with `--force`). Safe to abort
and resume mid-batch — partial work is preserved.
