# Business Section — Structure Options

**Sub-Agent B output.** Pick one option at **Gate 1**.

**Scope covered (per plan § 3.2 Sub-Agent B):**
- Article layouts (vision piece, data strength, building blocks)
- Thought leadership / interview index
- Cross-link presentation patterns

Per CLAUDE.md: industrial-luxury aesthetic, gradient-to-black depth, typography popping forward, structural option count = **2** (not 2-3).

---

## Option B1 — Editorial Column

**Reading-first. The three business articles dominate. Index is sidebar furniture.**

### Landing page (`/business`)

```
┌────────────────────────────────────────────────────────────┐
│  [eyebrow: BUSINESS & LEADERSHIP]                          │
│                                                            │
│  Three pieces on how leaders brief, activate, and          │
│  compose with AI agents.                                   │
│                                                            │
│  ──────────────────────────────────────────────────────    │
│                                                            │
│  01 / Equal opportunity for agents       [→ vision]        │
│  ──────────────────────────────────────────────────────    │
│  Why precision in instructions matters when AI joins       │
│  your team. (~9 min read)                                  │
│                                                            │
│  ──────────────────────────────────────────────────────    │
│                                                            │
│  02 / Beyond clean, toward activated     [→ data]          │
│  ──────────────────────────────────────────────────────    │
│  The next data-maturity rung is not insight; it's          │
│  activation. (~12 min read)                                │
│                                                            │
│  ──────────────────────────────────────────────────────    │
│                                                            │
│  03 / Building blocks                     [→ building]     │
│  ──────────────────────────────────────────────────────    │
│  A working marketer's reading list from Google's           │
│  open-source. (~8 min read)                                │
│                                                            │
│  ══════════════════════════════════════════════════════    │
│                                                            │
│  ELSEWHERE                                                 │
│  Interviews + talks + appearances                          │
│  → press / interview index                                 │
└────────────────────────────────────────────────────────────┘
```

### Article detail page (e.g. `/business/equal-opportunity-for-agents`)

```
┌─────────────────────────────┬──────────────────────────────┐
│                             │                              │
│  [eyebrow: 01 / VISION]     │  ON THIS PAGE                │
│                             │  – The brief is the unit     │
│  EQUAL OPPORTUNITY          │  – Anatomy of a brief        │
│  FOR AGENTS                 │  – What changes for AI       │
│  ─────────────────────      │  – Examples                  │
│                             │                              │
│  Why precision in           │  RELATED                     │
│  instructions matters       │  → Luminary (deep-end)       │
│  when AI joins your team.   │  → Building Blocks (next)    │
│                             │                              │
│  ─────────────────────      │  CREDITS                     │
│                             │  Hidden — see About          │
│  [article body, 68ch wide]  │                              │
│  ...                        │                              │
│                             │                              │
└─────────────────────────────┴──────────────────────────────┘
   8 cols                          4 cols (sticky)
```

### Interview index (`/business/elsewhere`)

A vertical list, dated, by outlet. No card chrome — typography does the work. Each entry: outlet, headline, date, single sentence pulled quote, link out.

### Cross-link pattern

- **In-article inline** — `[Building Blocks →]` link reference within prose
- **Sticky sidebar** — RELATED section, always-visible on desktop
- **Footer of article** — Next/Prev in the three-piece sequence (1 → 2 → 3 → back to landing)

### Strengths
- Reads like an editorial portfolio. The articles feel weighty.
- Sequence narrative (01 / 02 / 03) signals intentionality.
- Sidebar TOC supports long reads; sticky RELATED keeps cross-links present without breaking flow.
- LLM/crawler friendly: each piece is a long, semantically-clean article with structured data.

### Trade-offs
- Mobile collapses the sidebar; readers lose the always-visible cross-link surface.
- Interview index is treated as secondary furniture — works only if the interviews aren't the headline draw.

---

## Option B2 — Triple-Pillar Hub

**Three articles foregrounded equally as anchors. Interviews live alongside, not subordinate.**

### Landing page (`/business`)

