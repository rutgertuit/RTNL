import type { GameState } from "./cards";
import { gameReducer, type Action } from "./reducer";

/**
 * Returns the state the game would be in if `action` were applied AND the
 * turn ended immediately. Pure — caller's state is unchanged.
 *
 * Used by the projection UI to render ghost overlays on hover/focus, and
 * by the headless sim harness as a building block. Reuses gameReducer, so
 * projections stay in lockstep with real turn logic.
 *
 * If the reducer rejects the action (cap hit, insufficient cash, modal
 * pending), returns the caller's state unchanged — no END_TURN simulation.
 * Rejection is detected via shallow field equality (excluding eventLog),
 * because the reducer's rejection paths return a fresh state object whose
 * only material change is an explanatory log line.
 */
export function projectAction(state: GameState, action: Action): GameState {
  const afterAction = gameReducer(state, action);
  if (afterAction === state || onlyLogChanged(state, afterAction)) return state;
  return gameReducer(afterAction, { type: "END_TURN" });
}

function onlyLogChanged(before: GameState, after: GameState): boolean {
  for (const key of Object.keys(after) as (keyof GameState)[]) {
    if (key === "eventLog") continue;
    if (after[key] !== before[key]) return false;
  }
  return true;
}
