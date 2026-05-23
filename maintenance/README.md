# Self-Maintenance — three loops

**Status:** Architecture only in v1. Activation is Phase 4 territory.

Per `CLAUDE.md` and `docs/phase-2-architecture.md` § 2.4. Every loop writes to a review queue. **Nothing auto-publishes.**

## The three loops

| Loop | Folder | Trigger | Output |
|---|---|---|---|
| Model freshness | `model-freshness/` | Cron (daily) | `queue/model-freshness/<ts>.json` |
| Corporate alignment | `corporate-alignment/` | Cron (weekly) + on push to `/maintenance/corporate_inputs/` | `queue/corporate-alignment/<ts>.json` |
| Cross-linking | `cross-linking/` | On push to `registry.json` or any markdown under `content/` | `queue/cross-linking/<ts>.json` |

Each loop's folder contains:

- `README.md` — what this loop does
- `config.json` — thresholds, schedule
- (Phase 4) `runner.ts` — actual implementation, deployed as a Cloud Run job

## Output structure (review queue)

```
maintenance/
  queue/
    model-freshness/
      2026-06-01T03-00-00Z.json
    corporate-alignment/
      2026-06-01T04-00-00Z.json
    cross-linking/
      2026-06-01T05-00-00Z.json
```

Each file has shape:

```json
{
  "loop": "model-freshness",
  "generated_at": "2026-06-01T03:00:00Z",
  "flagged_items": [
    {
      "id": "vision-piece",
      "reason": "model_version 'gemini-2.5-flash' deprecated 2026-04",
      "severity": "warn",
      "suggested_action": "rewrite with current Gemini family"
    }
  ]
}
```

## How review happens

1. Loop writes a file to `maintenance/queue/<loop>/`
2. (Optional, Phase 4) An admin UI on a private subdomain surfaces the queue
3. Rutger reviews, applies the changes he agrees with via a PR
4. The PR updates the affected `registry.json` `last_reviewed` and `corporate_alignment_check` fields

## What the loops never do

- They do not edit markdown content directly
- They do not change `publish_state`
- They do not auto-merge anything
- They do not call Cloud Storage delete / move operations
