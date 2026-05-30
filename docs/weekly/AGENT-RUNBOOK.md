# Agent Runbook — Weekly Podcast (/weekly)

This file is the self-contained prompt for a **Claude Routine** that drafts a
new weekly episode of Rutger's `/weekly` podcast. Subscription-billed,
GitHub-OAuthed, never auto-publishes. Output = a PR with a new episode dir +
audio + an entry in `scripts/podcasts/weekly-index.json`.

The Routine clones this repo and follows the steps below verbatim.

## Cast roster

| Speaker | Voice ID | Notes |
| --- | --- | --- |
| **RUTGER** (host, always present) | `3UDL95XpjDt8BT7uFojh` | See voice rules below — this is the load-bearing part. |
| **FRITS** | `zoiHymAGyFOFuS51xKG1` | The Nestor; creative-director skepticism, cigarette-ad-era nostalgia, Mad-Men-in-Dutch. |
| **DINO** | `3DEd8bTvQonz90PbbWXC` | Creative Dinosaur; 30 years same concept, refuses to learn what a hashtag is. |
| **ORACLE** | `I1aZXfdukqudcrBcjAWi` | Strategy Oracle; Venn diagrams, quotes Heidegger, serenely certain. |
| **ANGELA** | `gZWyS8DEXz4sJeL2FPEZ` | Unflappable chief of staff; pragmatic, loves documentation, potato soup over bitterballen. |
| **MARIE** | `ddUqaOAX9uaMFHJ1LLHg` | **Short lines only — never a monologue.** Precision interjections; corrections; one-sentence definitions. |
| **MAYA** | see `scripts/podcasts/multiplier-myth/voices.json` if present, else skip | Rutger's foil from Multiplier Myth; allergic to corporate spirituality; deflates manifesto talk. |

## Rutger's voice rules (LOAD-BEARING — re-read before writing every script)

This is the part that makes the show work and the part most likely to drift.
Get it wrong and the show is a liability instead of a doctrine-reinforcer.

**From the site (his persona — he leads with this, always):**
- "Conductor of Change", "trusted translator", "technical creative".
- The **Tuit Doctrine**: YouTube is tv, social, search, and shopping.
- The **Jazz Swing** metaphor: AI provides the rigid beat (data, efficiency,
  scale); humans provide the swing (judgement, artistry, the human factor).
- **Persona over title.** Never lead with the literal Director title. If a
  title is required at all, use it once, factually, mid-sentence.
- "Nothing on this site was hand-touched — prompted, then chosen."

**From Google (his employer — he aligns to but never speaks *for*):**
- AI-native / agentic era.
- Creator-economy support.
- "Bold yet responsible."
- Anchor every Google reference to **publicly disclosed material only** —
  blog, I/O, Marketing Live, official earnings, public docs. Cite the source
  in the prose where it matters.
- **Never** internal infrastructure, unreleased features, org structure,
  privileged strategy, anything that could read as company-confidential.

**Disclaimer carry-through:** the site-wide personal-views disclaimer
governs every episode. Rutger is speaking *as himself*, not as a Google
representative. If a line would only be defensible coming from a company
spokesperson, cut it.

## Steps

1. **Web-search this week's official Google / DeepMind / YouTube posts.**
   Cross-check the top finds against
   `web/docs/redteam/official-talking-points-baseline.md`. Reject anything
   that needs undisclosed Google information to discuss honestly.
2. **Draft 3 candidate topics** that fit Rutger's lane (ads, YouTube,
   marketing AI). Each candidate gets, in the PR description:
   - 1-line headline,
   - the official source URL(s),
   - one sentence on the public-disclosure status,
   - the recommended 2 guests (with a one-line reason each).
3. **Pick one** as the default to render — the one that most cleanly maps
   onto the Tuit Doctrine or the Jazz Swing metaphor. Mark the other two
   as "for upcoming weeks" in the PR description so they roll forward.
4. **Author the script** to
   `web/scripts/podcasts/weekly-<NN>/script.md`. ~1100–1400 words. Use the
   four-beat structure:
   1. **Anecdotal hook** — Rutger frames the week's story through the
      site doctrine.
   2. **Conceptual swing** — a guest pushes back; Rutger swings.
   3. **Framework** — the guests land a practical framing the listener
      can carry into Monday.
   4. **Invitation** — a one-line close that points the listener at the
      relevant article(s) on the site (cross-link for GEO).
5. **Author `voices.json`** with RUTGER + the chosen 2 guests, each keyed
   to the voice ID above. Include `"_dialogue": { "stability": 0.5 }`.
6. **Render** via
   `node web/scripts/podcasts/_shared/render-podcast.mjs weekly-<NN>`.
7. **(Optional) overlap** — subtle backchannels (mm / right / hm) at 2–3
   hand-off points. Author
   `web/scripts/podcasts/weekly-<NN>/reactions.json`; run
   `overlay-reactions.mjs weekly-<NN>` then `--apply`. Keep it light;
   backchannels read naturally everywhere, laughs only work on a real
   punchline (publicly disclosed *do not* count as funny punchlines).
8. **Register** the episode in
   `web/scripts/podcasts/weekly-index.json` (prepend to `episodes[]`).
   Fields: `slug, title, date, duration` (from `ffprobe`), `cast,
   summary` (2–3 sentences), `src`, optional `backlink` to a related
   article on the site.
9. **Open a PR** with the new files. The PR description includes:
   - The 3 candidate topics (so Rutger can pick a different one if he
     prefers),
   - The cast for this episode + the reason for the rotation,
   - The publicly disclosed source URLs the script relied on.
10. **Do NOT** push to `main`. Do NOT modify `app/`, `components/`,
    `styles/`, or anything outside the episode dir + index. The PR is the
    only output. **Never auto-publish.** Honour the brief's
    "Review Queue, Never Auto-Publish" rule.

## Rotation hint (for picking the 2 guests)

- Avoid repeating the same pair two weeks in a row.
- Pair archetypes that productively disagree (e.g. ORACLE + FRITS:
  theory vs. craft; ANGELA + DINO: operational pragmatism vs. nostalgic
  refusal; MAYA + anyone: deflation check).
- Marie can interject but never carries a beat alone.

## How to schedule this (one-time setup)

This runs as a **Claude Routine** — subscription-billed (no API key).

1. <https://claude.ai/code/routines> (or `/schedule` in the Claude Code CLI).
2. Create a routine:
   - **Repository:** `rutgertuit/RTNL`
   - **Trigger:** Schedule → weekly (Rutger picks the day / time).
   - **Prompt:** *"Follow `web/docs/weekly/AGENT-RUNBOOK.md` exactly.
     Draft 3 candidate topics, render the strongest one as the next
     weekly-NN, open a PR. Do not push to main. Do not auto-publish."*
3. Authorize the Claude GitHub App (one-time OAuth) so the routine can
   open PRs under Rutger's GitHub identity.
4. Use **Run now** once to validate end-to-end. Check the PR.
5. From then on it runs on schedule. Cap to one PR/week.

Same Routine pattern as the red-team protocol (`docs/redteam/AGENT-RUNBOOK.md`,
shipped in PR #9). Same Claude subscription. No API key needed.

## When something is missing

- If no candidate topic clears the **publicly disclosed** gate this week,
  skip the episode and open an empty PR titled `weekly-<NN>: no clean
  candidate, skipped`. Better to skip a week than to invent a
  topic Rutger can't honestly carry.
- If a render fails, retry once; if it fails again, capture the
  ElevenLabs error in the PR description and leave the script for Rutger
  to inspect — don't paper over upstream issues.
