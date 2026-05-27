#!/usr/bin/env python3
"""
Render Win95-style head-and-shoulders portraits for the two RTNL mini-games
via Google's Nano Banana image model (gemini-2.5-flash-image), through the
Gemini Developer API.

Covers two sets in one script:

    snoek  -- Snoek & Partners (boardroom roguelite) avatar PNGs.
              Overwrites the existing placeholders at:
                web/public/boardroom-game/avatar_<id>.png
              Source-of-truth descriptions: Boardroom_Game/src/data/employeeData.ts
              (mirrored inline below — this script is standalone).

    agent  -- Agent Inclusive Sim trait portraits. Mirrors TRAIT_DATABASE in
              web/app/technical/agent-game/cards.tsx. Output to:
                web/public/agent-game/portraits/<traitId>.png
              (new directory — created on first render).

Both sets share the same Win95 visual contract:

    * Microsoft Bob / Encarta '95 / Windows 95 wallpaper-crop aesthetic.
    * 24-bit-era pixel-art with dithered shadows and chunky bezels.
    * 1024x1024 square, head-and-shoulders framing, plain teal (#008080)
      or neutral 90s gray (#c0c0c0) background.
    * No text in the image (no labels, no captions).
    * One personality beat per prompt so portraits read as character-distinct.

Usage:
    cd web
    pip install -r scripts/requirements.txt

    # list every slug + target path:
    python scripts/generate-win95-portraits.py --list

    # render one slug (use the slug shown by --list):
    python scripts/generate-win95-portraits.py frits
    python scripts/generate-win95-portraits.py marie-furie

    # render one game's full set:
    python scripts/generate-win95-portraits.py --game snoek
    python scripts/generate-win95-portraits.py --game agent

    # render everything sequentially:
    python scripts/generate-win95-portraits.py --all

    # dry-run (prints prompts, no API calls, no cost):
    python scripts/generate-win95-portraits.py --all --dry-run

    # overwrite existing files (default: skip already-rendered):
    python scripts/generate-win95-portraits.py --all --force

Prerequisites:
    1. web/.env.local containing: GOOGLE_API_KEY=your-key-here
       (Same env var pattern as scripts/render-clip.py.)
    2. Key from https://aistudio.google.com/apikey

Each image is saved to disk the moment it completes -- a 5xx halfway through
a batch loses at most the in-flight render, not the ones already saved.

Image model:
    Primary: gemini-2.5-flash-image  (a.k.a. Nano Banana, the current
             Gemini Developer API image model). Override at the CLI with
             --model if Google renames it.
"""

import argparse
import os
import sys
import time
from dataclasses import dataclass
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
SNOEK_OUT_DIR = WEB_ROOT / "public" / "boardroom-game"
AGENT_OUT_DIR = WEB_ROOT / "public" / "agent-game" / "portraits"

DEFAULT_MODEL = "gemini-2.5-flash-image"
FALLBACK_MODEL = "imagen-3.0-generate-002"  # only if --model is overridden

RETRY_MAX = 4
RETRY_BASE_SLEEP_SECONDS = 6


# ===========================================================================
# Style prelude
#
# Prepended to every portrait prompt so the Win95 contract is consistent.
# Single source of truth for aesthetic — tune here, every portrait re-renders
# coherent.
# ===========================================================================

STYLE_PRELUDE = (
    "A 1990s Windows 95 era pixel-art portrait, in the visual lineage of "
    "Microsoft Bob character art, Encarta '95 contributor headshots, and "
    "early Windows wallpaper crops. 24-bit color era. Chunky shapes, "
    "dithered shadows, soft 90s consumer-software lighting, a faint CRT "
    "softness across the highlights. Head-and-shoulders framing, square "
    "composition, subject centered, eyes roughly at the upper third. "
    "Background is a flat plain field -- either Windows 95 teal #008080 "
    "or neutral 90s desktop gray #c0c0c0 -- no scenery, no props beyond "
    "what is described, no logos. Absolutely no text, no captions, no "
    "watermarks, no UI bezels or window chrome inside the image (the image "
    "is the portrait itself, the bezel is drawn around it by the site). "
    "1024x1024."
)


@dataclass(frozen=True)
class Portrait:
    """One renderable portrait."""

    game: str            # "snoek" | "agent"
    slug: str            # CLI-friendly slug (e.g. "frits", "marie-furie")
    output_filename: str # filename inside the per-game output dir
    subject_prompt: str  # the character-specific lines (style prelude prepended)
    description: str = ""

    @property
    def full_prompt(self) -> str:
        return f"{STYLE_PRELUDE}\n\n{self.subject_prompt}"

    def output_path(self) -> Path:
        if self.game == "snoek":
            return SNOEK_OUT_DIR / self.output_filename
        return AGENT_OUT_DIR / self.output_filename


