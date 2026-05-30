#!/usr/bin/env python3
"""
Render the dark-editorial podcast portraits + per-episode group comps for
/podcasts via Google's Nano Banana (gemini-2.5-flash-image).

Two modes, one script:

    --sheets  Render the 7 character sheets (1:1) to
              web/drop/podcast-character-sheets/<slug>.png
              These are internal references that lock each character's
              look. They are not deployed; /drop/ is gitignored.

    --comps   Render the 8 per-episode group portraits (1:1) to
              web/public/podcasts/<slug>.png
              Each comp uses the relevant character sheet PNGs as multi-
              image inputs so the cast stays recognizably the same person
              episode-to-episode. These are deployed.

Visual register (locked 2026-05-30 by Rutger):

    Dark editorial painted portrait. Gradient near-black ground
    (#0a0a0c -> #1e1e22). Warm rim/key from above-left, cool fill from
    above-right. Ember orange accent (matches site CTA), deep teal cool
    hint. Textured paint strokes, not vector-flat. NYT op-ed / FX show
    poster vibe. Mic silhouettes faint in foreground for comps; sheets
    are tight shoulders-up with no mic.

Cast (7 characters, derived from podcasts-index.json + weekly-index.json):

    rutger   — host, illustrated for the first time (photographic
               portraits stay everywhere else on the site)
    maya     — defined here for the first time (multiplier-myth foil)
    frits    — carries his Win95-locked look into the painted register
    dino     — carries his Win95-locked look into the painted register
    oracle   — carries his Win95-locked look into the painted register
    marie    — radioactive-glow gag downplayed: cool-green rim light
               on cheekbones instead of full cartoon glow
    angela   — fuchsia blazer + black turtleneck stays; painted register

Episode comps (8):

    weekly-01                  rutger + oracle + frits
    multiplier-myth            rutger + maya
    thirty-minute-kitchen      rutger + frits
    agent-inclusive            rutger + angela
    creative-video-models      rutger + dino
    creative-interactivity     rutger + oracle + marie
    creative-character-sheet   rutger + dino + marie
    about-rutger               frits + dino + oracle + angela + marie

Usage:
    cd web
    pip install -r scripts/requirements.txt

    # see every slug + target:
    python scripts/generate-podcast-portraits.py --list

    # dry-run every sheet (prints prompts, no API call, no cost):
    python scripts/generate-podcast-portraits.py --sheets --dry-run

    # render all 7 sheets:
    python scripts/generate-podcast-portraits.py --sheets

    # render one sheet:
    python scripts/generate-podcast-portraits.py --sheets rutger

    # dry-run every comp (no API call):
    python scripts/generate-podcast-portraits.py --comps --dry-run

    # render all 8 comps (requires sheets to exist on disk):
    python scripts/generate-podcast-portraits.py --comps

    # render one comp:
    python scripts/generate-podcast-portraits.py --comps multiplier-myth

    # overwrite existing files (default: skip already-rendered):
    python scripts/generate-podcast-portraits.py --sheets --force

Prerequisites:
    web/.env.local with GOOGLE_API_KEY=your-key-here  (same as
    render-clip.py and generate-win95-portraits.py).

Each image is saved to disk the moment it completes -- a 5xx halfway
through a batch loses at most the in-flight render, not the ones
already saved.
"""

import argparse
import os
import sys
import time
from dataclasses import dataclass, field
from pathlib import Path

try:
    from dotenv import load_dotenv
except ImportError:
    print("ERROR: python-dotenv is missing.")
    print("Run: pip install -r scripts/requirements.txt")
    sys.exit(1)

try:
    from google import genai
    from google.genai import types
except ImportError:
    print("ERROR: google-genai is missing.")
    print("Run: pip install -r scripts/requirements.txt")
    sys.exit(1)


# ===========================================================================
# Paths + defaults
# ===========================================================================

ENV_PATH = Path(__file__).parent.parent / ".env.local"
WEB_ROOT = Path(__file__).parent.parent
SHEETS_OUT_DIR = WEB_ROOT / "drop" / "podcast-character-sheets"
COMPS_OUT_DIR = WEB_ROOT / "public" / "podcasts"

DEFAULT_MODEL = "gemini-2.5-flash-image"

RETRY_MAX = 4
RETRY_BASE_SLEEP_SECONDS = 6


