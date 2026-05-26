import { describe, expect, it } from "vitest";
import {
  naiveHire,
  patientDocs,
  cardSpammer,
  okrMaximalist,
  balanced,
} from "../strategies";
import { runHeadlessGame } from "../headless";

const STRATEGIES = [naiveHire, patientDocs, cardSpammer, okrMaximalist, balanced];

describe("strategies", () => {
  it.each(STRATEGIES)("$name terminates within the turn cap", (strat) => {
    const r = runHeadlessGame({ difficulty: "reality", seed: 1, strategy: strat });
    // The reducer bumps turn AFTER game-over check, so the post-END_TURN turn
    // count can be 31 on a turn-30 cap loss. Either way: bounded.
    expect(r.turnsPlayed).toBeLessThanOrEqual(31);
  });

  it.each(STRATEGIES)("$name is deterministic", (strat) => {
    const a = runHeadlessGame({ difficulty: "reality", seed: 7, strategy: strat });
    const b = runHeadlessGame({ difficulty: "reality", seed: 7, strategy: strat });
    expect(a).toEqual(b);
  });
});
