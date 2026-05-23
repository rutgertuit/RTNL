# Maintenance Loop 1 — Model Freshness

**Trigger:** Cron, daily, 03:00 UTC (via Cloud Scheduler → Cloud Run job)

**Inputs:**
- `web/content/registry.json` — `model_used`, `model_version`, `last_reviewed` per item
- `web/maintenance/model-freshness/deprecation-feed.json` — manually maintained list of model staleness thresholds

**Logic:**
1. For each registry item, compute `now - last_reviewed`
2. Look up `model_version` in the deprecation feed
3. Flag if any of:
   - `model_version` listed as deprecated
   - `model_version` listed as superseded AND age > threshold for that family
   - `last_reviewed` older than the global staleness ceiling (default 180 days)
4. Write flagged set to `maintenance/queue/model-freshness/<timestamp>.json`

**Output structure:** see `../README.md`.

**What this loop NEVER does:**
- Rewrite content
- Modify `registry.json` directly
- Send Rutger a notification (queue file appears in repo; PR review is the UI)

**Activation:** Phase 4. v1 ships the architecture and config; the runner is not deployed.
