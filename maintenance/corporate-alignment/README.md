# Maintenance Loop 2 — Corporate Alignment

**Trigger:**
- Cron, weekly, Mondays 04:00 UTC
- On push to `/maintenance/corporate_inputs/` (Cloud Build webhook)

**Inputs:**
- All `publish_state: "live"` items in `web/content/registry.json` + their markdown bodies
- All files in `/maintenance/corporate_inputs/` (public Google Keyword blogs, official YouTube press releases, keynote transcripts that Rutger curates)

**Logic:**
1. Build embedding corpus from `/maintenance/corporate_inputs/` (Vertex AI embeddings)
2. For each live item, compute:
   - Top-k semantic similarity to the corpus
   - Extracted claims from the item, scored for contradiction against the corpus
   - Terminology drift score (specific Google/YouTube/Ads vocabulary present / absent)
3. Verdict per item:
   - `aligned` — within threshold on all three checks
   - `needs-review` — soft signal on one or more checks
   - `drift-flagged` — strong contradiction or major terminology mismatch
4. Update each item's `corporate_alignment_check.last_checked` + `verdict` + `diff_summary` + `inputs_version` in `registry.json`
5. Write flagged set to `maintenance/queue/corporate-alignment/<timestamp>.json` (only items where verdict != `aligned`)

**The boundary (per CLAUDE.md):**

> Alignment is checked by diffing site content against documents in `/maintenance/corporate_inputs/`. Do NOT attempt to wire into live internal feeds — folder-as-input is the deliberate boundary.

**What this loop NEVER does:**
- Edit article text
- Take content offline
- Notify anyone other than via the queue file

**Activation:** Phase 4. Needs `/maintenance/corporate_inputs/` seeded with starter docs first (a Phase 3.1 prerequisite — see `docs/phase-1/user-blocked-items.md` D1).