# ===========================================================================
# Snoek & Partners cast
#
# Mirrors Boardroom_Game/src/data/employeeData.ts:
#   CORE_EMPLOYEES (frits, lodewijk, chantal, sjoerd) and
#   HIREABLE_ARCHETYPES (dino, perf_bro -> "perf", strategy_oracle -> "oracle",
#                        pr_fixer -> "fixer").
#
# The output filenames match the existing placeholder PNG names in
# web/public/boardroom-game/ so the React app needs zero code change.
# Personality beats are translated from the Dutch `desc` field.
# ===========================================================================

SNOEK_PORTRAITS: list[Portrait] = [
    Portrait(
        game="snoek",
        slug="frits",
        output_filename="avatar_frits.png",
        description="Frits the Nestor -- Creative Director, fragile legend of the cigarette-ad era",
        subject_prompt=(
            "Subject: Frits 'The Nestor', a Dutch Creative Director in his "
            "late 60s. Lived face, deep crow's-feet, a knowing weary smile. "
            "Salt-and-pepper hair, slightly unkempt; a trimmed grey beard. "
            "Wearing a worn dark linen blazer over a faded black t-shirt, "
            "open collar, a single silver pen clipped in the breast pocket. "
            "Personality beat: a legendary creative who lived through the "
            "glory days of Dutch cigarette advertising -- brilliant but "
            "fragile, like he might quote Mad Men in Dutch at any moment. "
            "Plain teal #008080 background."
        ),
    ),
    Portrait(
        game="snoek",
        slug="lodewijk",
        output_filename="avatar_lodewijk.png",
        description="Lodewijk -- Account Director, talks like Brugman, absorbs client complaints",
        subject_prompt=(
            "Subject: Lodewijk, a Dutch Account Director in his late 40s. "
            "Round friendly face, slightly flushed cheeks, a small double "
            "chin. Receding sandy-blond hair combed back. Navy blazer over "
            "a pale-blue dress shirt, no tie, top button undone. A faint "
            "smile suggesting he is mid-sentence reassuring an angry client. "
            "Personality beat: smooth talker who absorbs client unhappiness "
            "like a sponge and enjoys a liquid lunch. Plain neutral 90s "
            "desktop gray #c0c0c0 background."
        ),
    ),
    Portrait(
        game="snoek",
        slug="chantal",
        output_filename="avatar_chantal.png",
        description="Chantal -- Data Strategist, sees the world in spreadsheets, zero empathy",
        subject_prompt=(
            "Subject: Chantal, a Dutch Data Strategist in her early 30s. "
            "Sharp angular features, dark straight hair pulled into a tight "
            "low ponytail, thin silver-rimmed rectangular glasses. Neutral, "
            "almost cold expression -- the look of someone watching a "
            "dashboard tick. Charcoal turtleneck, no jewelry. Personality "
            "beat: she sees the world as spreadsheets and graphs, has zero "
            "patience for the Dutch consensus-meeting culture. Plain teal "
            "#008080 background."
        ),
    ),
    Portrait(
        game="snoek",
        slug="sjoerd",
        output_filename="avatar_sjoerd.png",
        description="Sjoerd -- the unpaid intern, infinite stamina, existential crisis incoming",
        subject_prompt=(
            "Subject: Sjoerd, a Dutch unpaid intern, early 20s. Lanky, very "
            "young-looking, slight stubble he is proud of, mop of curly "
            "light-brown hair. Wide hopeful eyes with the faintest hint of "
            "an oncoming existential crisis behind them. Wearing a thrifted "
            "second-hand sweater over a t-shirt, a cheap canvas tote strap "
            "barely visible at the shoulder. Personality beat: infinite "
            "stamina, infinite enthusiasm, one bad client meeting away from "
            "questioning everything. Plain neutral 90s desktop gray #c0c0c0 "
            "background."
        ),
    ),
    Portrait(
        game="snoek",
        slug="dino",
        output_filename="avatar_dino.png",
        description="Creative Dinosaur -- 30 years of the same concept, refuses to learn what a hashtag is",
        subject_prompt=(
            "Subject: the 'Creative Dinosaur', a Senior Art Director in his "
            "late 50s. Heavy-set, walrus moustache, thick black square "
            "horn-rimmed glasses. Wild grey hair, slightly tobacco-stained "
            "fingers visible at the bottom of the frame holding a stub of a "
            "pencil. Black turtleneck under a tweed jacket. Personality "
            "beat: has done the exact same advertising concept for 30 years "
            "and refuses to learn what a hashtag is. Expression: faintly "
            "annoyed, like someone just mentioned TikTok. Plain teal "
            "#008080 background."
        ),
    ),
    Portrait(
        game="snoek",
        slug="perf",
        output_filename="avatar_perf.png",
        description="Performance Bro -- speaks only in acronyms (ROAS, CTR, CPM), tanning-bed subscription",
        subject_prompt=(
            "Subject: the 'Performance Bro' growth hacker, late 20s. "
            "Aggressively tanned skin (tanning-bed orange), gel-spiked dark "
            "hair, gym-built shoulders, gleaming white teeth mid-smile. "
            "Tight black v-neck t-shirt, a chunky chrome watch peeking out. "
            "Wireless earbud just visible in one ear. Personality beat: "
            "speaks exclusively in acronyms -- ROAS, CTR, CPM, CPA -- and "
            "treats the tanning salon as a recurring meeting. Plain neutral "
            "90s desktop gray #c0c0c0 background."
        ),
    ),
    Portrait(
        game="snoek",
        slug="oracle",
        output_filename="avatar_oracle.png",
        description="Strategy Oracle -- complicated pie charts, quotes philosophers mid-pitch",
        subject_prompt=(
            "Subject: the 'Strategy Oracle', a Brand Strategist, ageless "
            "between 40 and 55. Shaved bald head, a small neat silver "
            "goatee, intense unblinking eyes. Wearing an unstructured dark "
            "linen suit jacket with no shirt collar, a single statement "
            "pendant on a leather cord at the throat. Personality beat: "
            "draws elaborate Venn diagrams nobody understands and quotes "
            "Heidegger during pitches. Expression: serenely certain. Plain "
            "teal #008080 background."
        ),
    ),
    Portrait(
        game="snoek",
        slug="fixer",
        output_filename="avatar_fixer.png",
        description="PR Fixer -- knows every Adformatie journalist, knows which scandal you can buy off",
        subject_prompt=(
            "Subject: the 'PR Fixer' crisis manager, a sharp Dutch woman in "
            "her late 40s. Platinum-blonde sharp bob haircut, expensive "
            "minimal makeup, a faintly amused half-smile that says she has "
            "heard worse. Crisp black blazer over a pale silk blouse, one "
            "discreet pearl earring. A phone held lightly at her shoulder "
            "as if just hanging up. Personality beat: knows every "
            "Adformatie journalist personally and knows exactly which "
            "scandal can be quietly bought off. Plain neutral 90s desktop "
            "gray #c0c0c0 background."
        ),
    ),
]