# ===========================================================================
# Style prelude
#
# Single source of truth for the dark editorial painted register. Prepended
# to every sheet and every comp prompt so a tuning change here re-renders
# coherent across all 15 images.
# ===========================================================================

STYLE_PRELUDE = (
    "Style: a dark editorial painted portrait, in the visual lineage of "
    "New York Times op-ed illustration and FX/HBO prestige-show poster "
    "art. Painterly, textured brushstrokes visible -- not vector-flat, "
    "not photographic, not CGI. Lighting: a warm tungsten key from "
    "above-left and a cool teal fill from above-right; faces emerge from "
    "a near-black gradient ground (deep charcoal #0a0a0c fading to soft "
    "graphite #1e1e22). Accent colour: a single ember orange highlight "
    "where it can land naturally (a fabric edge, a reflection, the rim "
    "of a microphone) -- matching the site's CTA orange. Cool accent: a "
    "deep teal hint in the shadow side. Composition: square 1:1, "
    "subjects centered, eyes roughly at the upper third. Absolutely no "
    "text, no captions, no watermarks, no logos inside the image. No UI "
    "bezels or window chrome (the bezel is drawn around it by the site). "
    "1024x1024."
)

SHEET_FRAMING = (
    "Framing for a character sheet: single subject, tight shoulders-up, "
    "plain dark gradient ground, no microphone, no scene props. The "
    "image will be used as an internal reference to lock this "
    "character's look across multiple later compositions, so render the "
    "face cleanly and read-ably."
)

COMP_FRAMING_TEMPLATE = (
    "Framing for a {n}-subject group portrait podcast composition: the "
    "cast arranged in a row, tight shoulders-up, slight overlap between "
    "subjects allowed for intimacy. A single broadcast microphone "
    "silhouette is faintly visible in the lower foreground (out of "
    "focus, suggested not rendered in detail). Each subject must read "
    "as a recognisable continuation of their reference portrait -- "
    "preserve face structure, hair, signature wardrobe, and any "
    "lighting-driven character cue (Marie's cool-green rim light on the "
    "cheekbones, Angela's fuchsia blazer, Frits's silver-pen pocket, "
    "Oracle's pendant on a leather cord, Dino's horn-rimmed glasses + "
    "moustache, Rutger's completely shaved bald head and clean-shaven "
    "face with NO glasses and NO beard). Cast names in this scene, "
    "left to right: {cast_order}."
)


# ===========================================================================
# Characters (the 7 sheets)
#
# Each Character.subject_prompt is the body that follows STYLE_PRELUDE +
# SHEET_FRAMING in the final prompt. Keep these tight -- the prelude does
# the visual contract, the body does the persona.
# ===========================================================================

@dataclass(frozen=True)
class Character:
    slug: str
    display_name: str
    subject_prompt: str
    description: str = ""
    # Optional path (relative to WEB_ROOT) of a reference photo to pass as
    # an image input alongside the text prompt. Used for Rutger so the
    # painted sheet locks to the actual photographic likeness from the
    # media-kit portraits, not the model's invented Dutch-tech-creative
    # default.
    ref_image_path: str | None = None

    def sheet_path(self) -> Path:
        return SHEETS_OUT_DIR / f"{self.slug}.png"

    def sheet_prompt(self) -> str:
        return f"{STYLE_PRELUDE}\n\n{SHEET_FRAMING}\n\n{self.subject_prompt}"

    def ref_image_abs_path(self) -> Path | None:
        if self.ref_image_path is None:
            return None
        return WEB_ROOT / self.ref_image_path


