// ============================================================
// Headless simulation harness — Phase 5a.6
// ============================================================
//
// Pure runner that drives the same reducer the React UI uses, but with no DOM,
// no localStorage, no event loop — just (seed, difficulty, strategy) in,
// SimResult out. Used by:
//   - the strategy-set tests (Phase 5a.7+),
//   - eventual balance sweeps for win-rate tuning,
//   - regression snapshots when the reducer changes.
//
// The contract: given the same seed + difficulty + strategy, this function
// returns the same SimResult every time. If that breaks, the bug is in the
// reducer's RNG plumbing, not here.

import type { GameState } from "../cards";
import { gameReducer, createInitialState, type Action } from "../reducer";

export type Difficulty = GameState["difficulty"];

export type CauseOfDeath =
  | "win"
  | "bankruptcy"
  | "valuation_miss"
  | "talent_walkout"
  | "overcapacity_collapse";

export interface Strategy {
  /** Returns the next action to take this turn, or `null` to end the turn. */
  pickAction(state: GameState): Action | null;
  name?: string;
}

export interface SimResult {
  seed: number;
  difficulty: Difficulty;
  strategy: string;
  turnsPlayed: number;
  finalCash: number;
  finalValuation: number;
  causeOfDeath: CauseOfDeath;
  peakValuation: number;
  meanLoyalty: number;
}

export interface SimRequest {
  seed: number;
  difficulty: Difficulty;
  strategy: Strategy;
}

// Safety cap so a misbehaving strategy can't spin forever inside a single
// turn. The live game caps each action bucket (hire/OKR/card/promote) at 1
// per turn, so 8 is comfortably above the natural ceiling.
const MAX_ACTIONS_PER_TURN = 8;

export function runHeadlessGame({ seed, difficulty, strategy }: SimRequest): SimResult {
  let state = createInitialState(difficulty, seed);
  let peakValuation = state.valuation;

  while (!state.isGameOver) {
    for (let i = 0; i < MAX_ACTIONS_PER_TURN; i++) {
      const action = strategy.pickAction(state);
      if (action === null) break;
      const next = gameReducer(state, action);
      if (next === state) break; // reducer rejected — bail to avoid loop
      state = next;
      if (state.isGameOver) break;
    }
    if (state.isGameOver) break;
    const afterEnd = gameReducer(state, { type: "END_TURN" });
    // END_TURN can be rejected (returns same ref) when an event/draft
    // overlay is active and the strategy didn't clear it. Without this
    // bail-out the outer loop would spin forever.
    if (afterEnd === state) break;
    state = afterEnd;
    peakValuation = Math.max(peakValuation, state.valuation);
  }

  const humans = state.employees.filter((e) => e.type === "human");
  const meanLoyalty =
    humans.length === 0 ? 0 : humans.reduce((s, e) => s + e.loyalty, 0) / humans.length;

  return {
    seed,
    difficulty,
    strategy: strategy.name ?? "anonymous",
    turnsPlayed: state.turn,
    finalCash: state.cash,
    finalValuation: state.valuation,
    causeOfDeath: deriveCauseOfDeath(state),
    peakValuation,
    meanLoyalty,
  };
}

function deriveCauseOfDeath(state: GameState): CauseOfDeath {
  if (state.gameResult === "win") return "win";
  if (state.cash <= -1_000_000) return "bankruptcy";
  if (state.employees.filter((e) => e.type === "human").length === 0) return "talent_walkout";
  if (state.overcapacityCollapseTurns > 5) return "overcapacity_collapse";
  return "valuation_miss";
}