# ===========================================================================
# Agent Inclusive trait cast
#
# Mirrors TRAIT_DATABASE in web/app/technical/agent-game/cards.tsx.
# Slugs are kebab-case versions of displayName so the CLI is friendly; the
# output filename uses the trait `id` (rump/husk/zweistein/...) so the React
# app can do `<img src={`/agent-game/portraits/${traitId}.png`} />` directly.
#
# Each portrait is a clear satirical caricature of a real-world tech/political/
# pop-culture figure (Trump, Musk, Einstein/Dilbert, Thatcher, Taylor Swift,
# Marie Curie, Merkel), rendered in the Microsoft-Bob Win95 era style so they
# stay tonally coherent with Edgar / Lous / Jochem.
# ===========================================================================

AGENT_PORTRAITS: list[Portrait] = [
    Portrait(
        game="agent",
        slug="ronald-rump",
        output_filename="rump.png",
        description="Ronald Rump -- 'Trump Card' passive; wants to build a wall around the kantoortuin",
        subject_prompt=(
            "Subject: 'Ronald Rump', a clearly satirical Win95-era pixel-art "
            "caricature of a brash American real-estate executive turned "
            "corporate kingpin. Late 60s, heavy-set, distinctive bouffant "
            "of bright orange-blond hair swept across the head, prominent "
            "pursed mouth, slightly squinted small eyes, ruddy complexion. "
            "Navy suit, an overly long bright red tie, white shirt collar. "
            "Personality beat: tremendous energy, the best OKRs, wants to "
            "build a wall around the open office floorplan. Expression: "
            "self-satisfied, mid-boast. Plain teal #008080 background."
        ),
    ),
    Portrait(
        game="agent",
        slug="melon-husk",
        output_filename="husk.png",
        description="Melon Husk -- 'Chief Twit'; obsessed with homelab clusters, fires Jochem over email",
        subject_prompt=(
            "Subject: 'Melon Husk', a clearly satirical Win95-era pixel-art "
            "caricature of a billionaire tech CEO. Early 50s, thinning "
            "transplanted dark hair combed forward, slightly awkward "
            "vulnerable smile that does not reach the eyes. Pale skin, "
            "dark circles, faint stubble. Black t-shirt under a half-open "
            "black bomber jacket. Personality beat: obsessed with homelab "
            "GPU clusters, will fire an employee over email at 3am to save "
            "API tokens, runs entirely on inspiration and Adderall energy. "
            "Plain neutral 90s desktop gray #c0c0c0 background."
        ),
    ),
    Portrait(
        game="agent",
        slug="dilbert-zweistein",
        output_filename="zweistein.png",
        description="Dilbert Zweistein -- 'Patent Office'; thinks in 4D space-time, docs are projections",
        subject_prompt=(
            "Subject: 'Dilbert Zweistein', a clearly satirical Win95-era "
            "pixel-art caricature mashing up Einstein's iconic look with a "
            "modern cubicle-engineer vibe. Late 50s, wild explosion of "
            "white frizzy hair, prominent bushy white moustache, kind "
            "distracted eyes. White short-sleeved dress shirt with a "
            "comically large necktie that curls up at the tip (Dilbert "
            "style) and a plastic pocket protector full of pens. "
            "Personality beat: thinks in 4D space-time, considers standard "
            "documentation a mere 3D projection of underlying reality. "
            "Expression: gently amused at a thought no one else can hear. "
            "Plain teal #008080 background."
        ),
    ),
    Portrait(
        game="agent",
        slug="margaret-patcher",
        output_filename="patcher.png",
        description="Margaret Patcher -- 'Iron Lady'; firm hand, will privatize the coffee machine",
        subject_prompt=(
            "Subject: 'Margaret Patcher', a clearly satirical Win95-era "
            "pixel-art caricature of an iron-willed British prime-minister "
            "type re-cast as a ruthless tech operations chief. Early 60s, "
            "stiffly lacquered helmet of honey-blonde hair, pearl necklace, "
            "pearl earrings, sharp pale-blue power-suit jacket over a "
            "cream blouse with a soft bow at the neck. Cold steady eyes, a "
            "firm closed-mouth half-smile. Personality beat: thinks the "
            "open office is far too soft, would absolutely privatize the "
            "espresso machine if cashflow dipped. Plain neutral 90s desktop "
            "gray #c0c0c0 background."
        ),
    ),
    Portrait(
        game="agent",
        slug="taylor-shift",
        output_filename="shift.png",
        description="Taylor Shift -- 'Pop Era'; promotions boost team loyalty, redefines OKRs on tour",
        subject_prompt=(
            "Subject: 'Taylor Shift', a clearly satirical Win95-era "
            "pixel-art caricature of a pop-superstar-turned-corporate-icon. "
            "Mid-20s, long straight honey-blonde hair, sharp blunt-cut "
            "bangs, bright red lipstick, faintly winged eyeliner. "
            "Sequinned blazer over a simple white tank top, a single "
            "vintage microphone-shaped lapel pin. A warm crowd-pleasing "
            "smile. Personality beat: brings musical energy to every "
            "all-hands and is currently on her global 'OKR Redefinition "
            "Tour'. Plain teal #008080 background."
        ),
    ),
    Portrait(
        game="agent",
        slug="marie-furie",
        output_filename="furie.png",
        description="Marie Furie -- 'Radical Energy'; literally glowing, discovered compliance radium",
        subject_prompt=(
            "Subject: 'Marie Furie', a clearly satirical Win95-era pixel-art "
            "caricature of a turn-of-the-century radiochemist re-cast as a "
            "modern compliance researcher. Late 40s, dark hair pulled into "
            "a severe low bun, a few strands escaping. Pale skin with a "
            "faint inner greenish glow on the cheekbones (the joke: she is "
            "literally radioactive). Long-sleeved high-collared dark dress, "
            "small antique brooch at the throat. Holding a small glowing "
            "vial just visible at the bottom of the frame. Personality "
            "beat: discovered compliance radium isotopes hidden inside "
            "Edgar's PowerPoint decks. Plain neutral 90s desktop gray "
            "#c0c0c0 background."
        ),
    ),
    Portrait(
        game="agent",
        slug="angela-perkel",
        output_filename="perkel.png",
        description="Angela Perkel -- 'Mutti Rules'; quietly coordinates the European office, loves potato soup",
        subject_prompt=(
            "Subject: 'Angela Perkel', a clearly satirical Win95-era "
            "pixel-art caricature of a long-serving European head of state "
            "re-cast as the pragmatic chief of staff of the European "
            "office. Early 60s, short practical bob of blondish-grey hair, "
            "pale unfussy skin, an exceedingly calm steady gaze. Plain "
            "fuchsia-pink blazer over a black turtleneck (her signature). "
            "Hands not visible but implied to be in the iconic resting-"
            "diamond pose. Personality beat: quietly coordinates everything, "
            "loves clear documentation, prefers potato soup over the "
            "bitterballen everyone else orders. Expression: unflappable. "
            "Plain teal #008080 background."
        ),
    ),
]