CHARACTERS: list[Character] = [
    Character(
        slug="rutger",
        display_name="Rutger Tuit",
        description="Host. Dutch tech-creative leader, persona-over-title.",
        subject_prompt=(
            "Subject: 'Rutger', a Dutch tech-creative podcast host in "
            "his early 40s. Completely shaved bald head -- no hair, not "
            "even a fringe. Clean-shaven, no beard, no moustache, no "
            "stubble. Warm olive-tan skin. Strong brow and a calm "
            "intelligent gaze, the composed posture of someone "
            "listening more than performing. No glasses. Wearing a "
            "dark indigo denim overshirt with two visible breast "
            "pockets, layered over a plain black t-shirt -- match "
            "these garments precisely. No logos. Personality beat: "
            "the trusted translator between creative soul and tech "
            "executive -- musician's listening posture, executive's "
            "stillness."
        ),
    ),
    Character(
        slug="maya",
        display_name="Maya",
        description="Multiplier-Myth foil. Senior strategist, sceptical pragmatist.",
        subject_prompt=(
            "Subject: Maya, a Dutch senior strategist in her mid-30s. "
            "Long dark-brown hair pulled into a low loose tie at the "
            "nape, a few strands framing the face. Warm olive skin, "
            "minimal makeup, a small gold stud in one ear, no other "
            "jewelry. Sharp attentive eyes, a slight tilt of the head -- "
            "the posture of someone listening hard while already drafting "
            "the counter-argument. Wearing a dark forest-green fine-knit "
            "turtleneck under an unstructured charcoal blazer, no logos. "
            "Personality beat: the rigour foil -- stress-tests every "
            "claim about AI-as-multiplier, polite but unbluffable. Read "
            "as deliberately distinct from any of the other women on the "
            "site (not data-strategist Chantal, not Angela Perkel, not "
            "Marie Furie)."
        ),
    ),
    Character(
        slug="frits",
        display_name="Frits the Nestor",
        description="Carried from the Snoek boardroom Win95 portrait into the painted register.",
        subject_prompt=(
            "Subject: Frits 'The Nestor', a Dutch Creative Director in "
            "his late 60s. Lived face, deep crow's-feet, a knowing weary "
            "half-smile. Salt-and-pepper hair, slightly unkempt; a "
            "trimmed grey beard. Wearing a worn dark linen blazer over a "
            "faded black t-shirt, open collar, a single silver pen "
            "clipped in the breast pocket -- the silver-pen detail is a "
            "signature, keep it visible. Personality beat: a legendary "
            "creative who lived through the glory days of Dutch "
            "cigarette advertising -- brilliant but fragile, like he "
            "might quote Mad Men in Dutch at any moment. He is the same "
            "character that appears as the Win95 pixel-art portrait in "
            "the boardroom game -- preserve face structure and signature "
            "wardrobe but render in the dark editorial painted register."
        ),
    ),
    Character(
        slug="dino",
        display_name="Dino, the Creative Dinosaur",
        description="Carried from the Snoek boardroom Win95 portrait into the painted register.",
        subject_prompt=(
            "Subject: the 'Creative Dinosaur', a Senior Art Director in "
            "his late 50s. Heavy-set, generous walrus moustache, thick "
            "black square horn-rimmed glasses -- the glasses are a "
            "signature, keep them prominent. Wild grey hair, faintly "
            "tobacco-stained fingertips just visible at the bottom of "
            "the frame holding the stub of a pencil. Black turtleneck "
            "under a tweed jacket. Personality beat: has done the exact "
            "same advertising concept for 30 years and refuses to learn "
            "what a hashtag is. Expression: faintly annoyed, like "
            "someone just mentioned TikTok. He is the same character "
            "that appears as the Win95 pixel-art portrait in the "
            "boardroom game -- preserve face structure and signature "
            "wardrobe but render in the dark editorial painted register."
        ),
    ),
    Character(
        slug="oracle",
        display_name="Strategy Oracle",
        description="Carried from the Snoek boardroom Win95 portrait into the painted register.",
        subject_prompt=(
            "Subject: the 'Strategy Oracle', a Brand Strategist, "
            "ageless between 40 and 55. Shaved bald head, a small neat "
            "silver goatee, intense unblinking eyes. Wearing an "
            "unstructured dark linen suit jacket with no shirt collar -- "
            "a single statement pendant on a leather cord at the throat "
            "(the pendant is a signature, keep it visible). Personality "
            "beat: draws elaborate Venn diagrams nobody understands and "
            "quotes Heidegger during pitches. Expression: serenely "
            "certain. He is the same character that appears as the "
            "Win95 pixel-art portrait in the boardroom game -- preserve "
            "face structure and signature wardrobe but render in the "
            "dark editorial painted register."
        ),
    ),
    Character(
        slug="marie",
        display_name="Marie Furie",
        description="From the Agent-Inclusive sim. Radioactive gag downplayed to a cool-green rim light.",
        subject_prompt=(
            "Subject: 'Marie Furie', a compliance researcher in her late "
            "40s. Dark hair pulled into a severe low bun, a few strands "
            "escaping at the temples. Pale skin, with a subtle cool-green "
            "rim light catching the cheekbones (the in-universe gag is "
            "that she is faintly radioactive -- in this register render "
            "that as a discreet greenish cool-light accent on the skin, "
            "NOT as a cartoon glow). Long-sleeved high-collared dark "
            "dress, a small antique brooch at the throat. No glowing "
            "vials in this register -- the radioactivity reads only "
            "through the lighting. Expression: precise, definitionally "
            "honest, mid-correction. She is the same character that "
            "appears as the Win95 pixel-art portrait in the agent-game "
            "-- preserve face structure but render in the dark editorial "
            "painted register."
        ),
    ),
    Character(
        slug="angela",
        display_name="Angela Perkel",
        description="From the Agent-Inclusive sim. Fuchsia blazer + black turtleneck stays as her signature.",
        subject_prompt=(
            "Subject: 'Angela Perkel', the calm pragmatic chief of staff "
            "of a European office, early 60s. Short practical bob of "
            "blondish-grey hair, pale unfussy skin, an exceedingly calm "
            "steady gaze. Wearing a plain fuchsia-pink blazer over a "
            "black turtleneck (her signature -- keep both the fuchsia "
            "blazer and the black turtleneck visible). Expression: "
            "unflappable, faintly amused. Personality beat: quietly "
            "coordinates everything, loves clear documentation. She is "
            "the same character that appears as the Win95 pixel-art "
            "portrait in the agent-game -- preserve face structure and "
            "the fuchsia/black wardrobe but render in the dark editorial "
            "painted register."
        ),
    ),
]


