# Agent Runbook — Autonomous Red-Team Run

This file is the self-contained prompt for a **Claude Routine** (subscription-billed,
not the metered API). The Routine runs weekly on Anthropic-managed infrastructure,
clones this repo, and follows the steps below. The run is **read-only against the
codebase**: it audits, it never edits files, and it never pushes. Its only write
action is creating one GitHub Issue.

See "How to schedule this" at the bottom for one-time setup.

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
   - First ensure the label exists (idempotent):
     `gh label create red-team --color B60205 --description "Red-team audit findings" || true`
   - Title: `Red-Team Audit — YYYY-MM-DD` (today's UTC date).
   - Label: `red-team`.
   - Body: the full §4 output (verdict, findings table, biggest fix, copy-paste fix
     checklist).
   - Use: `gh issue create --title "<title>" --label red-team --body-file <file>`
6. **Do NOT** commit files, modify any source, or push to any branch. The Issue is the
   only output. A push to `main` would trigger the RTNLPUSH Cloud Build deploy — never
   do this.

## If something is missing

- If web search returns nothing useful, proceed using the baseline file and say so in
  the executive verdict's coverage line.

## How to schedule this (one-time setup)

This runs as a **Claude Routine**, which bills against your Claude subscription (Pro/
Max) — no Anthropic API key, no per-token cost.

1. Go to <https://claude.ai/code/routines> (or run `/schedule` in the Claude Code CLI).
2. Create a routine:
   - **Repository:** `rutgertuit/RTNL`
   - **Trigger:** Schedule → Weekly (pick a day/time).
   - **Prompt:** `Follow docs/redteam/AGENT-RUNBOOK.md exactly. Audit the site and file
     the findings as a GitHub Issue in this repo. Do not edit files or push to any
     branch.`
3. When prompted, authorize the Claude GitHub App so the routine can create Issues
   under your GitHub identity (one-time OAuth).
4. Use **Run now** once to validate end-to-end, then check the created `red-team`
   Issue. It auto-runs on schedule thereafter.

Notes: Routines are a research preview (limits may change) and run autonomously with
no approval prompts — which is safe here because the task is read-only and only files
an Issue. The same prompt works for an ad-hoc manual run any time.
