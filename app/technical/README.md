# Technical / Deep End — Structure Options

**Sub-Agent D output.** Pick one option at **Gate 1**.

**Scope covered (per plan § 3.2 Sub-Agent D):**
- Project card / detail page patterns for the 6 deep-end projects
- Homelab visualization concept
- (Media Kit page lives in `app/media-kit/README.md` — same Sub-Agent D, but separate file because the structure problem is different)

**The six deep-end projects (per audit):**
1. Luminary (= ACBUDDY)
2. Shop Life Assistant (= Keldra / stockmaster, pending confirmation)
3. Cloud Cannon (private — featured-by-description option)
4. Boardroom Simulator (private)
5. Bedtime Story Generator (private)
6. Homelab Stack (installation, not a repo)

---

## Option D1 — System Diagram + Project Index

**The deep-end opens with the homelab topology drawn at scale, then a project index below. The diagram IS the visual identity of the section.**

### Landing page (`/technical`)

```
┌────────────────────────────────────────────────────────────┐
│  [eyebrow: THE DEEP END]                                   │
│                                                            │
│  Six projects. One operating principle:                    │
│  AI is leverage, not a substitute, for someone             │
│  who isn't an engineer.                                    │
│                                                            │
│  ──────────────────────────────────────────────────────    │
│                                                            │
│  ===== HOMELAB TOPOLOGY (live diagram) ============        │
│                                                            │
│         ┌──────────────┐                                   │
│         │  rutgertuit  │ ◀── WhatsApp gateway              │
│         │   (Pi5)      │     (Hermes voice / chat)         │
│         └──────┬───────┘                                   │
│                │                                           │
│        ┌───────┼───────┐                                   │
│        ▼       ▼       ▼                                   │
│   [5090]   [5060]   [Vertex AI]                            │
│   Qwen3.6  Qwen3    Gemini Flash aux                       │
│   primary  fallback Anthropic Opus final                   │
│                                                            │
│   (SVG, animated dot flow showing message traffic,         │
│    redacted IPs, hover to expand a node)                   │
│                                                            │
│  ──────────────────────────────────────────────────────    │
│                                                            │
│  ===== PROJECTS ====================================       │
│                                                            │
│  01 / LUMINARY                              [→ open]       │
│  Multi-persona deep research orchestrator.                 │
│  Talk to Maya, Barnaby, the Consultant, the Strategist.    │
│                                                            │
│  02 / SHOP LIFE ASSISTANT (KELDRA)          [→ open]       │
│  Household logistics with batch-tracking and a 14-day      │
│  forecast underneath.                                      │
│                                                            │
│  03 / CLOUD CANNON                          [→ private]    │
│  Brand-aligned writing tool with corporate-message         │
│  attribution per draft.                                    │
│                                                            │
│  04 / BOARDROOM SIMULATOR                   [→ private]    │
│  Practice tough conversations against persona-traited      │
│  AI agents.                                                │
│                                                            │
│  05 / BEDTIME STORY GENERATOR               [→ private]    │
│  Consistent character library + reading-level + math-      │
│  difficulty calibrated stories, output as printable        │
│  booklets.                                                 │
│                                                            │
│  06 / HOMELAB STACK                         [→ open]       │
│  See diagram above. Long-form below.                       │
│                                                            │
└────────────────────────────────────────────────────────────┘
```

### Project detail page (`/technical/[slug]`)

```
┌─────────────────────────────┬──────────────────────────────┐
│                             │                              │
│  [eyebrow: 01 / LUMINARY]   │  AT A GLANCE                 │
│                             │  ─────────────               │
│  LUMINARY                   │  Models  Qwen 3.6 + Gemini   │
│  Multi-persona deep         │          + Anthropic Opus    │
│  research orchestrator.     │  Voice   ElevenLabs (Chris)  │
│  ─────────────────────      │  Status  Migrating →         │
│                             │          Hermes-Native       │
│  [hero media — screenshot,  │  Built   2025 (cloud), 2026  │
│   diagram, or video]        │          (migration)         │
│                             │                              │
│                             │  EXTERNAL                    │
│  ## The problem             │  → github.com/ACBUDDY        │
│  [prose]                    │                              │
│                             │  ─────────────               │
│  ## What I built            │  RELATED                     │
│  [prose + screenshots]      │  → Homelab Stack             │
│                             │  → Vision Piece              │
│  ## Why this way            │                              │
│  [architecture decisions    │  CREDITS                     │
│   in plain language]        │  Built with Claude Code      │
│                             │  + Hermes Agent v0.14        │
│  ## What's next             │                              │
│  [migration narrative]      │                              │
│                             │                              │
│  ## Stack                   │                              │
│  [mono-font block]          │                              │
└─────────────────────────────┴──────────────────────────────┘
```

### "Private" project handling (Cloud Cannon, Boardroom, Bedtime)

These projects don't have public repos. Two display options under D1:

- **Description-only card** — opens an in-place expand showing the long-form description without a separate detail page
- **Detail page without repo link** — same anatomy as above but the "EXTERNAL" sidebar reads "Private project" instead of GitHub URL

Pick one consistent treatment site-wide.

### Homelab visualization

The diagram on the landing is the visualization. The homelab "project page" is then mostly prose + photos + a static version of the diagram + the operating-contract narrative (Rule 1-6).

### Strengths
- Strong visual anchor — the homelab diagram is unique to Rutger, can't be replicated by a template
- The diagram doubles as portfolio + project, no duplication
- Project index reads cleanly at scale; adding a 7th project is trivial
- Industrial-luxury aesthetic served well by structured topology lines + monospace overlays