def find_character(slug: str) -> Character | None:
    for c in CHARACTERS:
        if c.slug == slug:
            return c
    return None


# ===========================================================================
# Episode comps (the 8 group portraits)
#
# Each EpisodeComp.scene_prompt is the body that follows STYLE_PRELUDE +
# COMP_FRAMING(n, cast_order) in the final prompt. The cast list maps
# directly to character slugs.
# ===========================================================================

@dataclass(frozen=True)
class EpisodeComp:
    slug: str
    cast_slugs: list[str]
    scene_prompt: str
    description: str = ""

    def comp_path(self) -> Path:
        return COMPS_OUT_DIR / f"{self.slug}.png"

    def cast_display(self) -> str:
        names = []
        for s in self.cast_slugs:
            c = find_character(s)
            names.append(c.display_name if c else s)
        return ", ".join(names)

    def comp_prompt(self) -> str:
        framing = COMP_FRAMING_TEMPLATE.format(
            n=len(self.cast_slugs),
            cast_order=self.cast_display(),
        )
        return f"{STYLE_PRELUDE}\n\n{framing}\n\n{self.scene_prompt}"


EPISODE_COMPS: list[EpisodeComp] = [
    EpisodeComp(
        slug="weekly-01",
        cast_slugs=["rutger", "oracle", "frits"],
        description="The agentic ad stack lands. Rutger walks Oracle and Frits through GML 2026.",
        scene_prompt=(
            "Scene: Rutger in the centre, mid-sentence, gesturing "
            "lightly with one hand. Oracle to his right, listening with "
            "the serenely certain stillness of someone already three "
            "moves ahead. Frits to Rutger's left, leaning back slightly, "
            "the weary half-smile of a Mad Men veteran watching a new "
            "ad-tech wave arrive. The mood is professional but warm -- "
            "three people in agreement that something has shifted in "
            "the industry this week."
        ),
    ),
    EpisodeComp(
        slug="multiplier-myth",
        cast_slugs=["rutger", "maya"],
        description="Rutger and Maya stress-test the multiplier-myth argument.",
        scene_prompt=(
            "Scene: two-shot. Rutger on the left, mid-sentence, leaning "
            "slightly forward. Maya on the right, head tilted slightly, "
            "the listening-while-drafting-the-counter-argument posture. "
            "Mood: respectful, sharp, the friction of a rigour-foil "
            "conversation -- neither of them is performing for the room."
        ),
    ),
    EpisodeComp(
        slug="thirty-minute-kitchen",
        cast_slugs=["rutger", "frits"],
        description="Rutger walks Frits through the thirty-minute-kitchen argument.",
        scene_prompt=(
            "Scene: two-shot. Frits on the left, leaning back, the "
            "weary half-smile of someone about to push back on the "
            "title before agreeing with the article. Rutger on the "
            "right, leaning slightly forward, calm and patient. Mood: "
            "the kitchen-prep-line metaphor mid-air between them."
        ),
    ),
    EpisodeComp(
        slug="agent-inclusive",
        cast_slugs=["rutger", "angela"],
        description="Rutger and Angela on what 'agent inclusive' means in a real org.",
        scene_prompt=(
            "Scene: two-shot. Angela on the left, unflappable, the "
            "steady gaze of a chief of staff. Her fuchsia blazer is the "
            "only saturated colour in the composition. Rutger on the "
            "right, looking slightly off-camera, the listening posture "
            "of someone taking the point seriously. Mood: procedural "
            "and calm -- the opposite of techno-utopian breathlessness."
        ),
    ),
    EpisodeComp(
        slug="creative-video-models",
        cast_slugs=["rutger", "dino"],
        description="Rutger and Dino on the four-lineage video-models frame.",
        scene_prompt=(
            "Scene: two-shot. Dino on the left, arms folded just "
            "visible at the bottom of the frame, faintly annoyed -- the "
            "Senior Art Director's posture when someone mentions "
            "generative video. Rutger on the right, mid-sentence, "
            "patient. Mood: reluctant acknowledgement -- Dino is going "
            "to agree with the article, eventually."
        ),
    ),
    EpisodeComp(
        slug="creative-interactivity",
        cast_slugs=["rutger", "oracle", "marie"],
        description="Oracle defends slides, Marie keeps everyone honest, Rutger lands the argument.",
        scene_prompt=(
            "Scene: Rutger in the centre. Oracle to one side, mid-pitch "
            "with the serenely-certain stillness, clearly defending the "
            "frozen slide as a rhetorical device. Marie to the other "
            "side, the cool-green rim-light catching her cheekbones, "
            "her expression precise and mid-correction. Mood: a panel "
            "in lively disagreement, no winner yet."
        ),
    ),
    EpisodeComp(
        slug="creative-character-sheet",
        cast_slugs=["rutger", "dino", "marie"],
        description="Three-shot tutorial panel: Dino objects, Marie corrects, Rutger walks the method.",
        scene_prompt=(
            "Scene: Rutger in the centre, mid-explanation. Dino on one "
            "side, faintly annoyed, horn-rimmed glasses catching the "
            "warm key light. Marie on the other side, precise and "
            "definitionally honest, cool-green rim-light on the "
            "cheekbones. Mood: a tutorial panel that became a "
            "three-way argument -- in a good way."
        ),
    ),
    EpisodeComp(
        slug="about-rutger",
        cast_slugs=["frits", "dino", "oracle", "angela", "marie"],
        description="Five-shot panel WITHOUT Rutger -- the host is deliberately absent.",
        scene_prompt=(
            "Scene: five-subject group portrait. Rutger is deliberately "
            "absent from this composition -- this is the panel without "
            "the host. The cast is looking slightly off-camera, as if "
            "reviewing a folder of material laid on the table just out "
            "of frame. Frits, Dino, Oracle, Angela, and Marie arranged "
            "in a row with slight overlap. Mood: the off-the-record "
            "feeling of five invented characters going through the "
            "file on the man who prompted them into existence."
        ),
    ),
]