ALL_PORTRAITS: list[Portrait] = SNOEK_PORTRAITS + AGENT_PORTRAITS


# ===========================================================================
# CLI helpers
# ===========================================================================

def find(slug: str) -> Portrait | None:
    for p in ALL_PORTRAITS:
        if p.slug == slug:
            return p
    return None


def list_portraits() -> int:
    print(f"All renderable portraits ({len(ALL_PORTRAITS)} total)")
    print()
    print("=== Snoek & Partners (boardroom-game) ===")
    for p in SNOEK_PORTRAITS:
        rel = p.output_path().relative_to(WEB_ROOT)
        print(f"  {p.slug:20s} -> {rel}")
        if p.description:
            print(f"  {'':20s}    {p.description}")
    print()
    print("=== Agent Inclusive Sim (agent-game) ===")
    for p in AGENT_PORTRAITS:
        rel = p.output_path().relative_to(WEB_ROOT)
        print(f"  {p.slug:20s} -> {rel}")
        if p.description:
            print(f"  {'':20s}    {p.description}")
    print()
    print("Render hints:")
    print("  python scripts/generate-win95-portraits.py <slug>")
    print("  python scripts/generate-win95-portraits.py --game snoek")
    print("  python scripts/generate-win95-portraits.py --game agent")
    print("  python scripts/generate-win95-portraits.py --all")
    print("  add --dry-run to preview prompts without calling the API")
    print("  add --force to overwrite already-rendered files")
    return 0


