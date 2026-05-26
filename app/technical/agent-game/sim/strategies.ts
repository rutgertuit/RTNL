// ============================================================
// Simulation strategy bots — Phase 5a.7
// ============================================================
//
// Five deterministic policies that drive the headless harness in
// `./headless.ts`. Each strategy is a `Strategy` object with a `name` and a
// `pickAction(state)` method that returns the next `Action` to dispatch, or
// `null` to signal "end the turn".
//
// Design rules (apply to all strategies):
//   1. ALWAYS clear any pending modal first. If `activeEventId` is set we
//      pick option "A"; if `draftChoices` is non-null we `SKIP_DRAFT`. The
//      reducer rejects every other action while a modal is up, so leaving
//      one open would deadlock the outer loop (the headless harness already
//      bails on a rejected END_TURN, but it would still bail _early_ with a
//      stuck turn count).
//   2. Strategies never draft cards — `SKIP_DRAFT` keeps the policy
//      independent of the random card pool, so determinism only depends on
//      the run seed and not on draft contents.
//   3. Once the policy has nothing left to do this turn, return `null`. The
//      harness then dispatches END_TURN itself.
//
// Adapted from the plan template (docs/superpowers/plans/2026-05-25-…) — the
// template referenced action names that don't exist in this codebase
// (HIRE_HUMAN, UPGRADE_OFFICE) and a card (ordner_archief) that was renamed
// to `markdown_wiki`. See the implementer subagent brief for the full
// translation table.

import type { GameState } from "../cards";
import type { Strategy } from "./headless";
import type { Action } from "../reducer";

/**
 * Returns the action needed to clear any pending modal (event or draft), or
 * `null` if nothing is blocking. Every strategy below calls this first.
 */
export function firstModalAction(state: GameState): Action | null {
  if (state.activeEventId) return { type: "CHOOSE_EVENT_OPTION", option: "A" };
  if (state.draftChoices) return { type: "SKIP_DRAFT" };
  return null;
}

/**
 * naiveHire — Hire a worker every turn while cash > $50k. Does nothing else.
 *
 * Useful baseline: pure headcount growth with zero process investment. Will
 * generally bleed cash and run out of runway as salaries pile up.
 */
export const naiveHire: Strategy = {
  name: "naiveHire",
  pickAction(state) {
    const modal = firstModalAction(state);
    if (modal) return modal;
    if (state.hiredThisTurn) return null;
    if (state.cash > 50_000) return { type: "EMPLOY_WORKER" };
    return null;
  },
};

/**
 * patientDocs — Documentation-first. Plays `markdown_wiki` ASAP, then leans
 * on OKR redefinitions every other turn while OKR < 5 and cash > $30k.
 * Hires only when cash is comfortably above $80k.
 */
export const patientDocs: Strategy = {
  name: "patientDocs",
  pickAction(state) {
    const modal = firstModalAction(state);
    if (modal) return modal;

    // Play markdown_wiki the moment cards unlock and we have one in hand.
    if (
      !state.playedCardThisTurn &&
      !state.hasDocumentation &&
      state.cardsHand.includes("markdown_wiki")
    ) {
      return { type: "PLAY_CARD", cardId: "markdown_wiki" };
    }

    // OKR every other turn.
    if (
      !state.redefinedOkrsThisTurn &&
      state.okrLevel < 5 &&
      state.cash > 30_000 &&
      state.turn % 2 === 0
    ) {
      return { type: "REDEFINE_OKRS" };
    }

    // Hire only with a healthy buffer.
    if (!state.hiredThisTurn && state.cash > 80_000) {
      return { type: "EMPLOY_WORKER" };
    }

    return null;
  },
};

/**
 * cardSpammer — Plays the first card in hand whenever cards are unlocked and
 * cash > $25k. Hires only on the first two turns while cash > $80k, to
 * bootstrap a tiny revenue floor.
 *
 * Stress-tests "what if the player just clicks every card?" — exposes
 * pathological combinations like vague_okr + kantoortuin chains.
 */
