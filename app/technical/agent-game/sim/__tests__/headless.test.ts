import { describe, expect, it } from "vitest";
import { runHeadlessGame, type Strategy } from "../headless";
import type { GameState } from "../../cards";

// Minimal inline strategy so this test file doesn't depend on the
// not-yet-shipped ../strategies module (Phase 5a.7). It hires once per
// turn while cash allows, then ends the turn. Enough to drive the harness
// through the full 30-turn timeline.
const naiveHire: Strategy = {
  name: "naiveHire",
  pickAction: (state: GameState) => {
    // Always resolve blocking modals first — END_TURN is rejected while
    // either is active, so without this the harness loops forever.
    if (state.activeEventId) return { type: "CHOOSE_EVENT_OPTION", option: "A" };
    if (state.draftChoices) return { type: "SKIP_DRAFT" };

    if (state.hiredThisTurn) return null;
    // 30000 is the actual EMPLOY_WORKER cost in the reducer. If we use a
    // lower threshold the reducer rejects the action (returning a new state
    // with the same `hiredThisTurn === false`) and the headless loop spins
    // forever because each rejection still mutates eventLog.
    if (state.cash < 30000) return null;
    return { type: "EMPLOY_WORKER" };
  },
};

describe("runHeadlessGame", () => {
  it("returns deterministic result for the same seed", () => {
    const a = runHeadlessGame({ difficulty: "reality", seed: 42, strategy: naiveHire });
    const b = runHeadlessGame({ difficulty: "reality", seed: 42, strategy: naiveHire });
    expect(a.finalCash).toBe(b.finalCash);
    expect(a.finalValuation).toBe(b.finalValuation);
    expect(a.causeOfDeath).toBe(b.causeOfDeath);
    expect(a.turnsPlayed).toBe(b.turnsPlayed);
  });

  it("terminates by turn 31 at latest", () => {
    // Game's win check fires when turn >= 30, then END_TURN bumps to 31.
    const r = runHeadlessGame({ difficulty: "reality", seed: 1, strategy: naiveHire });
    expect(r.turnsPlayed).toBeLessThanOrEqual(31);
  });

  it("classifies the run as one of the known causes of death", () => {
    const r = runHeadlessGame({ difficulty: "zirp", seed: 5, strategy: naiveHire });
    expect(["bankruptcy", "valuation_miss", "win", "talent_walkout", "overcapacity_collapse"]).toContain(r.causeOfDeath);
  });
});
