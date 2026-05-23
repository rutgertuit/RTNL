# Creative Playground — Structure Options

**Sub-Agent C output.** Pick one option at **Gate 1**.

**Scope covered (per plan § 3.2 Sub-Agent C):**
- Image generation showcase (Nano Banana focus)
- Video generation showcase (Veo evolution v2 → v3 → v3.1 → Omni)
- Music section (Lyria-anchored)
- Interactive demo component patterns — display only, no BYO API key

**Media delivery constraint:** All video / image / audio in this section consumes Cloud CDN endpoints (`media.rutgertuit.nl`) — **never raw Cloud Storage URLs or Cloud Run origins**. Enforced by the registry validator (`scripts/validate-registry.mjs`).

---

## Option C1 — Long-Scroll Atelier

**Single immersive scroll page. The three experiments flow into each other; the visitor lands and scrolls through the whole portfolio in one journey.**

### Landing page (`/creative`)

```
┌────────────────────────────────────────────────────────────┐
│  ===== HERO ===========================================    │
│                                                            │
│  [Full-bleed video loop — gradient-to-black overlay]       │
│                                                            │
│                  CREATIVE PLAYGROUND                       │
│                                                            │
│             Three experiments. One question:               │
│         what is the producer's role when the tools         │
│                  draw and sing for them?                   │
│                                                            │
│                   ↓ scroll for image                       │
│  ────────────────────────────────────────────────────      │
│                                                            │
│  ===== I. IMAGES ====================================      │
│                                                            │
│  [Full-width sticky portrait sequence: 6 portraits         │
│   of the same character across scenes. They cycle          │
│   as the visitor scrolls past — depth + parallax.]         │
│                                                            │
│  Sidebar (sticky, right):                                  │
│  ▸ The character library problem                           │
│  ▸ Prompt library (collapsed list)                         │
│  ▸ Tooling: Nano Banana                                    │
│  ▸ Source set → output set comparison                      │
│                                                            │
│  ────────────────────────────────────────────────────      │
│                                                            │
│  ===== II. MOTION ===================================      │
│                                                            │
│  [Video evolution grid: 4 clips side-by-side. v2 / v3 /    │
│   v3.1 / Omni. Same prompt. Click to play full-screen.]    │
│                                                            │
│  Below the grid:                                           │
│   – prompt text used (mono font)                           │
│   – seconds-per-clip, model version, render date           │
│                                                            │
│  ────────────────────────────────────────────────────      │
│                                                            │
│  ===== III. SOUND ===================================      │
│                                                            │
│  [Audio player (custom, dark UI) + waveform visualization. │
│   Two stages: Lyria baseline → human-refined version.      │
│   Toggle between them.]                                    │
│                                                            │
│  Stance paragraph: "Lyria is the producer's sketchpad."    │
│                                                            │
│  ────────────────────────────────────────────────────      │
│                                                            │
│  ===== EPILOGUE =====================================      │
│                                                            │
│  Single paragraph closing the loop across all three        │
│  experiments + soft CTA to the Technical section.          │
└────────────────────────────────────────────────────────────┘
```

### Detail pages

This option has **no separate detail pages**. Everything is on one scroll. Clicking any video opens a full-screen overlay (modal) for the playback experience, not navigation.

### Image-detail interaction

- A "view prompt library" expand reveals all prompts inline (collapsed by default)
- Each image has a download link (for press use)
- Hovering an image shows the source-image reference inline

### Video-detail interaction

- Click a clip → full-screen overlay
- Esc / outside-click closes
- Overlay shows the prompt + model version + render parameters in mono type below the playback

### Music interaction

- Player + waveform; toggle between Lyria-baseline and refined version
- Track credits surface model + voice / instrument library used

### Strengths
- Maximum cinematic immersion. The site IS the work — exactly the landonorris.com reference energy.
- Strong narrative continuity. One pass through tells the whole story.
- Loading strategy: hero video lazy, image sequence pre-fetched, video grid posters only (clip loads on click).
- Mobile collapses cleanly — sticky sidebars become inline section descriptors.

### Trade-offs
- Hard to deep-link to a specific experiment. (Anchor links help but feel awkward.)
- Hard to keep an experiment "fresh" without replacing the whole page.
- LLM crawl: one long page. Section anchors help, but the page-level metadata is one piece of content, not three. Less granular for GEO.
- Cloud CDN must serve cleanly under scroll-triggered video loads.

---

## Option C2 — Three Doors

**Landing surfaces three distinct experiences as equal-weight cards. Each opens its own detail page with full immersion inside.**

### Landing page (`/creative`)