def find_comp(slug: str) -> EpisodeComp | None:
    for c in EPISODE_COMPS:
        if c.slug == slug:
            return c
    return None


# ===========================================================================
# Listing
# ===========================================================================

def list_all() -> int:
    print(f"Podcast portraits — {len(CHARACTERS)} sheets, {len(EPISODE_COMPS)} comps.")
    print()
    print("=== Character sheets (--sheets) ===")
    for c in CHARACTERS:
        rel = c.sheet_path().relative_to(WEB_ROOT)
        print(f"  {c.slug:10s} -> {rel}")
        if c.description:
            print(f"  {'':10s}    {c.description}")
    print()
    print("=== Episode comps (--comps) ===")
    for ep in EPISODE_COMPS:
        rel = ep.comp_path().relative_to(WEB_ROOT)
        cast = ", ".join(ep.cast_slugs)
        print(f"  {ep.slug:28s} -> {rel}")
        print(f"  {'':28s}    cast: {cast}")
        if ep.description:
            print(f"  {'':28s}    {ep.description}")
    print()
    print("Render hints:")
    print("  python scripts/generate-podcast-portraits.py --sheets --dry-run")
    print("  python scripts/generate-podcast-portraits.py --sheets")
    print("  python scripts/generate-podcast-portraits.py --sheets rutger")
    print("  python scripts/generate-podcast-portraits.py --comps --dry-run")
    print("  python scripts/generate-podcast-portraits.py --comps")
    print("  python scripts/generate-podcast-portraits.py --comps multiplier-myth")
    print("  add --force to overwrite already-rendered files")
    return 0