### Trade-offs
- The diagram demands real production: needs to be designed (Phase 3 Gate 2 dependency)
- Public/private mixing requires editorial judgement per project
- The six-project list is currently uneven (3 public, 3 private, 1 installation) — D1 doesn't hide that

---

## Option D2 — Project-First Grid

**Six project cards as equal-weight grid. Homelab is a card like the others. The diagram lives inside its detail page, not as the section's centerpiece.**

### Landing page (`/technical`)

```
┌────────────────────────────────────────────────────────────┐
│  [eyebrow: THE DEEP END]                                   │
│                                                            │
│  Six AI-assisted builds. Some you can run, some you        │
│  can read about, all built outside engineering training.   │
│                                                            │
│  ──────────────────────────────────────────────────────    │
│                                                            │
│  ┌─────────────────────┬─────────────────────┐             │
│  │                     │                     │             │
│  │  LUMINARY           │  SHOP LIFE          │             │
│  │  ─────────          │  ASSISTANT          │             │
│  │  [hero image]       │  ─────────          │             │
│  │                     │  [hero image]       │             │
│  │  Multi-persona      │                     │             │
│  │  research, voice    │  Household logistics│             │
│  │  via WhatsApp.      │  with a 14-day      │             │
│  │                     │  forecast.          │             │
│  │  Open → repo        │                     │             │
│  │                     │  Open → repo        │             │
│  └─────────────────────┴─────────────────────┘             │
│                                                            │
│  ┌─────────────────────┬─────────────────────┐             │
│  │  CLOUD CANNON       │  BOARDROOM SIM      │             │
│  │  ─────────          │  ─────────          │             │
│  │  [hero image]       │  [hero image]       │             │
│  │                     │                     │             │
│  │  Brand-aligned      │  Persona-traited    │             │
│  │  drafting w/        │  conversation       │             │
│  │  attribution.       │  simulator.         │             │
│  │                     │                     │             │
│  │  Private — open →   │  Private — open →   │             │
│  │  description        │  description        │             │
│  └─────────────────────┴─────────────────────┘             │
│                                                            │
│  ┌─────────────────────┬─────────────────────┐             │
│  │  BEDTIME STORIES    │  HOMELAB STACK      │             │
│  │  ─────────          │  ─────────          │             │
│  │  [hero image]       │  [hero image]       │             │
│  │                     │                     │             │
│  │  Consistent         │  Five GPUs + a Pi + │             │
│  │  characters in      │  an operating       │             │
│  │  printed booklets.  │  contract.          │             │
│  │                     │                     │             │
│  │  Private — open →   │  Open — full tour → │             │
│  │  description        │                     │             │
│  └─────────────────────┴─────────────────────┘             │
└────────────────────────────────────────────────────────────┘
```

### Project detail page

Same anatomy as D1 (prose body + sticky sidebar). The homelab detail page is where the topology diagram lives, expanded with photos + the operating contract.

### "Private" handling

Cards show a "Private — open → description" CTA that opens a detail page identical in structure to the public projects, but the "EXTERNAL" sidebar shows "Private project — featured by description" with no link.

### Strengths
- All six projects feel equally curated regardless of public/private status
- Clean grid scales to 7+, 8+ projects without redesign
- Each card is self-contained; visitor browses by interest
- Easier responsive design — grid collapses to 1 column on mobile
- LLM/GEO friendly: six distinct `CreativeWork` entities

### Trade-offs
- Loses the unique visual anchor that D1's centerpiece diagram provides
- Six equal cards is less narratively interesting than a structured topology
- Hero image per card requires sourcing — three private projects have no obvious hero image

---

## Decision criteria for Gate 1

| Question | If yes → D1 | If yes → D2 |
|---|---|---|
| Is the homelab the most visually striking asset Rutger has? | ✅ | |
| Should visitors land and immediately see "real infrastructure"? | ✅ | |
| Do you want the section to look unlike any other portfolio site? | ✅ | |
| Should the six projects feel equal-weight? | | ✅ |
| Will more projects be added over time? | | ✅ |
| Is private/public parity a priority? | | ✅ |

---

## Implementation notes (apply to whichever option wins)

- Project metadata lives in `registry.json` — each project is a registry item with `collection: "technical"`
- Hero images for each project come from CDN (validator-enforced)
- Status states map to a visual treatment:
  - `live` → "Open → repo" or "Open — full tour →"
  - private (no public link) → "Private — featured by description"
- For Homelab: privacy redaction in any photos / screenshots (no family names, addresses, internal IPs)
- The topology diagram (D1) is an SVG, not a raster image — sharper at scale + the dot-flow animation runs in CSS, no JS library needed

## Files to create when the option is picked

### D1 (System Diagram + Index)
```
app/technical/
  page.tsx                          (landing with diagram + index)
  [slug]/page.tsx                   (project detail)
components/technical/
  TopologyDiagram.tsx + .css        (SVG + dot-flow animation)
  ProjectIndexRow.tsx + .css        (index row)
  ProjectDetailLayout.tsx + .css
  ProjectSidebar.tsx + .css
content/technical/
  luminary.md
  shop-life-assistant.md
  cloud-cannon.md
  boardroom-simulator.md
  bedtime-stories.md
  homelab-stack.md
```

### D2 (Project-First Grid)
```
app/technical/
  page.tsx                          (card grid)
  [slug]/page.tsx                   (project detail — same anatomy)
components/technical/
  ProjectCard.tsx + .css            (card grid item)
  ProjectDetailLayout.tsx + .css
  ProjectSidebar.tsx + .css
  TopologyDiagram.tsx + .css        (still needed for homelab detail page)
content/technical/
  (same six markdown files)
```