```
┌────────────────────────────────────────────────────────────┐
│  [eyebrow: CREATIVE PLAYGROUND]                            │
│                                                            │
│  Three experiments at the intersection of AI tooling       │
│  and the producer's role.                                  │
│                                                            │
│  ┌──────────────────┬──────────────────┬─────────────────┐ │
│  │                  │                  │                 │ │
│  │   [hover-loop    │   [hover-loop    │   [waveform     │ │
│  │    image grid:   │    video clip:   │    + play       │ │
│  │    6 portraits   │    Veo Omni      │    button]      │ │
│  │    cycling]      │    sample]       │                 │ │
│  │                  │                  │                 │ │
│  │  IMAGES          │   MOTION         │   SOUND         │ │
│  │  ─────           │   ──────         │   ─────         │ │
│  │  Consistent      │   Veo across     │   Lyria as      │ │
│  │  character       │   four model     │   the producer's│ │
│  │  portraits.      │   generations.   │   sketchpad.    │ │
│  │                  │                  │                 │ │
│  │  → enter         │   → enter        │   → enter       │ │
│  └──────────────────┴──────────────────┴─────────────────┘ │
│                                                            │
│  ──────────────────────────────────────────────────────    │
│                                                            │
│  Each experiment is documented as it ran: source           │
│  inputs, prompts, outputs, what failed, what surprised.    │
│                                                            │
└────────────────────────────────────────────────────────────┘
```

### Detail pages

Each "door" leads to a dedicated route:

- `/creative/images` — Nano Banana image showcase
- `/creative/motion` — Veo evolution showcase
- `/creative/sound` — Lyria music piece

#### Detail page anatomy (consistent across all three)

```
┌────────────────────────────────────────────────────────────┐
│  [eyebrow: CREATIVE / IMAGES]                              │
│                                                            │
│  CONSISTENT CHARACTER PORTRAITS                            │
│  ─────────────────────────                                 │
│                                                            │
│  [Hero media — full-bleed. Type of media matches the       │
│   experiment: image sequence / video / waveform.]          │
│                                                            │
│  ──────────────────────────────────────────────────────    │
│                                                            │
│  ## What the experiment was                                │
│  [Prose paragraph]                                         │
│                                                            │
│  ## What I tried                                           │
│  [Numbered steps + screenshots]                            │
│                                                            │
│  ## What worked                                            │
│  [Output examples — gallery / video grid / audio toggle]   │
│                                                            │
│  ## What surprised me                                      │
│  [Prose]                                                   │
│                                                            │
│  ## Prompts used (collapsed by default)                    │
│  [Mono-font code block]                                    │
│                                                            │
│  ## Tooling                                                │
│  [Model + version + tools list]                            │
│                                                            │
│  ──────────────────────────────────────────────────────    │
│                                                            │
│  → Next experiment                                         │
└────────────────────────────────────────────────────────────┘
```

### Strengths
- Each experiment can grow independently and be replaced without touching the others.
- Deep-linking to a specific experiment works naturally.
- Better LLM/GEO granularity: each detail page is its own structured-data entity with `VideoObject` / `ImageObject` / `MusicRecording` schema markup.
- Easier to add a 4th / 5th experiment over time.
- Easier to handle creative content of different lengths cleanly.

### Trade-offs
- Less immediate cinematic punch on landing — visitors choose, then immerse.
- Three doors framing repeats a familiar pattern (lots of portfolio sites have this).
- Visitors who don't pick a door bounce — the landing has to do work to invite click-through.

---

## Decision criteria for Gate 1

| Question | If yes → C1 | If yes → C2 |
|---|---|---|
| Should a first-time visitor encounter the whole portfolio in one scroll? | ✅ | |
| Is cinematic immersion the headline experience? | ✅ | |
| Will new experiments be added frequently? | | ✅ |
| Do you want each experiment to deep-link cleanly? | | ✅ |
| Are individual experiments long enough to warrant their own page? | | ✅ |
| Is GEO granularity (one schema.org entity per experiment) a priority? | | ✅ |

---

## Implementation notes (apply to whichever option wins)

- All media URLs MUST come from the registry's `media[].cdn_url` field — validator enforces CDN-only
- Hero video: `<video autoplay muted loop playsInline preload="metadata">` + `<source>` from CDN
- Image sequences: `<img>` with `loading="lazy"` + IntersectionObserver-driven cycle
- Audio: native `<audio>` with custom CSS-styled controls (no third-party player)
- Schema.org: `VideoObject`, `ImageObject`, `MusicRecording` per experiment
- Reduced-motion: respect `prefers-reduced-motion`; auto-playing video pauses, scroll-parallax becomes static
- Performance budget: hero video ≤ 3MB, posters compressed; never block LCP on video

## Files to create when the option is picked

### C1 (Long-Scroll Atelier)
```
app/creative/
  page.tsx                          (the single long page)
components/creative/
  HeroVideoLoop.tsx + .css
  ImageSequenceSticky.tsx + .css
  VideoEvolutionGrid.tsx + .css
  MusicPlayerCustom.tsx + .css
  PromptLibraryExpand.tsx + .css
```

### C2 (Three Doors)
```
app/creative/
  page.tsx                          (door landing)
  images/page.tsx
  motion/page.tsx
  sound/page.tsx
components/creative/
  CreativeDoor.tsx + .css           (the landing card)
  ExperimentPage.tsx + .css         (shared detail-page layout)
  ImageGallery.tsx + .css
  VideoEvolutionGrid.tsx + .css
  MusicPlayerCustom.tsx + .css
  PromptLibraryExpand.tsx + .css
```