# ===========================================================================
# Rendering
# ===========================================================================

def _save_first_image(response, output_path: Path) -> tuple[bool, str]:
    """Walk the SDK response, write the first inline image part to disk.

    Returns (saved, debug_info). debug_info captures finish_reason / any
    text returned by the model / safety ratings, surfaced when the model
    returned IMAGE_OTHER or a text-only response instead of an image.
    """
    candidates = getattr(response, "candidates", None) or []
    debug_bits: list[str] = []
    for cand in candidates:
        finish = getattr(cand, "finish_reason", None)
        if finish is not None:
            debug_bits.append(f"finish={finish}")
        sr = getattr(cand, "safety_ratings", None)
        if sr:
            blocked = [str(r) for r in sr if getattr(r, "blocked", False)]
            if blocked:
                debug_bits.append(f"safety_blocked={blocked[:2]}")
        content = getattr(cand, "content", None)
        if not content:
            continue
        parts = getattr(content, "parts", None) or []
        for part in parts:
            inline = getattr(part, "inline_data", None)
            if inline and getattr(inline, "data", None):
                output_path.parent.mkdir(parents=True, exist_ok=True)
                try:
                    img = part.as_image()
                    img.save(str(output_path))
                except (AttributeError, TypeError):
                    output_path.write_bytes(inline.data)
                return True, ""
            text = getattr(part, "text", None)
            if text:
                snippet = text.strip().replace("\n", " ")[:200]
                debug_bits.append(f'text_response="{snippet}"')
    return False, " ".join(debug_bits) or "no candidates / no parts"


def _render_with_retries(
    contents,
    output_path: Path,
    *,
    client: genai.Client,
    model: str,
    label: str,
) -> str:
    """Shared retry loop. Returns 'rendered' / 'failed'."""
    config = types.GenerateContentConfig(
        response_modalities=["IMAGE"],
        candidate_count=1,
    )

    last_error: Exception | None = None
    for attempt in range(1, RETRY_MAX + 1):
        try:
            print(f"    attempt: {attempt}/{RETRY_MAX} -- calling {model}")
            response = client.models.generate_content(
                model=model,
                contents=contents,
                config=config,
            )
            saved, debug = _save_first_image(response, output_path)
            if not saved:
                feedback = getattr(response, "prompt_feedback", None)
                print(f"    ERROR:   response had no inline image ({label})")
                print(f"             feedback={feedback}")
                print(f"             debug={debug}")
                last_error = RuntimeError(f"no inline image in response ({debug})")
            else:
                size_kb = output_path.stat().st_size // 1024
                print(f"    status:  rendered ({size_kb} KB)")
                print()
                return "rendered"
        except Exception as exc:  # noqa: BLE001
            last_error = exc
            msg = str(exc)
            transient = any(token in msg for token in (
                "500", "502", "503", "504", "429",
                "RESOURCE_EXHAUSTED", "UNAVAILABLE", "DEADLINE_EXCEEDED",
            ))
            print(f"    ERROR:   {exc.__class__.__name__}: {msg[:240]}")
            if not transient:
                print("    status:  failed (non-retryable)")
                print()
                return "failed"

        if attempt < RETRY_MAX:
            sleep_for = RETRY_BASE_SLEEP_SECONDS * (2 ** (attempt - 1))
            print(f"    retry:   sleeping {sleep_for}s before next attempt")
            time.sleep(sleep_for)

    print(f"    status:  failed after {RETRY_MAX} attempts (last error: {last_error})")
    print()
    return "failed"


