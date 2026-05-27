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

## Mastering chain

Each rendered episode runs through this ffmpeg `-af` chain (mirrors the
older Multiplier Myth pipeline):

1. `highpass=f=80` &mdash; kill mic rumble + room hum below 80 Hz
2. `acompressor` light (3:1, -18 dB threshold) &mdash; even voice dynamics
3. `acompressor` tighter (6:1, -12 dB threshold) &mdash; podcast presence
4. `deesser` &mdash; tame harsh sibilance around 6 kHz
5. `alimiter` &mdash; true-peak ceiling -1.5 dB
6. `loudnorm` &mdash; broadcast target -16 LUFS / TP -1.5 / LRA 11

If a tweak is needed, edit `MASTERING_CHAIN` in `_shared/render-podcast.mjs`
and re-run `--remaster --all` &mdash; remasters are free (no API).

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