# ===========================================================================
# Rendering
# ===========================================================================

def _save_first_image(response, output_path: Path) -> bool:
    """Walk the SDK response, write the first inline image part to disk.

    Returns True if a file was written.
    """
    candidates = getattr(response, "candidates", None) or []
    for cand in candidates:
        content = getattr(cand, "content", None)
        if not content:
            continue
        parts = getattr(content, "parts", None) or []
        for part in parts:
            inline = getattr(part, "inline_data", None)
            if inline and getattr(inline, "data", None):
                output_path.parent.mkdir(parents=True, exist_ok=True)
                # Newer SDK: part.as_image() returns a PIL.Image-like wrapper.
                # Older SDK: inline.data is raw bytes. Try the friendly path
                # first and fall back to writing bytes directly.
                try:
                    img = part.as_image()
                    img.save(str(output_path))
                except (AttributeError, TypeError):
                    output_path.write_bytes(inline.data)
                return True
    return False


def render_one(
    portrait: Portrait,
    client: genai.Client | None,
    model: str,
    *,
    dry_run: bool,
    force: bool,
) -> str:
    """Render a single portrait. Returns one of: 'rendered', 'skipped', 'failed'."""
    output_path = portrait.output_path()
    rel = output_path.relative_to(WEB_ROOT)

    print(f"[{portrait.game}] {portrait.slug}")
    print(f"    target:  {rel}")
    if portrait.description:
        print(f"    note:    {portrait.description}")

    if output_path.exists() and not force and not dry_run:
        size_kb = output_path.stat().st_size // 1024
        print(f"    status:  skipped (exists, {size_kb} KB) -- use --force to overwrite")
        print()
        return "skipped"

    prompt = portrait.full_prompt
    print(f"    prompt:  {len(prompt)} chars, {len(prompt.split())} words")

    if dry_run:
        print("    --- prompt preview ---")
        for line in prompt.splitlines():
            print(f"    | {line}")
        print("    --- end prompt ---")
        print("    status:  dry-run (no API call)")
        print()
        return "skipped"

    assert client is not None, "client must be provided for non-dry-run"

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
                contents=prompt,
                config=config,
            )
            saved = _save_first_image(response, output_path)
            if not saved:
                # Surface prompt-feedback safety blocks distinctly when possible.
                feedback = getattr(response, "prompt_feedback", None)
                print(f"    ERROR:   response had no inline image (feedback={feedback})")
                last_error = RuntimeError("no inline image in response")
            else:
                size_kb = output_path.stat().st_size // 1024
                print(f"    status:  rendered ({size_kb} KB)")
                print()
                return "rendered"
        except Exception as exc:  # noqa: BLE001 -- want to retry on broad SDK errors
            last_error = exc
            msg = str(exc)
            # Retry on transient 5xx + 429 only; bail immediately on 4xx auth/quota.
            transient = any(token in msg for token in ("500", "502", "503", "504", "429", "RESOURCE_EXHAUSTED", "UNAVAILABLE", "DEADLINE_EXCEEDED"))
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


