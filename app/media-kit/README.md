# Media Kit — Structure Options

**Sub-Agent D output (Media Kit portion).** Pick one option at **Gate 1**.

**Scope covered:**
- Speaker bios (short / medium / long)
- Official photography (press-ready downloads)
- Logo set (light + dark backgrounds)
- Talk topics / one-line pitches
- Past event list
- Booking contact
- Speaker engagement landing pattern

**Audience:** event organizers, journalists, podcast bookers. They want to find specific assets fast and trust they're current. Visual flourish is secondary; clarity is primary.

---

## Option M1 — Single-Page Press Kit

**One scrolling page. Everything visible. Anchor-linked sections. Print-friendly.**

### Page layout (`/media-kit`)

```
┌────────────────────────────────────────────────────────────┐
│  [Top nav: ▸Bio  ▸Photos  ▸Logos  ▸Topics  ▸Events  ▸Book] │
│                                                            │
│  [eyebrow: MEDIA KIT]                                      │
│                                                            │
│  RUTGER TUIT — PRESS & BOOKING                             │
│  ─────────────────────────────                             │
│                                                            │
│  Last updated: 2026-05-23   |   Download full kit ↓ PDF    │
│                                                            │
│  ==== BIO ============================================     │
│                                                            │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  Short bio (50 words)                    [copy] │   │
│  │  ──────────────────────                              │   │
│  │  [text]                                              │   │
│  │                                                      │   │
│  │  Medium bio (180 words)                  [copy] │   │
│  │  ─────────────────────                               │   │
│  │  [text]                                              │   │
│  │                                                      │   │
│  │  Long bio (400 words)                    [copy] │   │
│  │  ───────────────────                                 │   │
│  │  [text]                                              │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                            │
│  ==== PHOTOS =========================================     │
│                                                            │
│  ┌─────────┬─────────┬─────────┬─────────┐                 │
│  │ headshot│ headshot│ on-stage│ on-stage│                 │
│  │   1     │   2     │   1     │   2     │                 │
│  │  [↓]    │  [↓]    │  [↓]    │  [↓]    │                 │
│  └─────────┴─────────┴─────────┴─────────┘                 │
│                                                            │
│  Hi-res only. Each thumbnail downloads original quality.   │
│                                                            │
│  ==== LOGOS ==========================================     │
│                                                            │
│  ┌──────────┬──────────┬──────────┐                        │
│  │ light bg │ dark bg  │ mono     │                        │
│  │  [SVG]   │  [SVG]   │  [SVG]   │                        │
│  │  ↓ SVG   │  ↓ SVG   │  ↓ SVG   │                        │
│  │  ↓ PNG   │  ↓ PNG   │  ↓ PNG   │                        │
│  └──────────┴──────────┴──────────┘                        │
│                                                            │
│  ==== TOPICS =========================================     │
│                                                            │
│  ▸ Briefing AI agents like teammates                       │
│  ▸ Data activation, not just analysis                      │
│  ▸ AI-assisted creativity for non-engineers                │
│  ▸ Brand-aligned automated content                         │
│  ▸ Multi-agent research at production scale                │
│                                                            │
│  Each topic expands to a 2-sentence pitch.                 │
│                                                            │
│  ==== EVENTS =========================================     │
│                                                            │
│  2026                                                      │
│  ─────                                                     │
│  [event]    [outlet]    [date]                             │
│  [event]    [outlet]    [date]                             │
│                                                            │
│  2025                                                      │
│  ─────                                                     │
│  [event]    [outlet]    [date]                             │
│                                                            │
│  ==== BOOK A TALK ====================================     │
│                                                            │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  For speaking engagements + interviews:              │   │
│  │  ▸ Email: rutger@rutgertuit.nl                       │   │
│  │  ▸ Best response time: weekdays                      │   │
│  │  ▸ Topics + recent events above                      │   │
│  └─────────────────────────────────────────────────────┘   │
└────────────────────────────────────────────────────────────┘
```

### Speaker engagement landing — same page anchor

Booking is a section, not a separate page. The page IS the engagement landing because press / bookers consume it as a single artifact.

### Print stylesheet

Page is fully printable as a PDF press kit. `@media print` removes nav chrome, surfaces all bios, photos as their captions only, contact details prominent.

### Strengths
- Press / journalists find everything fast — no clicks needed
- One canonical URL to share (`rutgertuit.nl/media-kit`)
- Downloads-as-PDF works cleanly (the page IS the PDF in print mode)
- Updates are visible — `last updated: <date>` at top builds trust
- Lightweight: no separate routes, no detail pages

### Trade-offs
- One long page can feel undifferentiated visually
- Photos / logos sections don't get cinematic treatment
- If the kit grows substantially (10+ photos, 20+ events), this page gets long

---

## Option M2 — Two-Tier Kit + Speaker Landing

**Quick-glance kit landing + a separate, higher-design speaker engagement page.**