export const cardSpammer: Strategy = {
  name: "cardSpammer",
  pickAction(state) {
    const modal = firstModalAction(state);
    if (modal) return modal;

    if (!state.playedCardThisTurn && state.cardsHand.length > 0 && state.cash > 25_000) {
      // Pick the first playable card that does NOT require a target — the
      // strategy doesn't bother choosing employees, so cards like PDP /
      // kroket_lunch / hei_sessie / powerpoint_clinic would just be
      // rejected by the reducer. Skipping them keeps the headless loop
      // moving without wasting an action slot.
      const NO_TARGET_CARDS = new Set([
        "markdown_wiki",
        "kantoortuin",
        "gpt5_wrapper",
        "kroket_lobby",
        "vage_okr",
        "auditor",
        "koffie_apparaat",
      ]);
      const cardId = state.cardsHand.find((c) => NO_TARGET_CARDS.has(c));
      if (cardId) {
        return { type: "PLAY_CARD", cardId };
      }
    }

    if (!state.hiredThisTurn && state.turn <= 2 && state.cash > 80_000) {
      return { type: "EMPLOY_WORKER" };
    }

    return null;
  },
};

/**
 * okrMaximalist — Redefines OKRs every turn while OKR < 5 and cash > $15k.
 * Hires while employees < 5 and cash > $100k. Tests whether the long-term
 * +15%/level productivity multiplier actually compounds, or gets eaten by
 * the per-turn -40% alignment-meeting penalty.
 */
export const okrMaximalist: Strategy = {
  name: "okrMaximalist",
  pickAction(state) {
    const modal = firstModalAction(state);
    if (modal) return modal;

    if (
      !state.redefinedOkrsThisTurn &&
      state.okrLevel < 5 &&
      state.cash > 15_000
    ) {
      return { type: "REDEFINE_OKRS" };
    }

    if (
      !state.hiredThisTurn &&
      state.employees.length < 5 &&
      state.cash > 100_000
    ) {
      return { type: "EMPLOY_WORKER" };
    }

    return null;
  },
};

/**
 * balanced — Sensible mix of doc / OKR / hire / promote. Closest to what a
 * thoughtful first-time player would do once they understand the systems.
 *
 *   - Play markdown_wiki if available and no docs yet (cash > $25k).
 *   - Redefine OKRs every 3rd turn while OKR < 5 (cash > $50k).
 *   - Hire while employees < 8 and cash > $100k.
 *   - Promote the highest-experience un-promoted human when the per-turn
 *     promotion cap is unused and we can afford the L1→L2 cost ($15k).
 *     The reducer requires turn >= TURN_PROMOTION_UNLOCKED (3), so this
 *     branch only fires from turn 3 onward — the reducer will reject it
 *     earlier and the harness will bail.
 *     Match the L1→L2 cost from reducer.ts: $15k.
 */
export const balanced: Strategy = {
  name: "balanced",
  pickAction(state) {
    const modal = firstModalAction(state);
    if (modal) return modal;

    // 1. Documentation first.
    if (
      !state.playedCardThisTurn &&
      !state.hasDocumentation &&
      state.cardsHand.includes("markdown_wiki") &&
      state.cash > 25_000
    ) {
      return { type: "PLAY_CARD", cardId: "markdown_wiki" };
    }

    // 2. OKR every 3rd turn.
    if (
      !state.redefinedOkrsThisTurn &&
      state.okrLevel < 5 &&
      state.cash > 50_000 &&
      state.turn % 3 === 0
    ) {
      return { type: "REDEFINE_OKRS" };
    }

    // 3. Promote highest-XP un-promoted human (L1→L2 cost = $15k).
    //    Gate this AHEAD of hiring so the team gets stronger before it
    //    gets bigger. Promotion unlocks at turn 3 in the reducer.
    const promotionsUsed = state.promotionsThisTurn ?? 0;
    if (
      promotionsUsed === 0 &&
      state.turn >= 3 &&
      state.cash > 40_000
    ) {
      const eligible = state.employees
        .filter(
          (e) =>
            e.type === "human" &&
            e.promotionLevel === 1 &&
            e.hasPDP, // promoting without PDP triggers the -30% / 2x decay penalty
        )
        .sort((a, b) => b.experience - a.experience);
      const candidate = eligible[0];
      if (candidate) {
        return { type: "PROMOTE_WORKER", employeeId: candidate.id };
      }
    }

    // 4. Hire to grow.
    if (!state.hiredThisTurn && state.employees.length < 8 && state.cash > 100_000) {
      return { type: "EMPLOY_WORKER" };
    }

    return null;
  },
};