def render_sheet(
    character: Character,
    client: genai.Client | None,
    model: str,
    *,
    dry_run: bool,
    force: bool,
) -> str:
    output_path = character.sheet_path()
    rel = output_path.relative_to(WEB_ROOT)

    print(f"[sheet] {character.slug}  ({character.display_name})")
    print(f"    target:  {rel}")
    if character.description:
        print(f"    note:    {character.description}")

    if output_path.exists() and not force and not dry_run:
        size_kb = output_path.stat().st_size // 1024
        print(f"    status:  skipped (exists, {size_kb} KB) -- use --force to overwrite")
        print()
        return "skipped"

    prompt = character.sheet_prompt()
    print(f"    prompt:  {len(prompt)} chars, {len(prompt.split())} words")

    ref_abs = character.ref_image_abs_path()
    if ref_abs is not None:
        if not ref_abs.exists():
            print(f"    ERROR:   ref_image_path set but file missing: {ref_abs}")
            print()
            return "failed"
        print(f"    ref:     {ref_abs.relative_to(WEB_ROOT)} (likeness lock)")

    if dry_run:
        print("    --- prompt preview ---")
        for line in prompt.splitlines():
            print(f"    | {line}")
        print("    --- end prompt ---")
        if ref_abs is not None:
            print(f"    --- ref image ---")
            print(f"    | {ref_abs.relative_to(WEB_ROOT)}")
            print(f"    --- end ref ---")
        print("    status:  dry-run (no API call)")
        print()
        return "skipped"

    assert client is not None

    # If the character has a reference photo, pass it as image input so the
    # painted sheet locks to the actual likeness. Otherwise plain text prompt.
    if ref_abs is not None:
        contents = [
            f"Reference photograph for character '{character.slug}' "
            f"({character.display_name}) -- preserve face structure, "
            f"head shape, and wardrobe from this image:",
            types.Part.from_bytes(
                data=ref_abs.read_bytes(),
                mime_type="image/png",
            ),
            prompt,
        ]
    else:
        contents = prompt

    return _render_with_retries(
        contents,
        output_path,
        client=client,
        model=model,
        label=f"sheet/{character.slug}",
    )


def render_comp(
    comp: EpisodeComp,
    client: genai.Client | None,
    model: str,
    *,
    dry_run: bool,
    force: bool,
) -> str:
    output_path = comp.comp_path()
    rel = output_path.relative_to(WEB_ROOT)

    print(f"[comp]  {comp.slug}")
    print(f"    target:  {rel}")
    print(f"    cast:    {', '.join(comp.cast_slugs)}")
    if comp.description:
        print(f"    note:    {comp.description}")

    if output_path.exists() and not force and not dry_run:
        size_kb = output_path.stat().st_size // 1024
        print(f"    status:  skipped (exists, {size_kb} KB) -- use --force to overwrite")
        print()
        return "skipped"

    # Verify every required sheet is on disk before we spend API budget.
    missing: list[str] = []
    sheet_paths: list[Path] = []
    for slug in comp.cast_slugs:
        c = find_character(slug)
        if c is None:
            missing.append(f"{slug} (no Character defined)")
            continue
        sp = c.sheet_path()
        if not sp.exists():
            missing.append(f"{slug} (no sheet at {sp.relative_to(WEB_ROOT)})")
        else:
            sheet_paths.append(sp)
    if missing and not dry_run:
        print(f"    ERROR:   cannot render comp -- missing sheets:")
        for m in missing:
            print(f"             - {m}")
        print(f"    hint:    run --sheets first to produce the missing references")
        print()
        return "failed"

    prompt_text = comp.comp_prompt()
    print(f"    prompt:  {len(prompt_text)} chars, {len(prompt_text.split())} words")
    print(f"    refs:    {len(sheet_paths)} sheet PNGs")

    if dry_run:
        print("    --- prompt preview ---")
        for line in prompt_text.splitlines():
            print(f"    | {line}")
        print("    --- end prompt ---")
        if sheet_paths:
            print("    --- ref sheets ---")
            for p in sheet_paths:
                print(f"    | {p.relative_to(WEB_ROOT)}")
            print("    --- end refs ---")
        else:
            print("    (no ref sheets on disk yet -- will be required at render time)")
        print("    status:  dry-run (no API call)")
        print()
        return "skipped"

    assert client is not None

    # Build a multi-part contents list. Order: each reference labelled by
    # the character slug, followed by the scene prompt. Nano Banana reads
    # image inputs as visual references for the generation.
    contents: list = []
    for slug, sp in zip(comp.cast_slugs, sheet_paths):
        contents.append(f"Reference portrait for character '{slug}':")
        contents.append(
            types.Part.from_bytes(
                data=sp.read_bytes(),
                mime_type="image/png",
            )
        )
    contents.append(prompt_text)

    return _render_with_retries(
        contents,
        output_path,
        client=client,
        model=model,
        label=f"comp/{comp.slug}",
    )