def render_set(
    portraits: list[Portrait],
    *,
    model: str,
    dry_run: bool,
    force: bool,
) -> int:
    client: genai.Client | None = None
    if not dry_run:
        load_dotenv(ENV_PATH)
        api_key = os.getenv("GOOGLE_API_KEY") or os.getenv("GEMINI_API_KEY")
        if not api_key:
            print(f"ERROR: GOOGLE_API_KEY not found in {ENV_PATH}")
            print("Create web/.env.local with: GOOGLE_API_KEY=your-key-here")
            print("Get a key at https://aistudio.google.com/apikey")
            return 1
        client = genai.Client(api_key=api_key)

    rendered = 0
    skipped = 0
    failed = 0

    for portrait in portraits:
        outcome = render_one(
            portrait,
            client,
            model,
            dry_run=dry_run,
            force=force,
        )
        if outcome == "rendered":
            rendered += 1
        elif outcome == "skipped":
            skipped += 1
        else:
            failed += 1

    print("=" * 60)
    print(f"Summary: {rendered} rendered, {skipped} skipped, {failed} failed")
    print("=" * 60)
    return 0 if failed == 0 else 1


# ===========================================================================
# Entry point
# ===========================================================================

def main() -> int:
    parser = argparse.ArgumentParser(
        description="Render Win95-style portraits for the RTNL mini-games via Nano Banana.",
    )
    parser.add_argument(
        "slug",
        nargs="?",
        help="Portrait slug to render (see --list for the full set).",
    )
    parser.add_argument(
        "--list",
        action="store_true",
        help="List every portrait slug and target path, then exit.",
    )
    parser.add_argument(
        "--all",
        action="store_true",
        help="Render every portrait sequentially.",
    )
    parser.add_argument(
        "--game",
        choices=["snoek", "agent"],
        help="Render only one game's set (snoek = boardroom-game, agent = agent-game).",
    )
    parser.add_argument(
        "--force",
        action="store_true",
        help="Overwrite existing files. Without this flag, existing files are skipped.",
    )
    parser.add_argument(
        "--dry-run",
        action="store_true",
        help="Print prompts and target paths without calling the API.",
    )
    parser.add_argument(
        "--model",
        default=DEFAULT_MODEL,
        help=(
            f"Image model name to use. Default: {DEFAULT_MODEL} (Nano Banana). "
            f"Fallback if that ever ships under another name: {FALLBACK_MODEL}."
        ),
    )
    args = parser.parse_args()

    if args.list:
        return list_portraits()

    if args.all:
        return render_set(
            ALL_PORTRAITS,
            model=args.model,
            dry_run=args.dry_run,
            force=args.force,
        )

    if args.game:
        subset = SNOEK_PORTRAITS if args.game == "snoek" else AGENT_PORTRAITS
        return render_set(
            subset,
            model=args.model,
            dry_run=args.dry_run,
            force=args.force,
        )

    if not args.slug:
        parser.print_help()
        print()
        return list_portraits()

    portrait = find(args.slug)
    if portrait is None:
        print(f"ERROR: unknown portrait slug '{args.slug}'.")
        print()
        return list_portraits()

    return render_set(
        [portrait],
        model=args.model,
        dry_run=args.dry_run,
        force=args.force,
    )


if __name__ == "__main__":
    try:
        sys.exit(main())
    except KeyboardInterrupt:
        print("\nAborted by user. Any portraits already saved are kept on disk.")
        sys.exit(130)
