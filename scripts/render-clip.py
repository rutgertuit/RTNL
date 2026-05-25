#!/usr/bin/env python3
"""
Render a Briefing Inversion clip via the Gemini Developer API.

Handles the two Veo-generation clips that need API rendering (the rest are
rendered manually via the Gemini app or Flow):

    veo2-moog-260w   Veo 2 baseline, silent, 260-word brief
    veo3-moog-140w   Veo 3 with native synced audio, 140-word brief

Usage:
    cd web
    pip install -r scripts/requirements.txt

    # Render one specific clip:
    python scripts/render-clip.py veo2-moog-260w
    python scripts/render-clip.py veo3-moog-140w

    # Or list available clip slugs:
    python scripts/render-clip.py --list

Output:
    web/public/assets/video/briefing-inversion/<slug>.mp4

The site's ClipPanel component auto-detects each file's presence and swaps
from the RENDER PENDING badge to the playable clip with no code change.

Prerequisites:
    1. Create web/.env.local with: GOOGLE_API_KEY=your-key-here
       (Already gitignored via .env.* entry. See .env.example.)
    2. Get the key from https://aistudio.google.com/apikey

The script polls the long-running operation, downloads the video, and saves
it to the expected path. A render usually takes 2-5 minutes per clip.

Other clips in the Briefing Inversion article (Veo 3.1, Omni initial,
Omni Turn 2, Section 3 jobs) are not in this script — Rutger renders those
via the Gemini app for the multi-turn + reference-image flow that suits the
UI better than the API. See drop/Model_Explainer/video-prompts.md for the
full prompt set.
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
# Clip definitions
#
# Prompts are the verbatim, voice-checked briefs from
# drop/Model_Explainer/video-prompts.md. The Briefing Inversion article
# displays each brief next to its rendered output — do not edit the prompt
# text. The point of Section 1 is the shrinking-word-count cascade
# (260 -> 140 -> 45 -> 14), so changing prompt length breaks the section.
#
# For Veo 2 (Stop 1) the brief explicitly asks for *no audio* — the rendered
# clip is silent on purpose. That period-correct constraint is part of what
# Section 1 is demonstrating.
# ===========================================================================


@dataclass(frozen=True)
class Clip:
    slug: str
    model: str
    prompt: str
    duration_seconds: int = 8
    aspect_ratio: str = "16:9"
    # personGeneration enum values differ per model. Veo 2 accepts "allow_adult"
    # and "dont_allow". Veo 3 rejects "allow_adult" — set this to None to omit
    # the parameter entirely (the SDK then sends the API's default).
    person_generation: str | None = "allow_adult"
    description: str = ""


CLIPS: dict[str, Clip] = {
    "veo2-moog-260w": Clip(
        slug="veo2-moog-260w",
        model="veo-2.0-generate-001",
        description="Veo 2 baseline — silent, 260-word brief, period-correct artifacts intentional",
        prompt="""A medium-shot, eye-level cinematic video. A bald man in his early forties — full beard, light stubble at the jawline, dark slate-grey hoodie under a heavier black overshirt — is seated at a vintage analog synthesizer in a converted Rotterdam warehouse studio. The synth is a Moog Voyager, brass keys, two-handed posture, his right hand on the keys at mid-keyboard, his left hand adjusting the cutoff knob in the upper-left corner of the panel.

Soft, even key light from camera-left at roughly 3200K. A cooler 4500K rim light from camera-right, separating him from the dark concrete wall behind. Visible dust particles in the shafts of light. Camera: 35mm lens, slight push-in at 5% over the eight-second duration. The subject is fully concentrated; he does not look at the camera. He plays three or four chords across the eight seconds. His hand on the cutoff knob moves once, slowly, mid-clip.

Frame the shot tight enough to read his face but wide enough to include the synth panel from edge to edge. Exposure values warmer in the midtones, deep blacks in the shadows. Style reference: cinematic film, 1080p, 24 fps, slight cinematic film grain. No text on screen.

No music in the generated audio — the synth itself should not be audible, this clip will be scored separately in post.""",
    ),
    "veo3-moog-140w": Clip(
        slug="veo3-moog-140w",
        model="veo-3.0-generate-001",
        description="Veo 3 — synced synth audio, 140-word brief, native audio is the architectural delta",
        # Veo 3 rejects "allow_adult" with 400 INVALID_ARGUMENT — omit the
        # parameter entirely so the SDK sends the API default.
        person_generation=None,
        prompt="""Cinematic medium-shot of a bald, bearded man at a vintage Moog synthesizer in a Rotterdam warehouse studio. He's playing a slow, contemplative four-chord progression — left hand sweeping the cutoff knob, right hand on the keys. Warm key light from the left, cooler rim light separating him from the concrete wall behind. Soft dust in the air. 35mm, slow 5% push-in over eight seconds. He is fully absorbed; doesn't look at the camera.

Audio: the actual synth notes the chord progression is producing — analog, mid-warm, slight resonance sweep on the cutoff. Light room tone in the background, no other music or speech.