def render_sheets(
    items: list[Character],
    *,
    model: str,
    dry_run: bool,
    force: bool,
) -> int:
    client = _client_or_none(dry_run)
    if client is None and not dry_run:
        return 1

    rendered = skipped = failed = 0
    for c in items:
        outcome = render_sheet(c, client, model, dry_run=dry_run, force=force)
        if outcome == "rendered":
            rendered += 1
        elif outcome == "skipped":
            skipped += 1
        else:
            failed += 1

    print("=" * 60)
    print(f"Sheets: {rendered} rendered, {skipped} skipped, {failed} failed")
    print("=" * 60)
    return 0 if failed == 0 else 1


def render_comps(
    items: list[EpisodeComp],
    *,
    model: str,
    dry_run: bool,
    force: bool,
) -> int:
    client = _client_or_none(dry_run)
    if client is None and not dry_run:
        return 1

    rendered = skipped = failed = 0
    for ep in items:
        outcome = render_comp(ep, client, model, dry_run=dry_run, force=force)
        if outcome == "rendered":
            rendered += 1
        elif outcome == "skipped":
            skipped += 1
        else:
            failed += 1

    print("=" * 60)
    print(f"Comps: {rendered} rendered, {skipped} skipped, {failed} failed")
    print("=" * 60)
    return 0 if failed == 0 else 1


def _client_or_none(dry_run: bool) -> genai.Client | None:
    if dry_run:
        return None
    load_dotenv(ENV_PATH)
    api_key = os.getenv("GOOGLE_API_KEY") or os.getenv("GEMINI_API_KEY")
    if not api_key:
        print(f"ERROR: GOOGLE_API_KEY not found in {ENV_PATH}")
        print("Create web/.env.local with: GOOGLE_API_KEY=your-key-here")
        print("Get a key at https://aistudio.google.com/apikey")
        return None
    return genai.Client(api_key=api_key)


# ===========================================================================
# Entry point
# ===========================================================================

def main() -> int:
    parser = argparse.ArgumentParser(
        description=(
            "Render dark-editorial podcast character sheets and per-episode "
            "group comps via Nano Banana."
        ),
    )
    mode = parser.add_mutually_exclusive_group()
    mode.add_argument(
        "--sheets",
        action="store_true",
        help="Render character sheet(s) to web/drop/podcast-character-sheets/.",
    )
    mode.add_argument(
        "--comps",
        action="store_true",
        help="Render per-episode group comp(s) to web/public/podcasts/.",
    )
    parser.add_argument(
        "slug",
        nargs="?",
        help=(
            "Optional single slug to render. With --sheets, a character slug "
            "(see --list). With --comps, an episode slug (see --list). "
            "Without a slug + a mode flag, renders every item in that mode."
        ),
    )
    parser.add_argument(
        "--list",
        action="store_true",
        help="List every character + episode slug and target path, then exit.",
    )
    parser.add_argument(
        "--force",
        action="store_true",
        help="Overwrite existing files. Default: skip already-rendered.",
    )
    parser.add_argument(
        "--dry-run",
        action="store_true",
        help="Print prompts and target paths without calling the API.",
    )
    parser.add_argument(
        "--model",
        default=DEFAULT_MODEL,
        help=f"Image model name. Default: {DEFAULT_MODEL} (Nano Banana).",
    )
    args = parser.parse_args()

    if args.list:
        return list_all()

    if not (args.sheets or args.comps):
        parser.print_help()
        print()
        return list_all()

    if args.sheets:
        if args.slug:
            c = find_character(args.slug)
            if c is None:
                print(f"ERROR: unknown character slug '{args.slug}'.")
                print()
                return list_all()
            return render_sheets([c], model=args.model, dry_run=args.dry_run, force=args.force)
        return render_sheets(CHARACTERS, model=args.model, dry_run=args.dry_run, force=args.force)

    # comps
    if args.slug:
        ep = find_comp(args.slug)
        if ep is None:
            print(f"ERROR: unknown episode slug '{args.slug}'.")
            print()
            return list_all()
        return render_comps([ep], model=args.model, dry_run=args.dry_run, force=args.force)
    return render_comps(EPISODE_COMPS, model=args.model, dry_run=args.dry_run, force=args.force)


if __name__ == "__main__":
    try:
        sys.exit(main())
    except KeyboardInterrupt:
        print("\nAborted by user. Any images already saved are kept on disk.")
        sys.exit(130)
