// ============================================================
// Game Reducer — pure, React-free
// ============================================================
//
// Lifted out of AgentGameClient.tsx in Phase 5a.6 so the same reducer powers
// both the live React UI and a headless sim runner (sim/headless.ts). This
// module deliberately has NO React imports — only `cards` (types + databases)
// and `rng` (seeded PRNG). Touching anything that pulls in React from here
// will break the headless harness.

import {
  Employee,
  GameState,
  CARD_DATABASE,
  TRAIT_DATABASE,
  EVENT_DATABASE,
} from "./cards";
import { chaosChance, rollChaos } from "./chaos";
import {
  capacityOf,
  rentOf,
  setupCostOf,
  isOvercapacity,
  overcapacityProductivityPenalty,
  overcapacityLoyaltyDelta,
  nextTier,
  type OfficeTier,
} from "./office";
import { createRng, type Rng } from "./rng";
import { cardsForEra, eraOfTurn } from "./eras";

// ============================================================
// Types & Actions
// ============================================================
export type Action =
  | { type: "PLAY_CARD"; cardId: string; targetEmployeeId?: string }
  | { type: "EMPLOY_WORKER" }
  | { type: "EMPLOY_AGENT" } // homologue cortex node (Hermes) agent hire
  | { type: "PROMOTE_WORKER"; employeeId: string }
  | { type: "REDEFINE_OKRS" }
  | { type: "UPGRADE_OFFICE"; tier: OfficeTier }
  | { type: "CHOOSE_OFFICE"; tier: OfficeTier }
  | { type: "END_TURN" }
  | { type: "RESET_GAME"; difficulty: "boardroom" | "reality" | "zirp" }
  | { type: "LOAD_STATE"; state: GameState }
  | { type: "CHOOSE_EVENT_OPTION"; option: "A" | "B" }
  | { type: "DRAFT_CARD"; cardId: string }
  | { type: "SKIP_DRAFT" }
  | { type: "UNDO" }
  | { type: "DISMISS_TUTORIAL"; turn: number }
  | { type: "DISMISS_CHAOS_EVENT" };

// Tutorial gating — mechanics unlock by turn so new players see one
// concept at a time instead of all of them on turn 1.
//   Turn 1: Hire Human, Redefine OKRs, advance.
//   Turn 2: revenue/onboarding becomes visible (just status).
//   Turn 3: promotion unlocks (capped at 1/turn).
//   Turn 4: cognitive agent unlocks (deliberately unproductive at first).
//   Turn 5: card hand unlocks.
export const TURN_AGENT_UNLOCKED = 4;
export const TURN_CARDS_UNLOCKED = 5;
export const TURN_PROMOTION_UNLOCKED = 3;
export const MAX_PROMOTIONS_PER_TURN = 1;

const EMPLOYEE_NAMES = [
  "Edgar",
  "Jochem",
  "Lous",
  "Jos",
  "Storm",
  "Debby",
  "Jules",
  "Fleur",
  "Wouter",
  "Boudewijn",
  "Dwight",
  "Michael",
  "Pam",
  "Jim",
];

export const INITIAL_DECK = [
  "markdown_wiki", "markdown_wiki",
  "pdp", "pdp", "pdp", "pdp",
  "kroket_lunch", "kroket_lunch", "kroket_lunch",
  "hei_sessie", "hei_sessie",
  "kantoortuin",
  "gpt5_wrapper", "gpt5_wrapper",
  "kroket_lobby",
  "vage_okr", "vage_okr",
  "auditor", "auditor",
  "powerpoint_clinic",
  "koffie_apparaat",
];

/** Returns the famous-person display name for log messages and tooltips.
 *  Falls back to emp.name for legacy state without a traitId. */
export function getDisplayName(emp: { name: string; traitId?: string }): string {
  return (emp.traitId ? TRAIT_DATABASE[emp.traitId]?.displayName : undefined) ?? emp.name;
}

function shuffleArray<T>(array: readonly T[], rng: Rng): T[] {
  return rng.shuffle([...array]);
}

// Initial state builder based on difficulty.
// Optional `seed` lets the headless sim harness (Phase 5a.6+) pass a
// reproducible seed. Live runs use Math.random for the run-start seed —
// this is the single sanctioned Math.random call in the game module, and
// it runs at most once per fresh run.
export const createInitialState = (
  difficulty: "boardroom" | "reality" | "zirp",
  seed: number = Math.floor(Math.random() * 2 ** 31),
): GameState => {
  // The starting-state RNG draws from seed alone (tick = 0 by definition).
  const startRng = createRng(seed);
  // Guarantee at least 1 Markdown Wiki card in the starting hand to avoid bad RNG draw curves
  const deckWithoutWiki = [...INITIAL_DECK];
  const wikiIdx = deckWithoutWiki.indexOf("markdown_wiki");
  if (wikiIdx > -1) {
    deckWithoutWiki.splice(wikiIdx, 1);
  }
  const shuffledRest = shuffleArray(deckWithoutWiki, startRng);
  const cardsHand = ["markdown_wiki", ...shuffledRest.slice(0, 4)];
  const cardsDeck = shuffledRest.slice(4);

  let startingCash = 250000;
  if (difficulty === "boardroom") startingCash = 500000;
  if (difficulty === "zirp") startingCash = 30000; // ZIRP Nightmare edge starts

  // Phase 5b.2: every run starts with a 'home' office. Deduct the setup cost
  // up front so the starting balance reflects the office tier.
  // Phase 5b.8: ZIRP skips the home-setup deduction — treat the home office
  // as part of the ZIRP free-trial perk (free rent for turns 1-2 lives in
  // END_TURN). Net effect: ZIRP keeps its full $30k starting cash for first-
  // turn moves instead of being immediately at $0.
  if (difficulty !== "zirp") {
    startingCash -= setupCostOf("home");
  }

  const traitKeys = Object.keys(TRAIT_DATABASE);
  const shuffledTraits = shuffleArray(traitKeys, startRng);

  // Phase 5b.8: ZIRP free-trial starts with just 1 worker (Edgar). Other
  // difficulties keep the original 3-starter trio.
  const STARTER_TEMPLATES: Array<Omit<Employee, "traitId">> = [
    {
      id: "emp_1",
      name: "Edgar",
      type: "human",
      promotionLevel: 1,
      experience: 0,
      loyalty: 100,
      hasPDP: true,
      inspirationTurnsLeft: 0,
      isAsleep: false,
      turnsOnboarded: 6,
      pptPoisoningTurns: 0,
    },
    {
      id: "emp_2",
      name: "Jochem",
      type: "human",
      promotionLevel: 1,
      experience: 0,
      loyalty: 85,
      hasPDP: false,
      inspirationTurnsLeft: 0,
      isAsleep: false,
      turnsOnboarded: 6,
      pptPoisoningTurns: 0,
    },
    {
      id: "emp_3",
      name: "Lous",
      type: "human",
      promotionLevel: 1,
      experience: 0,
      loyalty: 90,
      hasPDP: false,
      inspirationTurnsLeft: 0,
      isAsleep: false,
      turnsOnboarded: 6, // founding employee — starts fully onboarded like Edgar/Jochem
      pptPoisoningTurns: 0,
    },
  ];
  const startingEmployeeCount = difficulty === "zirp" ? 1 : 3;
  const initialEmployees: Employee[] = STARTER_TEMPLATES
    .slice(0, startingEmployeeCount)
    .map((tpl, idx) => ({ ...tpl, traitId: shuffledTraits[idx] }));

  // Initial Valuation calculations
  const baseRevenue = 20000;
  const initialRev = baseRevenue * 2 + baseRevenue * 0.1;
  const peMultiplier = 7;
  const initialValuation = (initialRev * 12 * peMultiplier) + startingCash;

  const winThresholdLabel = difficulty === "boardroom" ? "$1.1B" : difficulty === "reality" ? "$25B" : "$140B";

  return {
    version: 1,
    seed,
    rngTick: 0,
    // Start past the hardcoded founder IDs (emp_1..emp_3) so hired workers /
    // agents never collide with them. A collision produced duplicate React
    // keys, which broke per-desk portrait rendering and onboarding display.
    nextEntityId: STARTER_TEMPLATES.length + 1,
    difficulty,
    turn: 1,
    cash: startingCash,
    valuation: initialValuation,
    okrLevel: 0,
    agentVersion: 0,
    employees: initialEmployees,
    cardsHand,
    cardsDeck,
    cardsDiscard: [],
    eventLog: [
      "--- SYSTEM START ---",
      `Difficulty: ${difficulty.toUpperCase()}`,
      `Survive 30 turns of exponential AI upgrades and reach a ${winThresholdLabel} valuation.`,
      "Avoid bankruptcy: keep cash above -$1,000,000.",
    ],
    hasDocumentation: false,
    hasKroketLobby: false,
    hasKoffieApparaat: false,
    kantoortuinPenaltyTurns: 0,
    redefinedOkrsThisTurn: false,
    hypeTurnsLeft: 0,
    isGameOver: false,
    gameResult: null,
    activeEventId: null,
    draftChoices: null,
    officeTier: "home" as OfficeTier,
    officeChosen: false,
    overcapacityCollapseTurns: 0,
    upgradedOfficeThisTurn: false,
    hangoverTurnsLeft: 0,
    saunaActiveTurnsLeft: 0,
    hasIso9001: false,
    activeChaosEvent: null,
    chaosProductivityNextTurn: 1,
  };
};

