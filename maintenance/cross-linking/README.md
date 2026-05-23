# Maintenance Loop 3 — Cross-Linking

**Trigger:** On push to `web/content/registry.json` or any markdown under `web/content/` (Cloud Build webhook)

**Inputs:**
- All registry items

**Logic:**
1. For each pair of items, compute:
   - Topic-tag overlap (Jaccard)
   - Embedding similarity over the markdown bodies
2. For each item, suggest `related_items` additions where:
   - Existing `related_items` is sparse (< 2)
   - At least one other item exceeds the relatedness threshold
3. Write suggested edits to `maintenance/queue/cross-linking/<timestamp>.json`

**Suggested edit structure:**

```json
{
  "loop": "cross-linking",
  "generated_at": "2026-06-01T05:00:00Z",
  "suggestions": [
    {
      "id": "vision-piece",
      "current_related_items": [],
      "suggested_related_items": ["building-blocks", "luminary"],
      "rationale": "Strong topic-tag overlap on 'agent-briefing' and embedding similarity > 0.7"
    }
  ]
}
```

**What this loop NEVER does:**
- Modify `related_items` directly in `registry.json`
- Add or remove items

**Activation:** Phase 4.
