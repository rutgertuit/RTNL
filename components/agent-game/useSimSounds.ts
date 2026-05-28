"use client";

import { useCallback, useEffect, useRef, useState } from "react";

/**
 * Sound manager for the Agent Inclusive Sim.
 *
 * The sfx + character-voice MP3s live under /audio/sfx/ and /audio/voice/.
 * They were generated but never wired to the game; this hook does the
 * wiring.
 *
 * Design notes:
 * - Browser autoplay policy: audio only plays after a user gesture. Every
 *   sound here is triggered by a click / turn-advance (all gestures), so
 *   this is fine. The first play() may still reject silently — we swallow.
 * - Mute state persists to localStorage so the preference survives reloads.
 * - Audio elements are cached per-src and rewound on replay, so rapid
 *   repeated triggers (e.g. ui-click) don't spawn dozens of elements.
 * - Defaults to MUTED. A game that starts blasting audio on load is hostile;
 *   the player opts in via the taskbar speaker toggle.
 */

export type SfxName =
  | "card-draw"
  | "card-play"
  | "turn-end"
  | "game-win"
  | "game-lose"
  | "ui-click"
  | "ui-hover";

const SFX_VOLUME: Record<SfxName, number> = {
  "card-draw": 0.5,
  "card-play": 0.55,
  "turn-end": 0.5,
  "game-win": 0.7,
  "game-lose": 0.7,
  "ui-click": 0.3,
  "ui-hover": 0.15,
};

const STORAGE_KEY = "agent_inclusive_sound_on";

export function useSimSounds() {
  const [enabled, setEnabled] = useState(false);
  const cacheRef = useRef<Map<string, HTMLAudioElement>>(new Map());
  const enabledRef = useRef(false);

  // Load persisted preference on mount.
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      const on = saved === "1";
      setEnabled(on);
      enabledRef.current = on;
    } catch {
      /* ignore */
    }
  }, []);

  const toggle = useCallback(() => {
    setEnabled((prev) => {
      const next = !prev;
      enabledRef.current = next;
      try {
        localStorage.setItem(STORAGE_KEY, next ? "1" : "0");
      } catch {
        /* ignore */
      }
      // Tiny confirmation click when turning ON, so the player knows
      // sound is live.
      if (next) {
        const el = getOrCreate(cacheRef.current, "/audio/sfx/ui-click.mp3");
        el.volume = 0.4;
        el.currentTime = 0;
        el.play().catch(() => {});
      }
      return next;
    });
  }, []);

  const play = useCallback((src: string, volume: number) => {
    if (!enabledRef.current) return;
    const el = getOrCreate(cacheRef.current, src);
    el.volume = volume;
    try {
      el.currentTime = 0;
    } catch {
      /* element not ready yet — play from wherever */
    }
    el.play().catch(() => {
      /* autoplay rejection / not loaded — ignore */
    });
  }, []);

  const playSfx = useCallback(
    (name: SfxName) => play(`/audio/sfx/${name}.mp3`, SFX_VOLUME[name]),
    [play],
  );

  /** Play a character voice line by trait id (e.g. "rump", "husk"). */
  const playVoice = useCallback(
    (traitId: string) => play(`/audio/voice/${traitId}.mp3`, 0.85),
    [play],
  );

  return { enabled, toggle, playSfx, playVoice };
}

function getOrCreate(cache: Map<string, HTMLAudioElement>, src: string): HTMLAudioElement {
  let el = cache.get(src);
  if (!el) {
    el = new Audio(src);
    el.preload = "auto";
    cache.set(src, el);
  }
  return el;
}
