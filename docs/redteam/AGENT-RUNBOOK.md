# Agent Runbook — Autonomous Red-Team Run

This file tells Claude Code exactly what to do when invoked by
`.github/workflows/redteam.yml`. The run is **read-only against the codebase**: it
audits, it never edits files, and it never pushes. Its only write action is creating
one GitHub Issue.

## Steps

1. **Read the audit logic.** Read `docs/redteam/red-team-protocol.md` and
   `docs/redteam/official-talking-points-baseline.md` in full.
2. **Gather the audit target:**
   - This repo IS the site. Read the page source under `app/` (routes: home,
     `business/`, `creative/`, `technical/`, `press/`, `contact/`, the media kit
     section, `credits/`, the mini-games).
   - Fetch the live site at `https://rutgertuit.nl` and Rutger's owned profiles
     (LinkedIn, YouTube, GitHub) via WebFetch/WebSearch where reachable.
3. **Refresh Lens B.** Web-search the latest official Google/Alphabet/DeepMind/YouTube
   posts before scoring (per protocol §0). Note in the report if search was thin and
   you fell back to the baseline.
4. **Run the three lenses** and produce the §4 output format from the protocol.
5. **File the report as a GitHub Issue:**
   - Title: `Red-Team Audit — YYYY-MM-DD` (today's UTC date).
   - Label: `red-team`.
   - Body: the full §4 output (verdict, findings table, biggest fix, copy-paste fix
     checklist).
   - Use: `gh issue create --title "<title>" --label red-team --body-file <file>`
     (the `red-team` label is created automatically by the workflow before this runs).
6. **Do NOT** commit files, modify any source, or push to any branch. The Issue is the
   only output. A push to `main` would trigger the RTNLPUSH Cloud Build deploy — never
   do this.

## If something is missing

- If the `red-team` label does not exist, create it first:
  `gh label create red-team --color B60205 --description "Red-team audit findings" || true`
- If web search returns nothing useful, proceed using the baseline file and say so in
  the executive verdict's coverage line.