1080p, 24fps, cinematic film stock feel.""",
    ),
}


# ===========================================================================
# Script
# ===========================================================================

ENV_PATH = Path(__file__).parent.parent / ".env.local"
OUTPUT_DIR = Path(__file__).parent.parent / "public" / "assets" / "video" / "briefing-inversion"
POLL_INTERVAL_SECONDS = 15


def list_clips() -> int:
    print("Available clip slugs:")
    print()
    for slug, clip in CLIPS.items():
        print(f"  {slug}")
        print(f"      model:   {clip.model}")
        print(f"      length:  {clip.duration_seconds}s @ {clip.aspect_ratio}")
        print(f"      brief:   {len(clip.prompt.split())} words")
        if clip.description:
            print(f"      note:    {clip.description}")
        print()
    return 0


def render(clip: Clip, api_key: str) -> int:
    output_path = OUTPUT_DIR / f"{clip.slug}.mp4"
    print(f"Slug:          {clip.slug}")
    print(f"Model:         {clip.model}")
    print(f"Brief:         {len(clip.prompt)} chars, {len(clip.prompt.split())} words")
    print(f"Output:        {output_path}")
    if clip.description:
        print(f"Note:          {clip.description}")
    print()
    if output_path.exists():
        size_kb = output_path.stat().st_size // 1024
        print(f"WARNING: {output_path.name} already exists ({size_kb} KB).")
        confirm = input("Re-render and overwrite? [y/N] ").strip().lower()
        if confirm != "y":
            print("Aborted.")
            return 0

    print("Starting render — this typically takes 2-5 minutes.")
    print("Press Ctrl-C to abort (the GCP-side render will continue regardless).")
    print()

    client = genai.Client(api_key=api_key)

    # Build the config conditionally — person_generation has different enum
    # values per model, and Veo 3 rejects Veo 2's "allow_adult". When the
    # Clip sets person_generation=None we omit the field entirely.
    config_kwargs: dict[str, object] = {
        "aspect_ratio": clip.aspect_ratio,
        "number_of_videos": 1,
        "duration_seconds": clip.duration_seconds,
    }
    if clip.person_generation is not None:
        config_kwargs["person_generation"] = clip.person_generation

    operation = client.models.generate_videos(
        model=clip.model,
        prompt=clip.prompt,
        config=types.GenerateVideosConfig(**config_kwargs),
    )

    started = time.time()
    while not operation.done:
        elapsed = int(time.time() - started)
        mins, secs = divmod(elapsed, 60)
        print(f"  [{mins:02d}:{secs:02d}] still rendering...")
        time.sleep(POLL_INTERVAL_SECONDS)
        operation = client.operations.get(operation)

    if getattr(operation, "error", None):
        print(f"\nERROR from Veo: {operation.error}")
        return 1

    response = operation.response
    if not response or not getattr(response, "generated_videos", None):
        print("\nERROR: render completed but no video returned.")
        print(f"Operation response: {response}")
        return 1

    video = response.generated_videos[0]
    output_path.parent.mkdir(parents=True, exist_ok=True)

    # The SDK download API has churned across minor versions. Try the
    # current (download + save) pattern first; fall back to byte-array if
    # the API surface differs.
    print("\nDownloading video...")
    try:
        client.files.download(file=video.video)
        video.video.save(str(output_path))
    except AttributeError:
        # Older / alternate SDK shape: video bytes are exposed directly
        output_path.write_bytes(video.video.video_bytes)

    size_kb = output_path.stat().st_size // 1024
    print(f"\nSaved {size_kb} KB to:")
    print(f"  {output_path}")
    print()
    print("Next: commit the asset.")
    print(f"  git add public/assets/video/briefing-inversion/{clip.slug}.mp4")
    print(f"  git commit -m 'asset(briefing-inversion): {clip.slug} clip'")
    return 0


def main() -> int:
    parser = argparse.ArgumentParser(
        description="Render Briefing Inversion clips via Veo (Gemini Developer API)",
    )
    parser.add_argument(
        "slug",
        nargs="?",
        help=f"Clip slug to render. One of: {', '.join(CLIPS.keys())}",
    )
    parser.add_argument(
        "--list",
        action="store_true",
        help="List all available clip slugs and exit",
    )
    args = parser.parse_args()

    if args.list:
        return list_clips()

    if not args.slug:
        parser.print_help()
        print()
        return list_clips()

    if args.slug not in CLIPS:
        print(f"ERROR: unknown clip slug '{args.slug}'.")
        print()
        return list_clips()

    load_dotenv(ENV_PATH)
    api_key = os.getenv("GOOGLE_API_KEY") or os.getenv("GEMINI_API_KEY")
    if not api_key:
        print(f"ERROR: GOOGLE_API_KEY not found in {ENV_PATH}")
        print("Create web/.env.local with: GOOGLE_API_KEY=your-key-here")
        print("Get a key at https://aistudio.google.com/apikey")
        return 1

    return render(CLIPS[args.slug], api_key)


if __name__ == "__main__":
    try:
        sys.exit(main())
    except KeyboardInterrupt:
        print("\nAborted. GCP-side render continues — re-running this script")
        print("will start a fresh render (the operation handle is not persisted).")
        sys.exit(130)