```
┌────────────────────────────────────────────────────────────┐
│  [eyebrow: BUSINESS & LEADERSHIP]                          │
│                                                            │
│  Three frameworks. One thesis: AI changes leverage,        │
│  not craft.                                                │
│                                                            │
│  ┌──────────────┬──────────────┬──────────────┐            │
│  │              │              │              │            │
│  │   VISION     │     DATA     │   BUILDING   │            │
│  │              │              │    BLOCKS    │            │
│  │  Equal       │  Beyond      │  A working   │            │
│  │  opportunity │  clean,      │  marketer's  │            │
│  │  for agents  │  toward      │  reading     │            │
│  │              │  activated   │  list        │            │
│  │              │              │              │            │
│  │  [→ read]    │  [→ read]    │  [→ read]    │            │
│  └──────────────┴──────────────┴──────────────┘            │
│                                                            │
│  ──────────────────────────────────────────────────────    │
│                                                            │
│  IN CONVERSATION                                           │
│                                                            │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │ [outlet]     │  │ [outlet]     │  │ [outlet]     │      │
│  │ [headline]   │  │ [headline]   │  │ [headline]   │      │
│  │ [date]       │  │ [date]       │  │ [date]       │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
│                                                            │
└────────────────────────────────────────────────────────────┘
```

### Article detail page

Same structural choice as B1 (article body + sticky sidebar with TOC + RELATED) but the sidebar adds a **"part of the trilogy"** signal showing the other two pieces ↑ and ↓ within the same flow.

```
┌─────────────────────────────┬──────────────────────────────┐
│  [eyebrow: 01 / VISION]     │  THE TRILOGY                 │
│                             │  ▣ 01 Vision — you are here  │
│  ...                        │  □ 02 Data Strength          │
│                             │  □ 03 Building Blocks        │
│                             │                              │
│                             │  ─────────────────────       │
│                             │  ON THIS PAGE                │
│                             │  ...                         │
│                             │  ─────────────────────       │
│                             │  RELATED ELSEWHERE           │
│                             │  → Luminary                  │
└─────────────────────────────┴──────────────────────────────┘
```

### Interview index

Three-column card grid, equal weight. Each card: outlet logo, headline (h3), date, 1-line excerpt, link out.

### Cross-link pattern

- **Trilogy navigator** — sidebar position making the three-piece set always visible
- **In-article inline** — `[Building Blocks →]` references
- **Bottom of article** — explicit "Read 02/03 next" CTA

### Strengths
- Three articles read as one *body of work*, not a sequence to consume in order.
- Interviews get visual prominence — the "in conversation" framing signals two-way activity.
- Easier to skim on mobile (cards collapse cleanly).

### Trade-offs
- Less editorial weight per piece on the landing — they all share the spotlight.
- The "trilogy navigator" can feel busy if the article is short.

---

## Decision criteria for Gate 1

| Question | If yes → B1 | If yes → B2 |
|---|---|---|
| Is the article-reading experience the headline? | ✅ | |
| Do the three articles work as a sequence (01 → 02 → 03)? | ✅ | |
| Is sequential reading the intended path? | ✅ | |
| Is the trilogy a *body* more than a *journey*? | | ✅ |
| Do interviews carry equal weight to articles? | | ✅ |
| Is the audience likely to mobile-first? | | ✅ |

---

## Implementation notes (apply to whichever option wins)

- All articles consume `Container variant="narrow"` (720px max) for body type
- Sidebars use `Container variant="default"` (1200px) with a 8/4 grid
- Sticky sidebars: `position: sticky; top: var(--space-8);`
- All text uses tokens; no hard-coded sizes
- Each article has a `RegistryItem` entry with `body_path` pointing at the markdown
- Cross-link patterns hit `lib/registry.ts > getRelatedItems(id)` — never hard-code

## Files to create when the option is picked

```
app/business/
  page.tsx                          (landing)
  [slug]/page.tsx                   (article detail)
  elsewhere/page.tsx                (interview index)
components/business/
  ArticleCard.tsx + .css
  ArticleSidebar.tsx + .css         (B1 variant) OR
  TrilogyNav.tsx + .css             (B2 variant)
  InterviewEntry.tsx + .css
content/business/
  vision-piece.md
  data-strength.md
  building-blocks.md
  interviews/*.md
```