### Kit landing (`/media-kit`)

A compact, organizer-focused page. Tighter than M1's full-page kit. Aims to get the asset into the organizer's email in under 30 seconds.

```
┌────────────────────────────────────────────────────────────┐
│  [eyebrow: MEDIA KIT]                                      │
│                                                            │
│  RUTGER TUIT                                               │
│  ──────────                                                │
│                                                            │
│  For press, organizers, and bookers.                       │
│                                                            │
│  ┌──────────────────┬──────────────────┐                   │
│  │  WHAT YOU NEED   │   BIOS           │                   │
│  │                  │   ▸ Short        │                   │
│  │  ☐ Bios          │   ▸ Medium       │                   │
│  │  ☐ Photos        │   ▸ Long         │                   │
│  │  ☐ Logos         │   [copy buttons] │                   │
│  │  ☐ Topics        │                  │                   │
│  │  ☐ Past events   │                  │                   │
│  │  ☐ Book a talk   │                  │                   │
│  └──────────────────┴──────────────────┘                   │
│                                                            │
│  ──────────────────────────────────────────────────────    │
│                                                            │
│  Photos / Logos / Topics / Events — same as M1 but tighter │
│                                                            │
│  ──────────────────────────────────────────────────────    │
│                                                            │
│  For booking a talk:  [→ /speaking]                        │
│                                                            │
└────────────────────────────────────────────────────────────┘
```

### Speaker engagement landing (`/speaking`)

A dedicated, visually richer page for bookers thinking about whether to invite Rutger.

```
┌────────────────────────────────────────────────────────────┐
│  [Full-bleed stage photo with gradient-to-black overlay]   │
│                                                            │
│            RUTGER TUIT — SPEAKING & PANELS                 │
│                                                            │
│  ──────────────────────────────────────────────────────    │
│                                                            │
│  ## What I talk about                                      │
│  [5-6 topic blocks, each: title + 1 paragraph pitch +      │
│   1 representative quote from a past talk]                 │
│                                                            │
│  ## How I work                                             │
│  [Brief paragraph — keynote prep, panel style, willing-    │
│   to-travel notes, technical setup needs]                  │
│                                                            │
│  ## Recently                                               │
│  [Cards showing last 3-5 events with event photo, date,    │
│   outlet, one-line]                                        │
│                                                            │
│  ## Book me                                                │
│  [Inline contact form OR mailto link]                      │
└────────────────────────────────────────────────────────────┘
```

### Strengths
- Two audiences served differently — press (efficient) vs bookers (persuaded)
- Speaker landing earns the visual treatment of the rest of the site
- Easier to A/B different "what I talk about" framings without touching the press kit
- Bookers see Rutger's voice + style before they click the contact link

### Trade-offs
- Two pages to maintain instead of one
- Some press resources visible only on M1 (e.g. logo downloads) — bookers might miss them
- Slight risk of inconsistency between the two pages if not kept in sync

---

## Decision criteria for Gate 1

| Question | If yes → M1 | If yes → M2 |
|---|---|---|
| Are speaking engagements a primary objective of the site? | | ✅ |
| Is press kit traffic likely to outnumber booking inquiries 5:1? | ✅ | |
| Do you want the same page to serve press AND bookers? | ✅ | |
| Is there appetite to write/maintain a distinct booking pitch page? | | ✅ |
| Is the kit going to grow substantially over the year? | | ✅ |

---

## Implementation notes (apply to whichever option wins)

- Bios live in `registry.json` with `collection: "media-kit"` items
- Photos: all stored on CDN; the kit page renders thumbnails, downloads link to original-quality
- Logos: SVG primary, PNG fallback at 1x / 2x / 4x
- Print stylesheet: `@media print` rules in a dedicated `print.css` imported from globals
- Schema.org: `Person` entity on every page; on the kit + speaking pages, include `worksFor`, `jobTitle`, `image` array, `sameAs` (LinkedIn / X / GitHub)
- Contact: never a raw `mailto:` exposed in HTML (spam scraping). Use a `data-email` attribute decoded client-side, or a contact form

## Files to create when the option is picked

### M1
```
app/media-kit/page.tsx
components/media-kit/
  BiosSection.tsx + .css
  PhotosGrid.tsx + .css
  LogosGrid.tsx + .css
  TopicsList.tsx + .css
  EventsList.tsx + .css
  BookingBlock.tsx + .css
styles/print.css
```

### M2
```
app/media-kit/page.tsx                  (compact kit)
app/speaking/page.tsx                   (booker-facing)
components/media-kit/
  KitChecklist.tsx + .css
  BiosCompact.tsx + .css
  PhotosGrid.tsx + .css
  LogosGrid.tsx + .css
components/speaking/
  SpeakingHero.tsx + .css
  TopicBlock.tsx + .css
  HowIWork.tsx + .css
  RecentEvents.tsx + .css
  BookingForm.tsx + .css
styles/print.css
```