// ============================================================
// State Reducer
// ============================================================
export function gameReducer(state: GameState, action: Action): GameState {
  if (
    state &&
    (state.activeEventId !== null || state.draftChoices !== null) &&
    action.type !== "CHOOSE_EVENT_OPTION" &&
    action.type !== "DRAFT_CARD" &&
    action.type !== "SKIP_DRAFT" &&
    action.type !== "RESET_GAME" &&
    action.type !== "LOAD_STATE"
  ) {
    return state;
  }

  switch (action.type) {
    case "LOAD_STATE":
      return action.state;

    case "RESET_GAME":
      return createInitialState(action.difficulty);

    case "UNDO": {
      if (!state.lastSnapshot) return state;
      return state.lastSnapshot;
    }

    case "SKIP_DRAFT": {
      if (!state.draftChoices) return state;
      return { ...state, draftChoices: null };
    }

    case "DISMISS_TUTORIAL": {
      const dismissed = state.tutorialDismissed ?? [];
      if (dismissed.includes(action.turn)) return state;
      return { ...state, tutorialDismissed: [...dismissed, action.turn] };
    }

    case "DISMISS_CHAOS_EVENT": {
      if (!state.activeChaosEvent) return state;
      return { ...state, activeChaosEvent: null };
    }

    case "CHOOSE_EVENT_OPTION": {
      if (state.isGameOver || !state.activeEventId) return state;
      const event = EVENT_DATABASE[state.activeEventId];
      if (!event) return state;

      let nextCash = state.cash;
      let updatedEmployees = [...state.employees];
      let boardAngerTurns = state.boardAngerTurns ?? 0;
      let freezeHiringNextTurn = state.freezeHiringNextTurn ?? false;
      let rtoActiveTurns = state.rtoActiveTurns ?? 0;
      let surgeTurnsLeft = state.surgeTurnsLeft ?? 0;
      let surgeThrottledTurnsLeft = state.surgeThrottledTurnsLeft ?? 0;

      const logs = [`⚖️ Corporate Event Decision Resolved: ${event.title}`];

      if (action.option === "A") {
        logs.push(`Selected Option A: ${event.optionALabel}`);
        logs.push(`Effect: ${event.optionAFlavor}`);

        if (state.activeEventId === "kpmg_audit") {
          nextCash = Math.max(-1000000, nextCash - 30000);
        } else if (state.activeEventId === "rto_mandate") {
          updatedEmployees = updatedEmployees.map(e => e.type === "human" ? { ...e, loyalty: Math.max(0, e.loyalty - 20) } : e);
          rtoActiveTurns = 1;
        } else if (state.activeEventId === "headcount_freeze") {
          nextCash += 25000;
          freezeHiringNextTurn = true;
        } else if (state.activeEventId === "kroket_shortage") {
          nextCash = Math.max(-1000000, nextCash - 10000);
        } else if (state.activeEventId === "homelab_surge") {
          nextCash = Math.max(-1000000, nextCash - 20000);
          surgeTurnsLeft = 1;
        }
      } else {
        logs.push(`Selected Option B: ${event.optionBLabel}`);
        logs.push(`Effect: ${event.optionBFlavor}`);

        if (state.activeEventId === "kpmg_audit") {
          updatedEmployees = updatedEmployees.map(e => e.type === "human" ? { ...e, loyalty: Math.max(0, e.loyalty - 15) } : e);
        } else if (state.activeEventId === "rto_mandate") {
          nextCash = Math.max(-1000000, nextCash - 15000);
          updatedEmployees = updatedEmployees.map(e => e.type === "human" ? { ...e, loyalty: Math.min(100, e.loyalty + 10) } : e);
        } else if (state.activeEventId === "headcount_freeze") {
          boardAngerTurns = 3;
        } else if (state.activeEventId === "kroket_shortage") {
          updatedEmployees = updatedEmployees.map(e => e.type === "human" ? { ...e, loyalty: Math.max(0, e.loyalty - 15) } : e);
        } else if (state.activeEventId === "homelab_surge") {
          updatedEmployees = updatedEmployees.map(e => e.type === "human" ? { ...e, loyalty: Math.min(100, e.loyalty + 10) } : e);
          surgeThrottledTurnsLeft = 1;
        }
      }

      return {
        ...state,
        cash: nextCash,
        employees: updatedEmployees,
        boardAngerTurns,
        freezeHiringNextTurn,
        rtoActiveTurns,
        surgeTurnsLeft,
        surgeThrottledTurnsLeft,
        activeEventId: null, // Clear event overlay blocker
        eventLog: [...state.eventLog, ...logs],
      };
    }

    case "DRAFT_CARD": {
      // Single log emission — reducer is the source of truth. No useEffect re-fires this.
      // Guard: if draftChoices already cleared (e.g. StrictMode double-dispatch), bail early.
      if (state.isGameOver || !state.draftChoices) return state;
      const card = CARD_DATABASE[action.cardId];
      if (!card) return state;

      const logs = [`🃏 Drafted Card: ${card.name} added to hand.`];

      // Add to hand and discard pile (deck structure)
      const nextHand = [...state.cardsHand, action.cardId];
      const nextDiscard = [action.cardId, ...state.cardsDiscard];

      return {
        ...state,
        cardsHand: nextHand,
        cardsDiscard: nextDiscard,
        draftChoices: null, // Clear overlay — second dispatch sees draftChoices=null and returns early
        eventLog: [...state.eventLog, ...logs],
      };
    }

    case "EMPLOY_WORKER": {
      if (state.isGameOver) return state;
      if (state.hiredThisTurn) {
        return {
          ...state,
          eventLog: [
            ...state.eventLog,
            "Already hired this turn. End the turn to hire again — pacing matters.",
          ],
        };
      }
      const cost = 30000;
      if (state.cash < cost) {
        return {
          ...state,
          eventLog: [...state.eventLog, "Cannot hire worker: insufficient cash (requires $30,000)."],
        };
      }

      const activeNames = state.employees.map((e) => e.name);
      const availableNames = EMPLOYEE_NAMES.filter((n) => !activeNames.includes(n));
      const name = availableNames[0] ?? `Worker ${state.employees.length + 1}`;

      const traitKeys = Object.keys(TRAIT_DATABASE);
      const rng = createRng(state.seed + state.rngTick * 31);
      const randomTraitId = rng.pick(traitKeys);
      const traitInfo = TRAIT_DATABASE[randomTraitId]!;

      const newEmployee: Employee = {
        id: `emp_${state.nextEntityId}`,
        name,
        type: "human",
        promotionLevel: 1,
        experience: 0,
        loyalty: 100,
        hasPDP: false,
        inspirationTurnsLeft: 0,
        isAsleep: false,
        turnsOnboarded: 0,
        pptPoisoningTurns: 0,
        traitId: randomTraitId,
      };

      return {
        ...state,
        cash: state.cash - cost,
        employees: [...state.employees, newEmployee],
        hiredThisTurn: true,
        rngTick: state.rngTick + 1,
        nextEntityId: state.nextEntityId + 1,
        lastSnapshot: { ...state, lastSnapshot: null },
        eventLog: [
          ...state.eventLog,
          `💼 Hired ${traitInfo.displayName} for $30,000 (onboarding: ${state.hasDocumentation ? "3" : "6"} turns).`,
        ],
      };
    }

    case "EMPLOY_AGENT": {
      if (state.isGameOver) return state;
      if (state.turn < TURN_AGENT_UNLOCKED) {
        return {
          ...state,
          eventLog: [
            ...state.eventLog,
            `Cognitive Agents unlock at turn ${TURN_AGENT_UNLOCKED}. Frontier AI hasn't shipped yet.`,
          ],
        };
      }
      if (state.hiredThisTurn) {
        return {
          ...state,
          eventLog: [
            ...state.eventLog,
            "Already hired this turn. One headcount move per turn — end the turn first.",
          ],
        };
      }
      const cost = 15000;
      if (state.cash < cost) {
        return {
          ...state,
          eventLog: [...state.eventLog, "Cannot deploy agent: insufficient cash (requires $15,000)."],
        };
      }

      const agentCount = state.employees.filter((e) => e.type === "agent").length + 1;
      const name = `Hermes-Node_${agentCount}`;

      const newAgent: Employee = {
        id: `agent_${state.nextEntityId}`,
        name,
        type: "agent",
        promotionLevel: 1,
        experience: 0,
        loyalty: 100, // Agents don't decay loyalty unless undocumented AI frustration happens
        hasPDP: true, // Auto PDP
        inspirationTurnsLeft: 0,
        isAsleep: false,
        turnsOnboarded: 3, // Starts fully onboarded
        pptPoisoningTurns: 0,
      };

      return {
        ...state,
        cash: state.cash - cost,
        employees: [...state.employees, newAgent],
        hiredThisTurn: true,
        nextEntityId: state.nextEntityId + 1,
        lastSnapshot: { ...state, lastSnapshot: null },
        eventLog: [
          ...state.eventLog,
          `🤖 Hired AI Cognitive Agent ${name} for $15,000. Required: Markdown Wiki documentation active for proper synergy.`,
        ],
      };
    }

    case "CHOOSE_OFFICE": {
      if (state.officeChosen) return state;
      const costDelta = setupCostOf(action.tier) - setupCostOf("home");
      if (state.cash < costDelta) return state;
      return {
        ...state,
        officeTier: action.tier,
        officeChosen: true,
        cash: state.cash - costDelta,
        eventLog: [
          ...state.eventLog,
          action.tier === "home"
            ? `🏠 Starting from home. -$30k setup already taken.`
            : `🏢 Starter office: ${action.tier} (-$${costDelta.toLocaleString()} extra setup). Rent ${action.tier === "coworking" ? "$14k" : "$32k"}/turn.`,
        ],
      };
    }

    case "UPGRADE_OFFICE": {
      if (state.isGameOver) return state;
      if (state.upgradedOfficeThisTurn) {
        return {
          ...state,
          eventLog: [...state.eventLog, "Already upgraded the office this turn."],
        };
      }
      const candidate = nextTier(state.officeTier);
      if (candidate === null) {
        return {
          ...state,
          eventLog: [...state.eventLog, "No further office tiers available."],
        };
      }
      if (candidate !== action.tier) {
        // Can only upgrade to the immediate next tier — skip silently to keep
        // the log clean if a stale UI click races against a state change.
        return state;
      }
      const cost = setupCostOf(action.tier) + rentOf(action.tier);
      if (state.cash < cost) {
        return {
          ...state,
          eventLog: [
            ...state.eventLog,
            `Insufficient cash to upgrade to ${action.tier} (need $${cost.toLocaleString()}).`,
          ],
        };
      }
      return {
        ...state,
        cash: state.cash - cost,
        officeTier: action.tier,
        upgradedOfficeThisTurn: true,
        overcapacityCollapseTurns: 0, // upgrading resets the collapse timer
        lastSnapshot: { ...state, lastSnapshot: null },
        eventLog: [
          ...state.eventLog,
          `🏢 Office upgrade: ${state.officeTier} → ${action.tier} (-$${cost.toLocaleString()})`,
        ],
      };
    }

    case "PROMOTE_WORKER": {
      if (state.isGameOver) return state;
      if (state.turn < TURN_PROMOTION_UNLOCKED) {
        return {
          ...state,
          eventLog: [
            ...state.eventLog,
            `Promotion is unlocked from turn ${TURN_PROMOTION_UNLOCKED}. End the turn to advance the tutorial.`,
          ],
        };
      }
      const promotionsUsed = state.promotionsThisTurn ?? 0;
      if (promotionsUsed >= MAX_PROMOTIONS_PER_TURN) {
        return {
          ...state,
          eventLog: [
            ...state.eventLog,
            `You can only promote one employee per turn. End the turn to promote again next round.`,
          ],
        };
      }
      const emp = state.employees.find((e) => e.id === action.employeeId);
      if (!emp) return state;
      if (emp.type === "agent") {
        return {
          ...state,
          eventLog: [...state.eventLog, `Cannot promote ${getDisplayName(emp)}: AI Agents do not receive human title promotions.`],
        };
      }
      if (emp.promotionLevel >= 3) {
        return {
          ...state,
          eventLog: [...state.eventLog, `Cannot promote ${getDisplayName(emp)}: already at max Level 3.`],
        };
      }

      const cost = emp.promotionLevel === 1 ? 15000 : 40000;
      if (state.cash < cost) {
        return {
          ...state,
          eventLog: [
            ...state.eventLog,
            `Cannot promote ${getDisplayName(emp)}: insufficient cash (requires $${cost.toLocaleString()}).`,
          ],
        };
      }

      const nextLevel = (emp.promotionLevel + 1) as 1 | 2 | 3;
      const hasPDP = emp.hasPDP;
      const logs = [`📈 Promoted ${getDisplayName(emp)} to Level ${nextLevel} for $${cost.toLocaleString()}.`];

      if (!hasPDP) {
        logs.push(
          `⚠️ WARNING: ${getDisplayName(emp)} promoted without a Build-Plan PDP! -30% productivity penalty and double loyalty decay applied.`
        );
      }

      const isTaylorShift = emp.traitId === "shift";
      const isMargaretPatcher = emp.traitId === "patcher";
      if (isTaylorShift) {
        logs.push(`🎤 POP ERA: Taylor Shift's promotion tour boosts all other active humans' loyalty by +8%!`);
      }
      if (isMargaretPatcher) {
        logs.push(`👵 IRON LADY: Margaret Patcher does not inspire anyone upon promotion.`);
      }

      const updatedEmployees = state.employees.map((e) => {
        if (e.id === action.employeeId) {
          return {
            ...e,
            promotionLevel: nextLevel,
            loyalty: 100,
          };
        } else {
          let loyaltyVal = e.loyalty;
          if (isTaylorShift && e.type === "human") {
            loyaltyVal = Math.min(100, loyaltyVal + 8);
          }
          if (!isMargaretPatcher && e.promotionLevel < nextLevel && e.type === "human") {
            logs.push(`✨ ${getDisplayName(e)} is inspired by ${getDisplayName(emp)}'s promotion! (+50% productivity for 5 turns)`);
            return {
              ...e,
              inspirationTurnsLeft: 5,
              loyalty: loyaltyVal,
            };
          } else {
            return {
              ...e,
              loyalty: loyaltyVal,
            };
          }
        }
      });

      return {
        ...state,
        cash: state.cash - cost,
        employees: updatedEmployees,
        promotionsThisTurn: (state.promotionsThisTurn ?? 0) + 1,
        lastSnapshot: { ...state, lastSnapshot: null },
        eventLog: [...state.eventLog, ...logs],
      };
    }

    case "REDEFINE_OKRS": {
      if (state.isGameOver) return state;
      if (state.redefinedOkrsThisTurn) {
        return {
          ...state,
          eventLog: [
            ...state.eventLog,
            "Already redefined OKRs this turn. The team can't handle two alignment meetings in a row.",
          ],
        };
      }
      const cost = 10000;
      if (state.cash < cost) {
        return {
          ...state,
          eventLog: [...state.eventLog, "Cannot redefine OKRs: insufficient cash (requires $10,000)."],
        };
      }
      // Phase 5b.5: ISO 9001 raises the cap from 5 to 6.
      const okrCap = state.hasIso9001 ? 6 : 5;
      if (state.okrLevel >= okrCap) {
        return {
          ...state,
          eventLog: [...state.eventLog, `Cannot redefine OKRs: already at max level ${okrCap}.`],
        };
      }

      const nextOkr = state.okrLevel + 1;
      const logs = [
        `🔄 Redefined OKRs to Level ${nextOkr} for $10,000.`,
        `⚠️ Alignment Meeting: All employees suffer -40% productivity for this turn.`,
        `📈 Global long-term productivity multiplier increased to +${nextOkr * 15}%.`,
      ];

      return {
        ...state,
        cash: state.cash - cost,
        okrLevel: nextOkr,
        redefinedOkrsThisTurn: true,
        lastSnapshot: { ...state, lastSnapshot: null },
        eventLog: [...state.eventLog, ...logs],
      };
    }

    case "PLAY_CARD": {
      if (state.isGameOver) return state;
      if (state.turn < TURN_CARDS_UNLOCKED) {
        return {
          ...state,
          eventLog: [
            ...state.eventLog,
            `Cards unlock at turn ${TURN_CARDS_UNLOCKED}. Your playbook hasn't been published yet.`,
          ],
        };
      }
      if (state.playedCardThisTurn) {
        return {
          ...state,
          eventLog: [
            ...state.eventLog,
            "Already played a card this turn. One card per turn — end the turn to play another.",
          ],
        };
      }
      const card = CARD_DATABASE[action.cardId];
      if (!card) return state;

      if (state.cash < card.cost) {
        return {
          ...state,
          eventLog: [
            ...state.eventLog,
            `Cannot play ${card.name}: insufficient cash (requires $${card.cost.toLocaleString()}).`,
          ],
        };
      }

      if (card.requiresTarget && !action.targetEmployeeId) {
        return {
          ...state,
          eventLog: [...state.eventLog, `Cannot play ${card.name}: target employee required.`],
        };
      }

      // Phase 5b.5: faxmodernisering after turn 5 is a futile no-op — handle as
      // an early return so we don't deduct the $12,000 cost (the player gets
      // the card "back" in discard pile, and the turn-action counter does not
      // fire). The card is removed from hand and pushed to discard.
      if (card.id === "faxmodernisering" && state.turn > 5) {
        const handIndex0 = state.cardsHand.indexOf(action.cardId);
        const nextHand0 = [...state.cardsHand];
        if (handIndex0 > -1) nextHand0.splice(handIndex0, 1);
        return {
          ...state,
          eventLog: [...state.eventLog, `📠 Helaas. Bouwfonds gebruikt nu DocuSign. Faxmodernisering doet niets meer.`],
          cardsDiscard: [action.cardId, ...state.cardsDiscard],
          cardsHand: nextHand0,
          lastSnapshot: { ...state, lastSnapshot: null },
        };
      }

      // Phase 5b.5: iso_9001 requires Documentation. Reject before charging.
      if (card.id === "iso_9001" && !state.hasDocumentation) {
        return {
          ...state,
          eventLog: [...state.eventLog, `Cannot play ${card.name}: requires Documentation (Markdown Wiki or Het Ordner-archief).`],
        };
      }

      // Phase 5b.5: senior_partner needs a target human < L2.
      if (card.id === "senior_partner") {
        const target = state.employees.find((e) => e.id === action.targetEmployeeId);
        if (!target || target.type !== "human") {
          return {
            ...state,
            eventLog: [...state.eventLog, `Cannot play ${card.name}: target must be a human employee.`],
          };
        }
        if (target.promotionLevel >= 2) {
          return {
            ...state,
            eventLog: [...state.eventLog, `Cannot play ${card.name}: ${getDisplayName(target)} is already at Level ${target.promotionLevel}.`],
          };
        }
      }

      let updatedEmployees = [...state.employees];
      let nextCash = state.cash - card.cost;
      let hasDocumentation = state.hasDocumentation;
      let agentVersion = state.agentVersion;
      let hasKroketLobby = state.hasKroketLobby;
      let hasKoffieApparaat = state.hasKoffieApparaat;
      let kantoortuinPenaltyTurns = state.kantoortuinPenaltyTurns;
      let okrLevel = state.okrLevel;
      let redefinedOkrsThisTurn = state.redefinedOkrsThisTurn;
      let hypeTurnsLeft = state.hypeTurnsLeft;
      let hangoverTurnsLeft = state.hangoverTurnsLeft;
      let saunaActiveTurnsLeft = state.saunaActiveTurnsLeft;
      let hasIso9001 = state.hasIso9001;

      const logs = [`🎴 Card Played: ${card.name} (-$${card.cost.toLocaleString()}).`];

      if (card.id === "markdown_wiki") {
        hasDocumentation = true;
        logs.push(`📖 Documentation Enabled! Onboarding times cut in half. AI agent compliance audits mitigated.`);
      } else if (card.id === "pdp") {
        updatedEmployees = updatedEmployees.map((e) => {
          if (e.id === action.targetEmployeeId) {
            logs.push(`📋 Applied Build-Plan PDP to ${getDisplayName(e)}. They can now be promoted safely.`);
            return { ...e, hasPDP: true };
          }
          return e;
        });
      } else if (card.id === "kroket_lunch") {
        updatedEmployees = updatedEmployees.map((e) => {
          if (e.id === action.targetEmployeeId) {
            const isMarieFurie = e.traitId === "furie";
            const loyaltyGain = isMarieFurie ? 50 : 35;
            logs.push(`🍔 ${getDisplayName(e)} ate two kroketten. Loyalty +${loyaltyGain}${isMarieFurie ? " (Marie Furie Radical Energy bonus!)" : ""}, but fell asleep ('tapped') for 1 turn.`);
            return { ...e, loyalty: Math.min(100, e.loyalty + loyaltyGain), isAsleep: true };
          }
          return e;
        });
      } else if (card.id === "hei_sessie") {
        const promoter = updatedEmployees.find((e) => e.id === action.targetEmployeeId);
        if (promoter) {
          logs.push(`🌲 Hei-sessie: ${getDisplayName(promoter)} is inspired (+20 Loyalty, +50% productivity for 5 turns).`);
          updatedEmployees = updatedEmployees.map((e) => {
            if (e.id === action.targetEmployeeId) {
              return { ...e, loyalty: Math.min(100, e.loyalty + 20), inspirationTurnsLeft: 5 };
            } else if (e.promotionLevel < promoter.promotionLevel && e.type === "human") {
              logs.push(`✨ ${getDisplayName(e)} is inspired by ${getDisplayName(promoter)}'s leadership!`);
              return { ...e, inspirationTurnsLeft: 5 };
            }
            return e;
          });
        }
      } else if (card.id === "kantoortuin") {
        kantoortuinPenaltyTurns = 2;
        updatedEmployees = updatedEmployees.map((e) => ({
          ...e,
          loyalty: Math.min(100, e.loyalty + 15),
        }));
        logs.push(
          `🏢 Kantoortuin Herinrichting: All employees +15 Loyalty, but get distracted (-10% productivity for 2 turns).`
        );
      } else if (card.id === "gpt5_wrapper") {
        agentVersion = Math.min(6, agentVersion + 1);
        logs.push(`🤖 Upgraded AI Agent to version v${agentVersion}!`);
        hypeTurnsLeft = 3;
        logs.push(`🚀 MARKET HYPE ACTIVE: AI Wrapper hype spikes P/E multiplier by +8x for 3 turns!`);
        if (!hasDocumentation) {
          nextCash -= 25000;
          logs.push(
            `⚠️ Compliance Alert: No documentation active! Tunneling tokens caused immediate Token Leakage penalty (-$25,000 cash).`
          );
        }
      } else if (card.id === "kroket_lobby") {
        hasKroketLobby = true;
        logs.push(
          `🏪 Febo Kroket-automatiek installed in the lobby. Employees will gain passive loyalty at the end of each turn.`
        );
      } else if (card.id === "vage_okr") {
        // Phase 5b.5: ISO 9001 raises the cap from 5 to 6.
        const vageOkrCap = state.hasIso9001 ? 6 : 5;
        if (okrLevel < vageOkrCap) {
          okrLevel += 1;
          redefinedOkrsThisTurn = true;
          logs.push(`🔄 OKR Level increased to ${okrLevel}. Immediate -40% alignment penalty applied this turn.`);
        } else {
          logs.push(`OKR Level already at max (${vageOkrCap}).`);
        }
      } else if (card.id === "auditor") {
        if (hasDocumentation) {
          logs.push(`🧹 Auditor cleared token compliance concerns. Discharged compliance penalty risks.`);
        } else {
          logs.push(`❌ Auditor cannot proceed without Markdown Wiki documentation.`);
          return {
            ...state,
            eventLog: [...state.eventLog, "Cannot play Auditor: requires Markdown Wiki documentation active."],
          };
        }
      } else if (card.id === "powerpoint_clinic") {
        updatedEmployees = updatedEmployees.map((e) => {
          if (e.id === action.targetEmployeeId) {
            logs.push(
              `📊 ${getDisplayName(e)} attended PowerPoint Clinic. Loyalty +40, but PowerPoint Poisoning applied (-20% productivity for 3 turns).`
            );
            return { ...e, loyalty: Math.min(100, e.loyalty + 40), pptPoisoningTurns: 3 };
          }
          return e;
        });
      } else if (card.id === "koffie_apparaat") {
        hasKoffieApparaat = true;
        logs.push(
          `☕ Jochem's Koffie-apparaat installed. All workers gain +10% productivity permanently, maintenance costs $1,000/turn.`
        );
      } else if (card.id === "ordner_archief") {
        // Phase 5b.5: pre-AI documentation (paper version of markdown_wiki).
        hasDocumentation = true;
        logs.push(`📋 Het Ordner-archief geactiveerd. Onboarding gehalveerd.`);
      } else if (card.id === "vrijdagmiddagborrel") {
        // +25 loyalty to all humans. Hangover counter set to 2 so it
        // decrements to 1 at the end of this turn (still active next turn) and
        // 0 at the end of next turn (penalty applied during next turn's
        // productivity calc).
        updatedEmployees = updatedEmployees.map((e) =>
          e.type === "human"
            ? { ...e, loyalty: Math.min(100, e.loyalty + 25) }
            : e
        );
        hangoverTurnsLeft = 2;
        logs.push(`🍻 Vrijdagmiddagborrel: +25 loyalty all-around. Maandag is een ander gesprek.`);
      } else if (card.id === "iso_9001") {
        // Documentation requirement already checked above.
        hasIso9001 = true;
        logs.push(`🏅 ISO 9001 certificering ingericht. OKR-plafond nu op 6.`);
      } else if (card.id === "senior_partner") {
        // One-time mentor pull: promote target to L2 without a PDP penalty.
        // Target validity already checked above.
        updatedEmployees = updatedEmployees.map((e) => {
          if (e.id === action.targetEmployeeId) {
            logs.push(
              `🎩 Senior Partner van Kralingen mentors ${getDisplayName(e)} into Level 2. Toegevoegde waarde, geen uurtje-factuurtje.`
            );
            return {
              ...e,
              promotionLevel: 2 as 1 | 2 | 3,
              loyalty: 100,
              hasPDP: true,
            };
          }
          return e;
        });
      } else if (card.id === "brainstorm_in_sauna") {
        updatedEmployees = updatedEmployees.map((e) =>
          e.type === "human"
            ? { ...e, loyalty: Math.min(100, e.loyalty + 20) }
            : e
        );
        saunaActiveTurnsLeft = 3;
        logs.push(`🧖 Brainstorm in de sauna: +20 loyalty, +30% productiviteit, sneller loyaliteitsverlies — 3 beurten.`);
      } else if (card.id === "faxmodernisering") {
        // Turn ≤ 5 (the post-turn-5 case returned early above). Pay-out is
        // +$10,000 NET of card cost. The cost has already been subtracted
        // from nextCash in the common setup; bump revenue by $10k.
        nextCash += 10000;
        logs.push(`📠 Fax-Modernisering: +$10,000 omzet uit Bouwfonds-offertes.`);
      }

      const handIndex = state.cardsHand.indexOf(action.cardId);
      const nextHand = [...state.cardsHand];
      if (handIndex > -1) {
        nextHand.splice(handIndex, 1);
      }
      const nextDiscard = [action.cardId, ...state.cardsDiscard];

      return {
        ...state,
        cash: nextCash,
        hasDocumentation,
        agentVersion,
        hasKroketLobby,
        hasKoffieApparaat,
        kantoortuinPenaltyTurns,
        okrLevel,
        redefinedOkrsThisTurn,
        hypeTurnsLeft,
        hangoverTurnsLeft,
        saunaActiveTurnsLeft,
        hasIso9001,
        employees: updatedEmployees,
        cardsHand: nextHand,
        cardsDiscard: nextDiscard,
        playedCardThisTurn: true,
        lastSnapshot: { ...state, lastSnapshot: null },
        eventLog: [...state.eventLog, ...logs],
      };
    }

    case "END_TURN": {
      if (state.isGameOver) return state;

      // Per-turn RNG derived from the run seed + monotonic tick. Lets a
      // headless sim replay the same turn deterministically with the same
      // seed (Phase 5a.6+).
      const rng = createRng(state.seed + state.rngTick * 31);

      const currentTurn = state.turn;
      const logs = [`--- TURN ${currentTurn} SUMMARY ---`];

      // 0. Active traits and event checks
      const isAngelaActive = state.employees.some(
        (e) => e.traitId === "perkel" && e.turnsOnboarded >= (state.hasDocumentation ? 3 : 6)
      );

      // Phase 5b.2: capacity check based on HUMAN headcount only — agents
      // don't take a desk. We snapshot the pre-turn human count so this
      // turn's revenue & loyalty calculations reflect the office state the
      // player committed to (resignations land at the end of the turn).
      const humanHeadcountPreTurn = state.employees.filter((e) => e.type === "human").length;
      const capCheck = { headcount: humanHeadcountPreTurn, tier: state.officeTier };
      const isOver = isOvercapacity(capCheck);
      const nextOvercapacityCollapseTurns = isOver ? state.overcapacityCollapseTurns + 1 : 0;
      const overcapMultClamped = Math.max(0, 1 + overcapacityProductivityPenalty(capCheck));
      const overcapLoyaltyHit = overcapacityLoyaltyDelta(capCheck);

      // Decrement temporary event durations
      const nextBoardAngerTurns = state.boardAngerTurns && state.boardAngerTurns > 0 ? state.boardAngerTurns - 1 : 0;
      const nextRtoActiveTurns = state.rtoActiveTurns && state.rtoActiveTurns > 0 ? state.rtoActiveTurns - 1 : 0;
      const nextSurgeTurnsLeft = state.surgeTurnsLeft && state.surgeTurnsLeft > 0 ? state.surgeTurnsLeft - 1 : 0;
      const nextSurgeThrottledTurnsLeft = state.surgeThrottledTurnsLeft && state.surgeThrottledTurnsLeft > 0 ? state.surgeThrottledTurnsLeft - 1 : 0;
      // Phase 5b.5: pre-AI era effect counters.
      const nextHangoverTurnsLeft = Math.max(0, state.hangoverTurnsLeft - 1);
      const nextSaunaActiveTurnsLeft = Math.max(0, state.saunaActiveTurnsLeft - 1);

      // 1. Onboarding Progression
      let updatedEmployees = state.employees.map((e) => {
        const onboardingTarget = state.hasDocumentation ? 3 : 6;
        const employeeOnboardingTarget = e.traitId === "zweistein" ? Math.max(1, Math.floor(onboardingTarget / 2)) : onboardingTarget;
        if (e.turnsOnboarded < employeeOnboardingTarget) {
          const nextOnboard = e.turnsOnboarded + 1;
          if (nextOnboard === employeeOnboardingTarget) {
            logs.push(`🎉 ${getDisplayName(e)} is now fully onboarded and ready at 100% capacity.`);
          } else {
            logs.push(`📈 ${getDisplayName(e)} onboarding progress: ${nextOnboard}/${employeeOnboardingTarget} turns.`);
          }
          return {
            ...e,
            turnsOnboarded: nextOnboard,
            experience: e.experience + 1,
          };
        }
        return {
          ...e,
          experience: e.experience + 1,
        };
      });

      // 2. Exponential AI Upgrade (cadence depends on difficulty)
      const upgradeCadence =
        state.difficulty === "boardroom" ? 7 : state.difficulty === "zirp" ? 4 : 5;

      let nextAgentVersion = state.agentVersion;
      if (currentTurn % upgradeCadence === 0) {
        nextAgentVersion = Math.min(6, nextAgentVersion + 1);
        logs.push(`🤖 EXPONENTIAL UPGRADE: The industry has updated! AI Agent is now v${nextAgentVersion}.`);
        if (nextAgentVersion > 2 && !state.hasDocumentation) {
          logs.push(
            `⚠️ WARNING: Your lack of Markdown documentation causes integration mismatch with v${nextAgentVersion}.`
          );
        }
      }

      // 3. Loyalty Passive Adjustments (Kroket Lobby)
      if (state.hasKroketLobby) {
        updatedEmployees = updatedEmployees.map((e) => ({
          ...e,
          loyalty: Math.min(100, e.loyalty + 2),
        }));
      }

      // 4. homelab Node connection: Cognitive Agents helper check
      const activeAgentsCount = updatedEmployees.filter((e) => e.type === "agent").length;

      // Calculate Individual Productivity, Revenue, Salaries, and Loyalty Decay
      let totalTurnRevenue = 0;
      let totalSalaries = 0;

      const okrDecayPenalty = state.okrLevel * 3;
      const hasTokenLeakage = nextAgentVersion > 2 && !state.hasDocumentation;
      const leakageDecayPenalty = hasTokenLeakage ? 4 : 0;
      // If undocumented agent is active, add extra decay penalty due to troubleshoot anger
      const agentTroubleDecay = (!state.hasDocumentation && activeAgentsCount > 0) ? 5 : 0;

      const baseLoyaltyDecay = 4 + okrDecayPenalty + leakageDecayPenalty + agentTroubleDecay;

      const activeEmployeesAfterTurn: Employee[] = [];

      updatedEmployees.forEach((e) => {
        // AI Agents don't have salaries or normal loyalty decay but suffer from no documentation
        if (e.type === "agent") {
          let agentLoyalty = e.loyalty;
          if (!state.hasDocumentation) {
            agentLoyalty = Math.max(0, agentLoyalty - 15);
            logs.push(`⚠️ ${getDisplayName(e)} is hallucinating due to lack of docs. Core alignment drops.`);
          }
          if (agentLoyalty > 0) {
            activeEmployeesAfterTurn.push({
              ...e,
              loyalty: agentLoyalty,
              isAsleep: false,
            });
          } else {
            logs.push(`❌ CRASH: AI Agent ${getDisplayName(e)} has suffered token collapse and crashed.`);
          }
          return;
        }

        // Human employee logic
        const onboardingTarget = state.hasDocumentation ? 3 : 6;
        const employeeOnboardingTarget = e.traitId === "zweistein" ? Math.max(1, Math.floor(onboardingTarget / 2)) : onboardingTarget;
        const isOnboarded = e.turnsOnboarded >= employeeOnboardingTarget;

        let baseRevenue = 20000;
        if (e.promotionLevel === 2) baseRevenue = 50000;
        if (e.promotionLevel === 3) baseRevenue = 120000;

        let salary = 8000;
        if (e.promotionLevel === 2) salary = 18000;
        if (e.promotionLevel === 3) salary = 45000;

        // Ronald Rump passive: +50% salary
        if (e.traitId === "rump") {
          salary = Math.floor(salary * 1.5);
        }
        totalSalaries += salary;

        const onboardingMult = isOnboarded ? 1.0 : 0.1;

        // Ronald Rump passive: double OKR productivity multiplier boost
        const okrMult = e.traitId === "rump"
          ? 1.0 + state.okrLevel * 0.30
          : 1.0 + state.okrLevel * 0.15;

        let aiMult = 1.0;
        if (nextAgentVersion === 1) aiMult = 2.0;
        if (nextAgentVersion === 2) aiMult = 4.0;
        if (nextAgentVersion === 3) aiMult = 12.0;
        if (nextAgentVersion === 4) aiMult = 40.0;
        if (nextAgentVersion === 5) aiMult = 150.0;
        if (nextAgentVersion === 6) aiMult = 600.0;

        // Melon Husk passive: double AI Version productivity leverage
        if (e.traitId === "husk") {
          aiMult = aiMult * 2.0;
        }

        const inspirationMult = e.inspirationTurnsLeft > 0 ? 1.5 : 1.0;
        const asleepMult = e.isAsleep ? 0.0 : 1.0;
        const pdpMult = e.promotionLevel > 1 && !e.hasPDP ? 0.7 : 1.0;
        const kantoortuinMult = state.kantoortuinPenaltyTurns > 0 ? 0.9 : 1.0;
        const okrMeetingMult = state.redefinedOkrsThisTurn ? 0.6 : 1.0;
        const koffieMult = state.hasKoffieApparaat ? 1.1 : 1.0;
        // Phase 5b.5: pre-AI card effect productivity mults.
        const hangoverMult = state.hangoverTurnsLeft > 0 ? 0.85 : 1.0;
        const saunaMult = state.saunaActiveTurnsLeft > 0 ? 1.3 : 1.0;
        const pptMult = e.pptPoisoningTurns > 0 ? 0.8 : 1.0;

        // Corporate Event RTO Mandate: +25% productivity to humans if active
        const rtoMult = state.rtoActiveTurns && state.rtoActiveTurns > 0 ? 1.25 : 1.0;

        // Traits permanent productivity bonuses
        const traitProdMult = (e.traitId === "zweistein" || e.traitId === "furie") ? 1.2 : 1.0;

        // homelab Agent synergy boost: if documented agents are active, each multiplies humans by 1.25x
        let agentEffect = 0.25;
        if (state.surgeTurnsLeft && state.surgeTurnsLeft > 0) {
          agentEffect *= 1.5; // +50% Agent Prod
        }
        if (state.surgeThrottledTurnsLeft && state.surgeThrottledTurnsLeft > 0) {
          agentEffect *= 0.7; // -30% Agent Prod
        }
        const agentSynergyMult = (state.hasDocumentation && activeAgentsCount > 0)
          ? 1.0 + (activeAgentsCount * agentEffect)
          : 1.0;

        const finalProductivity =
          baseRevenue *
          onboardingMult *
          okrMult *
          aiMult *
          inspirationMult *
          asleepMult *
          pdpMult *
          kantoortuinMult *
          okrMeetingMult *
          koffieMult *
          pptMult *
          rtoMult *
          traitProdMult *
          agentSynergyMult *
          overcapMultClamped *
          hangoverMult *
          saunaMult *
          (state.chaosProductivityNextTurn ?? 1);
        totalTurnRevenue += finalProductivity;

        const pdpDecayMultiplier = e.promotionLevel > 1 && !e.hasPDP ? 2 : 1;

        // Melon Husk passive: suffers 2x base loyalty decay
        const huskDecayMultiplier = e.traitId === "husk" ? 2 : 1;

        // Phase 5b.5: sauna brainstorm accelerates loyalty decay by +25%.
        const saunaDecayMultiplier = state.saunaActiveTurnsLeft > 0 ? 1.25 : 1.0;

        const decay = baseLoyaltyDecay * pdpDecayMultiplier * huskDecayMultiplier * saunaDecayMultiplier;

        let nextLoyalty = e.loyalty;

        // Marie Furie passive: Restores +15 loyalty to herself upon sleeping
        if (e.isAsleep && e.traitId === "furie") {
          nextLoyalty = Math.min(100, nextLoyalty + 15);
          logs.push(`✨ Marie Furie passive: Restores +15 loyalty while sleeping.`);
        }

        nextLoyalty = nextLoyalty - decay;

        // Phase 5b.2: office overcapacity loyalty hit (-3 flat per overcap turn)
        nextLoyalty = nextLoyalty + overcapLoyaltyHit;

        // Margaret Patcher passive: Loyalty cannot drop below 1%
        if (e.traitId === "patcher") {
          nextLoyalty = Math.max(1, nextLoyalty);
        } else {
          nextLoyalty = Math.max(0, nextLoyalty);
        }

        if (nextLoyalty === 0) {
          logs.push(`❌ RESIGNATION: ${getDisplayName(e)} has resigned in protest of corporate alignment meetings.`);
        } else if (nextLoyalty <= 20) {
          logs.push(
            `⚠️ WARNING: ${getDisplayName(e)} loyalty is critical (${Math.floor(nextLoyalty)}%)! Promote them or play Broodje Kroket.`
          );
        }

        const nextInspiration = Math.max(0, e.inspirationTurnsLeft - 1);
        const nextPpt = Math.max(0, e.pptPoisoningTurns - 1);

        if (nextLoyalty > 0) {
          activeEmployeesAfterTurn.push({
            ...e,
            loyalty: Math.floor(nextLoyalty),
            inspirationTurnsLeft: nextInspiration,
            isAsleep: false,
            pptPoisoningTurns: nextPpt,
          });
        }
      });

      // 5. Overhead, Agent Costs, & Penalties
      let totalOverhead = 15000;
      if (state.hasKoffieApparaat) {
        // Angela Perkel passive: Halves coffee apparatus maintenance cost to $500
        const coffeeMaintenance = isAngelaActive ? 500 : 1000;
        totalOverhead += coffeeMaintenance;
        if (isAngelaActive) {
          logs.push(`🇩🇪 Angela Perkel passive: coffee apparatus maintenance cost is halved to $500.`);
        }
      }

      // homelab node agent penalty: if undocumented, agents cost $10,000/turn in maintenance
      let agentUndocumentedCost = 0;
      if (!state.hasDocumentation && activeAgentsCount > 0) {
        agentUndocumentedCost = activeAgentsCount * 10000;
        logs.push(
          `💸 Troubleshooting Tax: Troubled Cognitive Agents costed $${agentUndocumentedCost.toLocaleString()} resolving token errors.`
        );
      }

      let leakageCashCost = 0;
      if (hasTokenLeakage) {
        leakageCashCost = (nextAgentVersion - 2) * 20000;
        logs.push(
          `💸 Compliance Tax: Token Leakage with v${nextAgentVersion} costed $${leakageCashCost.toLocaleString()} in API fines.`
        );
      }

      // Phase 5b.2: office rent. Phase 5b.8: ZIRP free-trial waives rent for
      // the first two turns (matches the free home-setup perk).
      const isZirpFreeRent = state.difficulty === "zirp" && currentTurn <= 2;
      const rent = isZirpFreeRent ? 0 : rentOf(state.officeTier);
      if (isZirpFreeRent) {
        logs.push(`🏢 Rent: $0 (ZIRP starter perk, ${state.officeTier}, cap ${capacityOf(state.officeTier)}).`);
      } else {
        logs.push(
          `🏢 Rent: -$${rent.toLocaleString()} (${state.officeTier}, cap ${capacityOf(state.officeTier)}).`
        );
      }
      if (isOver) {
        logs.push(
          `⚠️ Office over capacity: ${humanHeadcountPreTurn} humans vs ${capacityOf(state.officeTier)} desks (${nextOvercapacityCollapseTurns}/6 turns until collapse). Productivity ×${overcapMultClamped.toFixed(2)}, loyalty ${overcapLoyaltyHit}.`
        );
      }

      const totalExpenses = totalSalaries + totalOverhead + leakageCashCost + agentUndocumentedCost + rent;
      let nextCash = state.cash + totalTurnRevenue - totalExpenses;

      // 6. Dividend reward
      if (nextCash > 0) {
        const dividend = Math.floor(nextCash * 0.02);
        nextCash += dividend;
        logs.push(`💰 Treasury Dividend: Earned $${dividend.toLocaleString()} (2% yield on positive reserves).`);
      }

      logs.push(
        `📊 Financials: Revenue $${totalTurnRevenue.toLocaleString()} | Expenses $${totalExpenses.toLocaleString()}`
      );

      // 7. Valuation
      let peMultiplier = state.hasDocumentation ? 10 + nextAgentVersion * 4 : 7;
      if (state.hypeTurnsLeft > 0) {
        peMultiplier += 8;
      }
      if (state.boardAngerTurns && state.boardAngerTurns > 0) {
        peMultiplier = Math.max(1, peMultiplier - 10);
        logs.push(`⚠️ Boardroom Anger active: P/E multiplier reduced by 10x (${state.boardAngerTurns} turns left).`);
      }

      const annualizedRevenue = totalTurnRevenue * 12;
      let nextValuation = annualizedRevenue * peMultiplier + nextCash;

      // Phase 5b.7: era-handoff bonus on the turn 5 → 6 boundary. Fires
      // exactly once per run when END_TURN advances into turn 6 and the
      // handoff state is unresolved.
      const nextTurn = currentTurn + 1;
      let seedFundedNow = state.seedFunded;
      let seedDeclinedNow = state.seedDeclined;
      let seedCashBonus = 0;
      let seedValuationBonus = 0;
      if (nextTurn === 6 && !state.seedFunded && !state.seedDeclined) {
        if (state.hasDocumentation) {
          seedFundedNow = true;
          seedCashBonus = 75_000;
          seedValuationBonus = 500_000;
          logs.push("🤝 Edgar's neef bij Endeit kwam langs. Hij vond je documentatie 'best wel netjes' en zet je op de seed-lijst. (+$75,000)");
        } else {
          seedDeclinedNow = true;
          logs.push("🤝 Edgar's neef is langs geweest. Hij wou graag eerst de documentatie zien. 'Misschien volgende keer, jongen.'");
        }
      }
      nextCash += seedCashBonus;
      nextValuation += seedValuationBonus;

      let hypeText = "";
      if (state.hypeTurnsLeft > 0) {
        hypeText = ` (including +8x Hype bonus, ${state.hypeTurnsLeft} turns left)`;
      }
      logs.push(`📈 Valuation updated: $${nextValuation.toLocaleString()} (P/E Multiplier: ${peMultiplier}x${hypeText}).`);

      const nextHypeTurnsLeft = Math.max(0, state.hypeTurnsLeft - 1);
      if (state.hypeTurnsLeft > 0 && nextHypeTurnsLeft === 0) {
        logs.push(`📉 Hype Bubble Popped: Market valuation multiplier normalized.`);
      }

      const nextKantoortuinTurns = Math.max(0, state.kantoortuinPenaltyTurns - 1);

      // 9. Card Draw (draw up to 4 automatically, draft the 5th)
      const currentHand = [...state.cardsHand];
      let currentDeck = [...state.cardsDeck];
      let currentDiscard = [...state.cardsDiscard];

      const cardsNeeded = 4 - currentHand.length;
      if (cardsNeeded > 0) {
        const cardsDrawn: string[] = [];
        for (let i = 0; i < cardsNeeded; i++) {
          if (currentDeck.length === 0) {
            if (currentDiscard.length === 0) break;
            currentDeck = shuffleArray(currentDiscard, rng);
            currentDiscard = [];
            logs.push(`🎴 Deck shuffled from discard pile.`);
          }
          const cardDrawn = currentDeck.shift();
          if (cardDrawn) {
            const dbCard = CARD_DATABASE[cardDrawn];
            if (dbCard) {
              cardsDrawn.push(dbCard.name);
              currentHand.push(cardDrawn);
            }
          }
        }
        if (cardsDrawn.length > 0) {
          logs.push(`🎴 Drew ${cardsDrawn.length} cards: ${cardsDrawn.join(", ")}.`);
        }
      }

      // Determine corporate event triggers: triggers every 5 turns
      let nextActiveEventId: string | null = null;
      if (currentTurn % 5 === 0) {
        const eventKeys = Object.keys(EVENT_DATABASE);
        nextActiveEventId = rng.pick(eventKeys);
        logs.push(`⚠️ ALERT: Corporate Event Triggered! ${EVENT_DATABASE[nextActiveEventId]?.title}`);
      }

      // Chaos engine — AI-scene flavored. Rolls at end of turn. Skipped on
      // the same turn a strategic Corporate Event triggers (avoid two modals
      // stacking) and never on the final game-ending turn.
      let nextActiveChaosEvent = state.activeChaosEvent ?? null;
      let chaosCashDelta = 0;
      let chaosLoyaltyDelta = 0;
      let chaosNextTurnProdMod = 1;
      if (!nextActiveEventId && currentTurn < 30 && rng.next() < chaosChance(currentTurn)) {
        const roll = rollChaos(rng.next.bind(rng));
        nextActiveChaosEvent = {
          title: roll.title,
          body: roll.body,
          cat: roll.cat,
          pts: roll.pts,
          cashDelta: roll.cashDelta,
          loyaltyDelta: roll.loyaltyDelta,
          productivityNextTurn: roll.productivityNextTurn,
          isNamed: roll.isNamed,
        };
        chaosCashDelta = roll.cashDelta;
        chaosLoyaltyDelta = roll.loyaltyDelta;
        chaosNextTurnProdMod = roll.productivityNextTurn;
        logs.push(
          `⚡ CHAOS [${roll.cat}, ${roll.pts}pt]: ${roll.body} (cash ${roll.cashDelta < 0 ? "" : "+"}$${roll.cashDelta.toLocaleString()}, loyalty ${roll.loyaltyDelta >= 0 ? "+" : ""}${roll.loyaltyDelta}).`,
        );

        // Apply chaos effects to this turn's resolved state — cash + every
        // active employee's loyalty. Productivity multiplier is carried
        // forward to be consumed on the next turn.
        nextCash = Math.max(-1000000, nextCash + chaosCashDelta);
        for (let i = 0; i < activeEmployeesAfterTurn.length; i++) {
          const e = activeEmployeesAfterTurn[i]!;
          activeEmployeesAfterTurn[i] = {
            ...e,
            loyalty: Math.max(0, Math.min(100, e.loyalty + chaosLoyaltyDelta)),
          };
        }
      }

      let isGameOver = false;
      let gameResult: "win" | "lose" | null = null;

      // Win thresholds re-tuned after one-action-per-bucket-per-turn caps.
      // 3 x 100-game runs: Boardroom 71-75%, Reality 47-58%, ZIRP 0-2%.
      const winThreshold = state.difficulty === "boardroom" ? 1100000000 : state.difficulty === "reality" ? 25000000000 : 140000000000;
      const winThresholdLabel = state.difficulty === "boardroom" ? "$1.1 Billion" : state.difficulty === "reality" ? "$25 Billion" : "$140 Billion";

      if (nextCash < -1000000) {
        isGameOver = true;
        gameResult = "lose";
        logs.push(
          `❌ GAME OVER: Bankrupt! Your cash fell below -$1,000,000. Jochem and Edgar have sued the company.`
        );
      } else if (nextOvercapacityCollapseTurns > 5) {
        isGameOver = true;
        gameResult = "lose";
        logs.push(
          `❌ GAME OVER: Office collapse. Your team has been over capacity for 6 consecutive turns.`
        );
      } else if (nextValuation >= winThreshold) {
        isGameOver = true;
        gameResult = "win";
        logs.push(
          `🏆 VICTORY: You crossed the ${winThresholdLabel} valuation mark! The CEO has promoted you to 'General Manager of Cognitive Capital'.`
        );
      } else if (currentTurn >= 30) {
        isGameOver = true;
        if (nextValuation >= winThreshold) {
          gameResult = "win";
          logs.push(`🏆 VICTORY: You survived 30 turns and reached a valuation of $${nextValuation.toLocaleString()}!`);
        } else {
          gameResult = "lose";
          logs.push(
            `❌ GAME OVER: 30 turns completed, but valuation ($${nextValuation.toLocaleString()}) fell short of the ${winThresholdLabel} target.`
          );
        }
      }

      // Card drafting trigger: If game is not won or lost, select 3 random card keys and set draftChoices.
      // Phase 5b.6: filter the pool by era. Draft fires at END_TURN to prepare
      // the NEXT turn's choices, so use currentTurn + 1.
      let nextDraftChoices: string[] | null = null;
      if (!isGameOver) {
        const pool = cardsForEra(eraOfTurn(currentTurn + 1));
        nextDraftChoices = shuffleArray(pool, rng).slice(0, 3);
      }

      return {
        ...state,
        turn: currentTurn + 1,
        rngTick: state.rngTick + 1,
        cash: nextCash,
        prevCash: state.cash, // capture pre-turn cash for delta display
        valuation: nextValuation,
        agentVersion: nextAgentVersion,
        employees: activeEmployeesAfterTurn,
        cardsHand: currentHand,
        cardsDeck: currentDeck,
        cardsDiscard: currentDiscard,
        kantoortuinPenaltyTurns: nextKantoortuinTurns,
        redefinedOkrsThisTurn: false,
        promotionsThisTurn: 0, // Reset the per-turn promotion cap
        hiredThisTurn: false,    // Reset hire-bucket cap (humans + agents)
        playedCardThisTurn: false, // Reset card-play cap
        hypeTurnsLeft: nextHypeTurnsLeft,
        isGameOver,
        gameResult,
        activeEventId: nextActiveEventId,
        draftChoices: nextDraftChoices,
        boardAngerTurns: nextBoardAngerTurns,
        rtoActiveTurns: nextRtoActiveTurns,
        surgeTurnsLeft: nextSurgeTurnsLeft,
        surgeThrottledTurnsLeft: nextSurgeThrottledTurnsLeft,
        hangoverTurnsLeft: nextHangoverTurnsLeft,
        saunaActiveTurnsLeft: nextSaunaActiveTurnsLeft,
        freezeHiringNextTurn: false, // Decays at the end of the turn
        lastSnapshot: null, // GG.2: clear undo snapshot at turn boundary
        // Phase 5b.2 / 5b.3: office tier carries; only UPGRADE_OFFICE mutates
        // officeTier. Reset the per-turn upgrade lock. Carry overcapacity
        // counter forward (zeroed earlier if this turn was at-cap).
        overcapacityCollapseTurns: nextOvercapacityCollapseTurns,
        upgradedOfficeThisTurn: false,
        seedFunded: seedFundedNow,
        seedDeclined: seedDeclinedNow,
        activeChaosEvent: nextActiveChaosEvent,
        chaosProductivityNextTurn: chaosNextTurnProdMod,
        eventLog: [...state.eventLog, ...logs],
      };
    }
  }
}
