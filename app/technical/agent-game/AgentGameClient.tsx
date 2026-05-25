"use client";

import React, { useReducer, useEffect, useState, useRef } from "react";
import Link from "next/link";
// Site Nav/Footer/AppChrome intentionally NOT imported — this route is
// a full-screen game canvas. A small "← rt.nl" link inside the game header
// gives the player a way back to the rest of the site.
import {
  Employee,
  GameState,
  CARD_DATABASE,
  renderCardArt,
  renderEmployeeArt,
  TRAIT_DATABASE,
  EVENT_DATABASE,
} from "./cards";

// ============================================================
// Types & Actions
// ============================================================
export type Action =
  | { type: "PLAY_CARD"; cardId: string; targetEmployeeId?: string }
  | { type: "EMPLOY_WORKER" }
  | { type: "EMPLOY_AGENT" } // homologue cortex node (Hermes) agent hire
  | { type: "PROMOTE_WORKER"; employeeId: string }
  | { type: "REDEFINE_OKRS" }
  | { type: "END_TURN" }
  | { type: "RESET_GAME"; difficulty: "boardroom" | "reality" | "zirp" }
  | { type: "LOAD_STATE"; state: GameState }
  | { type: "CHOOSE_EVENT_OPTION"; option: "A" | "B" }
  | { type: "DRAFT_CARD"; cardId: string }
  | { type: "DISMISS_TUTORIAL"; turn: number };

// Tutorial gating — mechanics unlock by turn so new players see one
// concept at a time instead of all of them on turn 1.
//   Turn 1: Hire Human, Redefine OKRs, advance.
//   Turn 2: revenue/onboarding becomes visible (just status).
//   Turn 3: promotion unlocks (capped at 1/turn).
//   Turn 4: cognitive agent unlocks (deliberately unproductive at first).
//   Turn 5: card hand unlocks.
const TURN_AGENT_UNLOCKED = 4;
const TURN_CARDS_UNLOCKED = 5;
const TURN_PROMOTION_UNLOCKED = 3;
const MAX_PROMOTIONS_PER_TURN = 1;

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

const INITIAL_DECK = [
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
function getDisplayName(emp: { name: string; traitId?: string }): string {
  return (emp.traitId ? TRAIT_DATABASE[emp.traitId]?.displayName : undefined) ?? emp.name;
}

function shuffleArray<T>(array: T[]): T[] {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    const temp = arr[i]!;
    arr[i] = arr[j]!;
    arr[j] = temp;
  }
  return arr;
}

// Initial state builder based on difficulty
export const createInitialState = (difficulty: "boardroom" | "reality" | "zirp"): GameState => {
  // Guarantee at least 1 Markdown Wiki card in the starting hand to avoid bad RNG draw curves
  const deckWithoutWiki = [...INITIAL_DECK];
  const wikiIdx = deckWithoutWiki.indexOf("markdown_wiki");
  if (wikiIdx > -1) {
    deckWithoutWiki.splice(wikiIdx, 1);
  }
  const shuffledRest = shuffleArray(deckWithoutWiki);
  const cardsHand = ["markdown_wiki", ...shuffledRest.slice(0, 4)];
  const cardsDeck = shuffledRest.slice(4);

  let startingCash = 250000;
  if (difficulty === "boardroom") startingCash = 500000;
  if (difficulty === "zirp") startingCash = 30000; // ZIRP Nightmare edge starts

  const traitKeys = Object.keys(TRAIT_DATABASE);
  const shuffledTraits = shuffleArray(traitKeys);

  const initialEmployees: Employee[] = [
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
      traitId: shuffledTraits[0],
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
      traitId: shuffledTraits[1],
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
      turnsOnboarded: 0,
      pptPoisoningTurns: 0,
      traitId: shuffledTraits[2],
    },
  ];

  // Initial Valuation calculations
  const baseRevenue = 20000;
  const initialRev = baseRevenue * 2 + baseRevenue * 0.1;
  const peMultiplier = 7;
  const initialValuation = (initialRev * 12 * peMultiplier) + startingCash;

  const winThresholdLabel = difficulty === "boardroom" ? "$1.1B" : difficulty === "reality" ? "$25B" : "$140B";

  return {
    version: 1,
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
  };
};

// ============================================================
// State Reducer
// ============================================================
function gameReducer(state: GameState, action: Action): GameState {
  if (
    state &&
    (state.activeEventId !== null || state.draftChoices !== null) &&
    action.type !== "CHOOSE_EVENT_OPTION" &&
    action.type !== "DRAFT_CARD" &&
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

    case "DISMISS_TUTORIAL": {
      const dismissed = state.tutorialDismissed ?? [];
      if (dismissed.includes(action.turn)) return state;
      return { ...state, tutorialDismissed: [...dismissed, action.turn] };
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
      const randomTraitId = traitKeys[Math.floor(Math.random() * traitKeys.length)]!;
      const traitInfo = TRAIT_DATABASE[randomTraitId]!;

      const newEmployee: Employee = {
        id: `emp_${Date.now()}`,
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
        id: `agent_${Date.now()}`,
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
        eventLog: [
          ...state.eventLog,
          `🤖 Hired AI Cognitive Agent ${name} for $15,000. Required: Markdown Wiki documentation active for proper synergy.`,
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
      if (state.okrLevel >= 5) {
        return {
          ...state,
          eventLog: [...state.eventLog, "Cannot redefine OKRs: already at max level 5."],
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
        if (okrLevel < 5) {
          okrLevel += 1;
          redefinedOkrsThisTurn = true;
          logs.push(`🔄 OKR Level increased to ${okrLevel}. Immediate -40% alignment penalty applied this turn.`);
        } else {
          logs.push(`OKR Level already at max (5).`);
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
        employees: updatedEmployees,
        cardsHand: nextHand,
        cardsDiscard: nextDiscard,
        playedCardThisTurn: true,
        eventLog: [...state.eventLog, ...logs],
      };
    }

    case "END_TURN": {
      if (state.isGameOver) return state;

      const currentTurn = state.turn;
      const logs = [`--- TURN ${currentTurn} SUMMARY ---`];

      // 0. Active traits and event checks
      const isAngelaActive = state.employees.some(
        (e) => e.traitId === "perkel" && e.turnsOnboarded >= (state.hasDocumentation ? 3 : 6)
      );

      // Decrement temporary event durations
      const nextBoardAngerTurns = state.boardAngerTurns && state.boardAngerTurns > 0 ? state.boardAngerTurns - 1 : 0;
      const nextRtoActiveTurns = state.rtoActiveTurns && state.rtoActiveTurns > 0 ? state.rtoActiveTurns - 1 : 0;
      const nextSurgeTurnsLeft = state.surgeTurnsLeft && state.surgeTurnsLeft > 0 ? state.surgeTurnsLeft - 1 : 0;
      const nextSurgeThrottledTurnsLeft = state.surgeThrottledTurnsLeft && state.surgeThrottledTurnsLeft > 0 ? state.surgeThrottledTurnsLeft - 1 : 0;

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
          agentSynergyMult;
        totalTurnRevenue += finalProductivity;

        const pdpDecayMultiplier = e.promotionLevel > 1 && !e.hasPDP ? 2 : 1;
        
        // Melon Husk passive: suffers 2x base loyalty decay
        const huskDecayMultiplier = e.traitId === "husk" ? 2 : 1;
        
        const decay = baseLoyaltyDecay * pdpDecayMultiplier * huskDecayMultiplier;
        
        let nextLoyalty = e.loyalty;
        
        // Marie Furie passive: Restores +15 loyalty to herself upon sleeping
        if (e.isAsleep && e.traitId === "furie") {
          nextLoyalty = Math.min(100, nextLoyalty + 15);
          logs.push(`✨ Marie Furie passive: Restores +15 loyalty while sleeping.`);
        }
        
        nextLoyalty = nextLoyalty - decay;

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

      const totalExpenses = totalSalaries + totalOverhead + leakageCashCost + agentUndocumentedCost;
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
      const nextValuation = annualizedRevenue * peMultiplier + nextCash;

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
            currentDeck = shuffleArray(currentDiscard);
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
        nextActiveEventId = eventKeys[Math.floor(Math.random() * eventKeys.length)]!;
        logs.push(`⚠️ ALERT: Corporate Event Triggered! ${EVENT_DATABASE[nextActiveEventId]?.title}`);
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

      // Card drafting trigger: If game is not won or lost, select 3 random card keys and set draftChoices
      let nextDraftChoices: string[] | null = null;
      if (!isGameOver) {
        const cardKeys = Object.keys(CARD_DATABASE);
        nextDraftChoices = shuffleArray(cardKeys).slice(0, 3);
      }

      return {
        ...state,
        turn: currentTurn + 1,
        cash: nextCash,
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
        freezeHiringNextTurn: false, // Decays at the end of the turn
        eventLog: [...state.eventLog, ...logs],
      };
    }
  }
}

// --- Tutorial copy for turns 1..5 ---
// One screen per turn introducing exactly one new mechanic. Concise on
// purpose — the player should read it once and play. Image-slot is a
// CSS rendering, not an asset, so future iterations can swap art in.
interface TutorialStep {
  eyebrow: string;
  title: string;
  body: string[];
  cta: string;
}
const TUTORIAL_STEPS: Record<number, TutorialStep> = {
  1: {
    eyebrow: "DAY ONE",
    title: "Day One — Welcome to your new consultancy.",
    body: [
      "You inherited the company yesterday. The goal: keep this thing afloat for 30 turns and reach the valuation target for your difficulty (Boardroom $1.1B · Reality $25B · ZIRP $140B).",
      "Each turn you get one of each: one hire, one OKR redefine, one card play, one promotion. You don't have to take all four — pacing matters more than spending.",
      "Today: meet your team. Each desk shows 🔨 productivity and ❤ loyalty. Pick at most one move (a hire, or an OKR redefine), then NEXT TURN.",
    ],
    cta: "Got it — show me my desk →",
  },
  2: {
    eyebrow: "TURN TWO · ONBOARDING",
    title: "Things take time.",
    body: [
      "Your hire is onboarding. They cost their full salary but only generate 10% revenue until they're fully ramped (6 turns by default).",
      "Each desk shows the famous person you hired (Ronald Rump, Melon Husk, etc.) — each carries a passive trait. Hover the desk for their power.",
      "The dashboard shows the company's cash flow each turn: revenue from working humans minus salaries minus overhead. Net positive is the bar.",
    ],
    cta: "Got it",
  },
  3: {
    eyebrow: "TURN THREE · PROMOTION",
    title: "Move someone up.",
    body: [
      "Fully onboarded humans can be promoted. L1 → L2 → L3, each level grows revenue but salary scales too.",
      "One promotion per turn (just like one hire, one OKR, one card). Pick the highest-loyalty desk — promotion resets their loyalty to 100 and inspires teammates.",
      "Pro tip: from turn 5 you'll get a Build-Plan PDP card. Play it on someone BEFORE you promote them, or take a 30% productivity penalty.",
    ],
    cta: "Got it",
  },
  4: {
    eyebrow: "TURN FOUR · ENTER THE MACHINE",
    title: "Frontier AI just shipped.",
    body: [
      "You can now hire a Cognitive Agent — cheap upfront ($15k, no recurring salary), tireless, but erratic without proper documentation.",
      "Without docs: the agent costs $10k/turn maintenance, drains team loyalty, and provides no productivity boost. With docs: every human gets a 25% boost per agent.",
      "Hire one anyway — feel the pain. Next turn we'll fix it.",
    ],
    cta: "OK, deploy the chaos",
  },
  5: {
    eyebrow: "TURN FIVE · THE PLAYBOOK",
    title: "Cards have arrived.",
    body: [
      "Your hand is on the right: the playbook moves. Most useful first one: Markdown Wiki ($15k) — activates documentation, halves onboarding, makes the agent useful.",
      "Each turn you can play cards alongside your fixed actions. From here it's your call.",
      "Good luck. Don't optimise the horse.",
    ],
    cta: "Let me play",
  },
};


// ============================================================
// Main Client UI
// ============================================================
export default function AgentGameClient() {
  const [state, dispatch] = useReducer(gameReducer, null, () => {
    return {
      version: 1 as const,
      difficulty: "reality" as const,
      turn: 1,
      cash: 250000,
      valuation: 0,
      okrLevel: 0,
      agentVersion: 0,
      employees: [] as Employee[],
      cardsHand: [] as string[],
      cardsDeck: [] as string[],
      cardsDiscard: [] as string[],
      eventLog: [] as string[],
      hasDocumentation: false,
      hasKroketLobby: false,
      hasKoffieApparaat: false,
      kantoortuinPenaltyTurns: 0,
      redefinedOkrsThisTurn: false,
      hypeTurnsLeft: 0,
      isGameOver: false,
      gameResult: null as "win" | "lose" | null,
      activeEventId: null,
      draftChoices: null,
    };
  });

  const [selectedCardId, setSelectedCardId] = useState<string | null>(null);
  const [showDifficultySelector, setShowDifficultySelector] = useState(false);
  const [showTutorial, setShowTutorial] = useState(false);
  const [resetConfirmMode, setResetConfirmMode] = useState(false);
  const [copiedText, setCopiedText] = useState(false);
  // Full-screen v3: bottom-drawer state — at most one drawer open at a time.
  const [drawer, setDrawer] = useState<"log" | "cards" | "details" | null>(null);

  const logContainerRef = useRef<HTMLDivElement | null>(null);
  const cardElementsRef = useRef<(HTMLButtonElement | null)[]>([]);
  const resetTimerRef = useRef<NodeJS.Timeout | null>(null);

  // 1. Initial Load from LocalStorage (with schema validation guard)
  useEffect(() => {
    const savedState = localStorage.getItem("agent_inclusive_game_state_v1");
    if (savedState) {
      try {
        const parsed = JSON.parse(savedState);
        // Schema v1 guard
        if (parsed && parsed.version === 1 && parsed.difficulty) {
          dispatch({ type: "LOAD_STATE", state: parsed });
        } else {
          // Clear legacy schema
          localStorage.removeItem("agent_inclusive_game_state");
          setShowDifficultySelector(true);
        }
      } catch (e) {
        console.error("Failed to parse saved state:", e);
        setShowDifficultySelector(true);
      }
    } else {
      setShowDifficultySelector(true);
    }
  }, []);

  // 2. Sync to LocalStorage
  useEffect(() => {
    if (state.employees.length > 0 && !showDifficultySelector) {
      localStorage.setItem("agent_inclusive_game_state_v1", JSON.stringify(state));
    }
  }, [state, showDifficultySelector]);

  // 3. Scroll event log to bottom (newest logs at bottom)
  useEffect(() => {
    if (logContainerRef.current) {
      logContainerRef.current.scrollTop = logContainerRef.current.scrollHeight;
    }
  }, [state.eventLog]);

  // 4. Keyboard Listener for Ctrl + Enter
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.key === "Enter") {
        if (state && (state.activeEventId !== null || state.draftChoices !== null)) return;
        e.preventDefault();
        dispatch({ type: "END_TURN" });
        setSelectedCardId(null);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [state]);


  // Double-tap timer for reset
  const handleResetInitiate = () => {
    if (resetConfirmMode) {
      // Confirmed reset: show selector again
      if (resetTimerRef.current) clearTimeout(resetTimerRef.current);
      setResetConfirmMode(false);
      setShowDifficultySelector(true);
    } else {
      // Initiate reset confirm mode
      setResetConfirmMode(true);
      resetTimerRef.current = setTimeout(() => {
        setResetConfirmMode(false);
      }, 2500); // 2.5s window
    }
  };

  const handleDifficultySelect = (difficulty: "boardroom" | "reality" | "zirp") => {
    dispatch({ type: "RESET_GAME", difficulty });
    setShowDifficultySelector(false);
    setSelectedCardId(null);
  };

  const handleCardClick = (cardId: string) => {
    if (state.isGameOver || state.activeEventId || state.draftChoices) return;
    if (selectedCardId === cardId) {
      setSelectedCardId(null);
    } else {
      setSelectedCardId(cardId);
    }
  };

  const handlePlayNoTargetCard = () => {
    if (!selectedCardId || state.activeEventId || state.draftChoices) return;
    dispatch({ type: "PLAY_CARD", cardId: selectedCardId });
    setSelectedCardId(null);
  };

  const handleEmployeeClick = (employeeId: string) => {
    if (state.isGameOver || state.activeEventId || state.draftChoices) return;

    if (selectedCardId) {
      const card = CARD_DATABASE[selectedCardId];
      if (card && card.requiresTarget) {
        dispatch({ type: "PLAY_CARD", cardId: selectedCardId, targetEmployeeId: employeeId });
        setSelectedCardId(null);
      }
    }
  };

  const handlePromoteWorker = (employeeId: string) => {
    if (state.isGameOver || state.activeEventId || state.draftChoices) return;
    dispatch({ type: "PROMOTE_WORKER", employeeId });
  };

  const handleHireWorker = () => {
    if (state.activeEventId || state.draftChoices) return;
    dispatch({ type: "EMPLOY_WORKER" });
  };

  const handleHireAgent = () => {
    if (state.activeEventId || state.draftChoices) return;
    dispatch({ type: "EMPLOY_AGENT" });
  };

  const handleRedefineOkrs = () => {
    if (state.activeEventId || state.draftChoices) return;
    dispatch({ type: "REDEFINE_OKRS" });
  };

  const handleEndTurn = () => {
    if (state.activeEventId || state.draftChoices) return;
    dispatch({ type: "END_TURN" });
    setSelectedCardId(null);
  };

  const handleCardKeyDown = (e: React.KeyboardEvent, cardId: string) => {
    if (e.key === "Enter") {
      e.preventDefault();
      if (selectedCardId === cardId) {
        // Second Enter on already-selected card: play it
        const card = CARD_DATABASE[cardId];
        if (card && !card.requiresTarget) {
          handlePlayNoTargetCard();
        }
      } else {
        handleCardClick(cardId);
      }
    } else if (e.key === " ") {
      e.preventDefault();
      handleCardClick(cardId);
    }
  };

  const handleEmployeeKeyDown = (e: React.KeyboardEvent, employeeId: string) => {
    if (e.key === " " || e.key === "Enter") {
      e.preventDefault();
      handleEmployeeClick(employeeId);
    }
  };

  // Generate shareable copy-pasteable scorecard text
  const getShareableText = () => {
    const turns = state.turn - 1;
    const val = (state.valuation / 1000000000).toFixed(1);
    const difficultyName = state.difficulty.toUpperCase();
    
    let comment = "";
    if (state.gameResult === "win") {
      comment = "🏆 CEO called me 'General Manager of Cognitive Capital'. Edgar is parameterised, Jochem has his coffee.";
    } else if (state.cash < -1000000) {
      comment = "💀 Bankrupt because of KPMG audit fees. Edgar sued the company and Lous went to a hei-sessie without me.";
    } else {
      comment = "⏱️ Time expired. Too much interpersonal vagueness. Lous spent 30% of her week bellen with Debiteuren.";
    }

    return `I survived ${turns} turns of the Agent Inclusive Sim [${difficultyName} Mode] — final valuation $${val}B.\n${comment}\nPlay the sim: rutgertuit.nl/technical/agent-game`;
  };

  const handleCopyToClipboard = () => {
    const text = getShareableText();
    navigator.clipboard.writeText(text).then(() => {
      setCopiedText(true);
      setTimeout(() => setCopiedText(false), 2000);
    });
  };

  const selectedCard = selectedCardId ? CARD_DATABASE[selectedCardId] : null;

  // Calculate turns until next upgrade
  const upgradeCadence =
    state.difficulty === "boardroom" ? 7 : state.difficulty === "zirp" ? 4 : 5;
  const turnsToUpgrade = upgradeCadence - ((state.turn - 1) % upgradeCadence);

  // Win-threshold label for the stats strip
  const winThresholdLabel = state.difficulty === "boardroom" ? "$1.1B" : state.difficulty === "reality" ? "$25B" : "$140B";

  return (
    <div className="sim-fs-root">
      {/* Full-screen game canvas — no site Nav/Footer/AppChrome on this route.
          The website chrome was colliding with the dashboard at the top of the
          viewport and competing with the game for attention. This page now
          renders as its own application. */}

      <section className="sim-fs sim-v2" id="game-content">
        {/* Compact game-canvas header */}
        <header className="sim-fs__head">
          <Link href="/" className="sim-fs__home" aria-label="Back to rutgertuit.nl">
            <span className="sim-fs__home-arrow" aria-hidden>←</span>
            <span className="sim-fs__home-label">rt.nl</span>
          </Link>
          <Link href="/business/agent-inclusive" className="sim-fs__born-from" aria-label="Read the source article: Agent Inclusive">
            <span className="eyebrow">BORN FROM</span>
            <span>Agent Inclusive →</span>
          </Link>
          <div className="sim-fs__head-mid">
            <span className="sim-fs__game-name">AGENT INCLUSIVE SIM</span>
            <span className="sim-fs__head-meta">
              {state.difficulty.toUpperCase()} · Turn <strong>{state.turn}</strong> / 30
            </span>
          </div>
          <div className="sim-fs__head-tools">
            <button
              type="button"
              className="sim-fs__head-btn"
              onClick={() => setShowTutorial(true)}
              title="Show tutorial"
              aria-label="Show tutorial"
            >
              ?
            </button>
            <button
              type="button"
              className={`sim-fs__head-btn sim-fs__head-btn--reset ${resetConfirmMode ? "is-confirm" : ""}`}
              onClick={handleResetInitiate}
              title="Restart the simulation"
            >
              {resetConfirmMode ? "Confirm?" : "Reset"}
            </button>
          </div>
        </header>

        {/* Progressive-disclosure tutorial banner — turns 1..5, dismissible */}
        {(() => {
          const step = TUTORIAL_STEPS[state.turn];
          const dismissed = state.tutorialDismissed ?? [];
          if (!step || dismissed.includes(state.turn)) return null;
          return (
            <aside className="sim-tut sim-tut--banner" aria-live="polite" aria-label={step.title}>
              <div className="sim-tut__art" aria-hidden>
                <span className="sim-tut__art-label">IMAGE · Turn {state.turn}</span>
              </div>
              <div className="sim-tut__body">
                <div className="sim-tut__eyebrow">{step.eyebrow}</div>
                <h3 className="sim-tut__title">{step.title}</h3>
                {step.body.map((p, i) => (
                  <p key={i} className="sim-tut__p">{p}</p>
                ))}
                <button
                  type="button"
                  className="button button--warm sim-tut__cta"
                  onClick={() => dispatch({ type: "DISMISS_TUTORIAL", turn: state.turn })}
                >
                  {step.cta} <span aria-hidden>→</span>
                </button>
              </div>
              <button
                type="button"
                className="sim-tut__close"
                onClick={() => dispatch({ type: "DISMISS_TUTORIAL", turn: state.turn })}
                aria-label="Dismiss tutorial"
              >
                ×
              </button>
            </aside>
          );
        })()}

        {/* Primary stats — large and legible at a glance */}
        <section className="sim-fs__stats" aria-label="Game stats">
          <div className={`sim-fs__stat ${state.cash < 0 ? "is-warn" : ""}`} title="Available cash. Bankruptcy below -$1M.">
            <span className="sim-fs__stat-label">Cash</span>
            <span className="sim-fs__stat-value">
              {state.cash < 0 ? "-" : ""}${
                Math.abs(state.cash) >= 1_000_000
                  ? `${(state.cash / 1_000_000).toFixed(1)}M`
                  : `${Math.round(state.cash / 1000)}k`
              }
            </span>
          </div>
          <div className="sim-fs__stat sim-fs__stat--primary" title={`Win at ${winThresholdLabel}`}>
            <span className="sim-fs__stat-label">Valuation</span>
            <span className="sim-fs__stat-value">
              ${state.valuation >= 1e9 ? `${(state.valuation / 1e9).toFixed(1)}B` : `${(state.valuation / 1e6).toFixed(0)}M`}
            </span>
            <span className="sim-fs__stat-target">goal {winThresholdLabel}</span>
          </div>
          <div className="sim-fs__stat" title="Current frontier AI version.">
            <span className="sim-fs__stat-label">AI</span>
            <span className="sim-fs__stat-value">v{state.agentVersion}</span>
            {state.agentVersion < 6 && (
              <span className="sim-fs__stat-target">{turnsToUpgrade}t to v{state.agentVersion + 1}</span>
            )}
            {state.agentVersion > 2 && !state.hasDocumentation && (
              <span className="sim-fs__stat-target sim-fs__stat-target--warn">⚠ token leakage</span>
            )}
          </div>
          <div className={`sim-fs__stat ${state.hasDocumentation ? "is-good" : "is-warn"}`} title="Markdown documentation status.">
            <span className="sim-fs__stat-label">Docs</span>
            <span className="sim-fs__stat-value">{state.hasDocumentation ? "✓" : "✗"}</span>
            <span className="sim-fs__stat-target">{state.hasDocumentation ? "Wiki active" : "missing"}</span>
          </div>
        </section>

        {/* Office floor — the visual centerpiece */}
        <section className="sim-fs__office" aria-label="Office Floor">
          {selectedCard && selectedCard.requiresTarget && (
            <div className="sim-target-hint">
              🎯 Click a desk to target <strong>{selectedCard.name}</strong>
            </div>
          )}
          <div className="sim-employees-grid sim-office-floor">
            {state.employees.length === 0 ? (
              <div className="sim-office-empty">
                <span style={{ fontSize: "32px" }}>🏚️</span>
                <span>Empty office.</span>
                <span style={{ fontSize: "11px" }}>Hire someone to start generating revenue.</span>
              </div>
            ) : (
              <>
                <div className="sim-office-windows" aria-hidden>
                  {Array.from({ length: 6 }).map((_, i) => (
                    <span key={i} className="sim-office-window" />
                  ))}
                </div>
                <div className="sim-office-desks">
                  {state.employees.map((emp) => {
                    const onboardingTarget = state.hasDocumentation ? 3 : 6;
                    const employeeOnboardingTarget = emp.traitId === "zweistein" ? Math.max(1, Math.floor(onboardingTarget / 2)) : onboardingTarget;
                    const isOnboarded = emp.turnsOnboarded >= employeeOnboardingTarget;
                    const isCriticalLoyalty = emp.loyalty <= 20;
                    const traitInfo = emp.traitId ? TRAIT_DATABASE[emp.traitId] : undefined;
                    const isTargetable = !!(selectedCard && selectedCard.requiresTarget);
                    const isAgent = emp.type === "agent";

                    // Famous-name as primary identity. Falls back to emp.name
                    // only for legacy state without a trait assignment.
                    const displayName = traitInfo?.displayName ?? emp.name;

                    // Effective productivity for at-a-glance display.
                    // Per-employee multipliers only (skips global ones like
                    // OKR meeting / kantoor — those show on the dashboard).
                    let productivity = 100;
                    if (isAgent) {
                      productivity = state.hasDocumentation ? 125 : 0;
                    } else if (emp.isAsleep) {
                      productivity = 0;
                    } else if (!isOnboarded) {
                      productivity = 10;
                    } else {
                      if (emp.inspirationTurnsLeft > 0) productivity *= 1.5;
                      if (emp.pptPoisoningTurns > 0) productivity *= 0.8;
                      if (emp.promotionLevel > 1 && !emp.hasPDP) productivity *= 0.7;
                    }
                    productivity = Math.round(productivity);

                    // Loyalty tier — drives the heart color.
                    const loyaltyTier =
                      emp.loyalty <= 20 ? "critical" :
                      emp.loyalty <= 50 ? "warn" :
                      "good";

                    return (
                      <div
                        key={emp.id}
                        onClick={() => isTargetable && handleEmployeeClick(emp.id)}
                        onKeyDown={(e) => isTargetable && handleEmployeeKeyDown(e, emp.id)}
                        tabIndex={isTargetable ? 0 : -1}
                        className={[
                          "sim-desk",
                          isTargetable ? "is-targetable" : "",
                          emp.isAsleep ? "is-asleep" : "",
                          emp.inspirationTurnsLeft > 0 ? "is-inspired" : "",
                          isCriticalLoyalty ? "is-critical" : "",
                          !isOnboarded ? "is-onboarding" : "",
                          isAgent ? "is-agent" : "",
                          isAgent && !state.hasDocumentation ? "is-malfunctioning" : "",
                        ].filter(Boolean).join(" ")}
                        role={isTargetable ? "button" : undefined}
                        aria-label={`${displayName}, ${isAgent ? "Cognitive Agent" : `Level ${emp.promotionLevel}`}, productivity ${productivity}%, loyalty ${emp.loyalty}%`}
                        title={traitInfo ? `${traitInfo.passiveName}: ${traitInfo.description}` : undefined}
                      >
                        <div className="sim-desk__badges">
                          {emp.isAsleep && <span className="sim-desk__badge" title="Asleep this turn">💤</span>}
                          {emp.inspirationTurnsLeft > 0 && (
                            <span className="sim-desk__badge sim-desk__badge--inspired" title={`Inspired (${emp.inspirationTurnsLeft}t left)`}>✨</span>
                          )}
                          {emp.pptPoisoningTurns > 0 && (
                            <span className="sim-desk__badge" title={`PowerPoint fatigue (${emp.pptPoisoningTurns}t)`}>📊</span>
                          )}
                          {emp.hasPDP && !isAgent && (
                            <span className="sim-desk__badge sim-desk__badge--pdp" title="Has Build-Plan PDP">📋</span>
                          )}
                          {isAgent && !state.hasDocumentation && (
                            <span className="sim-desk__badge sim-desk__badge--critical" title="Token hallucination — needs Markdown Wiki">⚠</span>
                          )}
                        </div>
                        <svg className="sim-desk__character" viewBox="0 0 60 70" aria-hidden>
                          {isAgent ? (
                            <>
                              <rect x="14" y="14" width="32" height="40" rx="3" fill="currentColor" />
                              <rect x="18" y="20" width="24" height="2" fill="#0B0B0C" />
                              <rect x="18" y="26" width="24" height="2" fill="#0B0B0C" />
                              <rect x="18" y="32" width="24" height="2" fill="#0B0B0C" />
                              <circle cx="20" cy="46" r="1.5" fill="goldenrod" />
                              <circle cx="26" cy="46" r="1.5" fill="#a3be8c" />
                            </>
                          ) : (
                            <>
                              <circle cx="30" cy="18" r="10" fill="currentColor" />
                              <path d="M14 50 L14 38 Q14 28 30 28 Q46 28 46 38 L46 50 Z" fill="currentColor" />
                            </>
                          )}
                        </svg>
                        <svg className="sim-desk__furniture" viewBox="0 0 100 36" aria-hidden>
                          <rect x="0" y="20" width="100" height="14" rx="2" fill="#3a352e" />
                          <rect x="0" y="20" width="100" height="2" fill="rgba(255,255,255,0.08)" />
                          <rect x="32" y="4" width="36" height="18" rx="2" fill="#0a0a0c" stroke="#3a352e" strokeWidth="0.8" />
                          <rect x="34" y="6" width="32" height="14" fill={emp.isAsleep ? "#0a0a0c" : (isOnboarded ? "#1c2a3a" : "#2a1c14")} />
                          {!emp.isAsleep && isOnboarded && (
                            <>
                              <rect x="36" y="9" width="14" height="1" fill="rgba(163,190,140,0.55)" />
                              <rect x="36" y="12" width="22" height="1" fill="rgba(163,190,140,0.4)" />
                              <rect x="36" y="15" width="18" height="1" fill="rgba(163,190,140,0.4)" />
                            </>
                          )}
                        </svg>
                        <div className="sim-desk__info">
                          <span className="sim-desk__name">{displayName}</span>
                          <span className="sim-desk__level">
                            {isAgent ? "AI AGENT" : `L${emp.promotionLevel}`}
                            {!isOnboarded && !isAgent && (
                              <span className="sim-desk__onboard" title={`Onboarding ${emp.turnsOnboarded}/${employeeOnboardingTarget}`}>
                                {emp.turnsOnboarded}/{employeeOnboardingTarget}t
                              </span>
                            )}
                          </span>
                          <div className="sim-desk__metrics">
                            <span
                              className="sim-desk__metric sim-desk__metric--prod"
                              title={
                                isAgent
                                  ? (state.hasDocumentation ? "Boosting humans +25% productivity" : "Inactive — needs Markdown Wiki")
                                  : `Productivity this turn: ${productivity}%`
                              }
                              aria-label={`Productivity ${productivity}%`}
                            >
                              <span className="sim-desk__metric-icon" aria-hidden>🔨</span>
                              <span className="sim-desk__metric-num">{productivity}%</span>
                            </span>
                            <span
                              className={`sim-desk__metric sim-desk__metric--loy sim-desk__metric--loy-${loyaltyTier}`}
                              title={`Loyalty: ${emp.loyalty}%`}
                              aria-label={`Loyalty ${emp.loyalty}%`}
                            >
                              <span className="sim-desk__metric-icon" aria-hidden>❤</span>
                              <span className="sim-desk__metric-num">{emp.loyalty}%</span>
                            </span>
                          </div>
                        </div>
                        {!isAgent && isOnboarded && emp.promotionLevel < 3 && state.turn >= TURN_PROMOTION_UNLOCKED && (
                          <button
                            onClick={(e) => { e.stopPropagation(); handlePromoteWorker(emp.id); }}
                            disabled={
                              state.cash < (emp.promotionLevel === 1 ? 15000 : 40000) ||
                              (state.promotionsThisTurn ?? 0) >= MAX_PROMOTIONS_PER_TURN
                            }
                            className="sim-desk__promote"
                            aria-label={`Promote ${displayName}`}
                            title={
                              (state.promotionsThisTurn ?? 0) >= MAX_PROMOTIONS_PER_TURN
                                ? "One promotion per turn. End the turn to promote again."
                                : `Promote ${displayName} to level ${emp.promotionLevel + 1}`
                            }
                          >
                            ▴ Promote
                            <span className="sim-desk__promote-cost">${emp.promotionLevel === 1 ? "15k" : "40k"}</span>
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
              </>
            )}
          </div>
        </section>

        {/* Your move — action chips */}
        <section className="sim-fs__move" aria-label="Your Move">
          <h2 className="sim-fs__move-title">⚡ Your move</h2>
          {state.freezeHiringNextTurn && (
            <p className="sim-fs__warn">❄️ Board has frozen hiring this turn.</p>
          )}
          <div className="sim-fs__move-grid">
            <button
              type="button"
              onClick={handleHireWorker}
              disabled={
                state.cash < 30000 ||
                state.activeEventId !== null ||
                state.draftChoices !== null ||
                !!state.freezeHiringNextTurn ||
                !!state.hiredThisTurn
              }
              className={`sim-fs__move-btn ${state.hiredThisTurn ? "is-used" : ""}`}
              title={state.hiredThisTurn ? "Already hired this turn — pacing matters." : ""}
            >
              <span className="sim-fs__move-btn-name">
                {state.hiredThisTurn ? "✓ Hired this turn" : "Hire Human"}
              </span>
              <span className="sim-fs__move-btn-cost">$30k</span>
            </button>
            {state.turn >= TURN_AGENT_UNLOCKED ? (
              <button
                type="button"
                onClick={handleHireAgent}
                disabled={
                  state.cash < 15000 ||
                  state.activeEventId !== null ||
                  state.draftChoices !== null ||
                  !!state.freezeHiringNextTurn ||
                  !!state.hiredThisTurn
                }
                className={`sim-fs__move-btn ${state.hiredThisTurn ? "is-used" : ""}`}
                title={state.hiredThisTurn ? "Already hired this turn — pacing matters." : ""}
              >
                <span className="sim-fs__move-btn-name">
                  {state.hiredThisTurn ? "✓ Hired this turn" : "Hire Cognitive Agent"}
                </span>
                <span className="sim-fs__move-btn-cost">$15k</span>
              </button>
            ) : (
              <button
                type="button"
                disabled
                className="sim-fs__move-btn is-locked"
                title={`Cognitive Agents unlock at turn ${TURN_AGENT_UNLOCKED}`}
              >
                <span className="sim-fs__move-btn-name">🔒 Cognitive Agent</span>
                <span className="sim-fs__move-btn-cost">turn {TURN_AGENT_UNLOCKED}</span>
              </button>
            )}
            <button
              type="button"
              onClick={handleRedefineOkrs}
              disabled={
                state.cash < 10000 ||
                state.okrLevel >= 5 ||
                state.activeEventId !== null ||
                state.draftChoices !== null ||
                state.redefinedOkrsThisTurn
              }
              className={`sim-fs__move-btn ${state.redefinedOkrsThisTurn ? "is-used" : ""}`}
              title={state.redefinedOkrsThisTurn ? "Already redefined this turn — the team can't handle two alignment meetings." : ""}
            >
              <span className="sim-fs__move-btn-name">
                {state.redefinedOkrsThisTurn ? "✓ OKRs redefined" : "Redefine OKRs"}
              </span>
              <span className="sim-fs__move-btn-cost">$10k</span>
            </button>
            {state.turn >= TURN_CARDS_UNLOCKED ? (
              <button
                type="button"
                onClick={() => setDrawer(drawer === "cards" ? null : "cards")}
                className={`sim-fs__move-btn sim-fs__move-btn--cards ${drawer === "cards" ? "is-open" : ""} ${state.playedCardThisTurn ? "is-used" : ""}`}
                title={state.playedCardThisTurn ? "Already played a card this turn." : ""}
              >
                <span className="sim-fs__move-btn-name">
                  {state.playedCardThisTurn ? "✓ Card played" : "Play a Card"}
                </span>
                <span className="sim-fs__move-btn-cost">{state.cardsHand.length} in hand</span>
              </button>
            ) : (
              <button
                type="button"
                disabled
                className="sim-fs__move-btn is-locked"
                title={`Cards unlock at turn ${TURN_CARDS_UNLOCKED}`}
              >
                <span className="sim-fs__move-btn-name">🔒 Play a Card</span>
                <span className="sim-fs__move-btn-cost">turn {TURN_CARDS_UNLOCKED}</span>
              </button>
            )}
          </div>
          <p className="sim-fs__move-hint">
            {drawer === "cards"
              ? <>+ Click a card to select. Click again, double-click, or press <kbd>Enter</kbd> to play.</>
              : state.turn >= TURN_PROMOTION_UNLOCKED
                ? <>+ Click <em>Promote</em> on a desk to promote one employee per turn.</>
                : null
            }
          </p>
        </section>

        {/* Next Turn — primary CTA */}
        <div className="sim-fs__next-wrap">
          <button
            type="button"
            onClick={handleEndTurn}
            disabled={state.activeEventId !== null || state.draftChoices !== null}
            className="sim-fs__next"
          >
            Next Turn <span aria-hidden>→</span>
          </button>
          <div className="sim-fs__next-hint">
            Shortcut: <kbd>Ctrl + Enter</kbd>
          </div>
        </div>

        {/* Drawer tabs — Log / Cards / Details, only one open at a time */}
        <nav className="sim-fs__drawer-tabs" aria-label="More info">
          <button
            type="button"
            onClick={() => setDrawer(drawer === "log" ? null : "log")}
            className={`sim-fs__drawer-tab ${drawer === "log" ? "is-open" : ""}`}
            aria-expanded={drawer === "log"}
          >
            {drawer === "log" ? "▾" : "▸"} Log ({state.eventLog.length})
          </button>
          <button
            type="button"
            onClick={() => setDrawer(drawer === "cards" ? null : "cards")}
            className={`sim-fs__drawer-tab ${drawer === "cards" ? "is-open" : ""}`}
            aria-expanded={drawer === "cards"}
            disabled={state.turn < TURN_CARDS_UNLOCKED}
            title={state.turn < TURN_CARDS_UNLOCKED ? `Cards unlock at turn ${TURN_CARDS_UNLOCKED}` : ""}
          >
            {drawer === "cards" ? "▾" : "▸"} Cards {state.turn < TURN_CARDS_UNLOCKED ? "🔒" : `(${state.cardsHand.length})`}
          </button>
          <button
            type="button"
            onClick={() => setDrawer(drawer === "details" ? null : "details")}
            className={`sim-fs__drawer-tab ${drawer === "details" ? "is-open" : ""}`}
            aria-expanded={drawer === "details"}
          >
            {drawer === "details" ? "▾" : "▸"} Details
          </button>
        </nav>

        {drawer === "log" && (
          <div className="sim-fs__drawer-panel sim-fs__drawer-panel--log" role="region" aria-label="Game log">
            <div className="sim-log-box" ref={logContainerRef}>
              <div style={{ color: "var(--color-fg-3)", borderBottom: "1px dashed var(--color-fg-4)", paddingBottom: "var(--space-2)", marginBottom: "var(--space-2)" }}>
                [ --- LIVE SPRINT LEDGER --- ]
              </div>
              {state.eventLog.map((log, index) => (
                <div key={index} className="sim-log-entry">{log}</div>
              ))}
            </div>
            <div className="sr-only" aria-live="polite">
              {state.eventLog[state.eventLog.length - 1]}
            </div>
          </div>
        )}

        {drawer === "cards" && state.turn >= TURN_CARDS_UNLOCKED && (
          <div className="sim-fs__drawer-panel sim-fs__drawer-panel--cards" role="region" aria-label="Card hand">
            {state.playedCardThisTurn && (
              <div className="sim-fs__warn" role="status">
                ✓ You&apos;ve played a card this turn. End the turn to play another.
              </div>
            )}
            <div className="sim-hand-shelf" role="group" aria-label="Cards in hand">
              {state.cardsHand.map((cardId, index) => {
                const card = CARD_DATABASE[cardId];
                if (!card) return null;
                const isSelected = selectedCardId === cardId;
                return (
                  <button
                    key={`${cardId}-${index}`}
                    type="button"
                    onClick={() => handleCardClick(cardId)}
                    onDoubleClick={() => {
                      if (!card.requiresTarget && !state.playedCardThisTurn) {
                        setSelectedCardId(cardId);
                        dispatch({ type: "PLAY_CARD", cardId });
                        setSelectedCardId(null);
                      }
                    }}
                    onKeyDown={(e) => handleCardKeyDown(e, cardId)}
                    ref={(el) => { cardElementsRef.current[index] = el as HTMLButtonElement | null; }}
                    tabIndex={0}
                    className={`mtg-card mtg-card--${card.class} ${isSelected ? "mtg-card--selected" : ""}`}
                    aria-label={`${card.name}, Cost: ${card.cost}. ${card.rulesText}${isSelected && !card.requiresTarget ? ". Press Enter to play." : ""}`}
                    aria-pressed={isSelected}
                  >
                    <div className="mtg-card__header">
                      <h3 className="mtg-card__name" style={{ fontSize: "13px" }}>{card.name}</h3>
                      <span className="mtg-card__cost">play ${(card.cost / 1000)}k</span>
                    </div>
                    <div className="mtg-card__type">Sorcery — {card.class}</div>
                    <div className="mtg-card__art-window">
                      {renderCardArt(card.id)}
                    </div>
                    <div className="mtg-card__textbox">
                      <p className="mtg-card__rules">{card.rulesText}</p>
                      <p className="mtg-card__flavor">{card.flavor}</p>
                    </div>
                    {isSelected && !card.requiresTarget && !state.playedCardThisTurn && (
                      <span
                        className="mtg-card__play"
                        role="button"
                        tabIndex={0}
                        onClick={(e) => { e.stopPropagation(); handlePlayNoTargetCard(); }}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" || e.key === " ") {
                            e.preventDefault();
                            e.stopPropagation();
                            handlePlayNoTargetCard();
                          }
                        }}
                      >
                        Play this card <span aria-hidden>→</span>
                      </span>
                    )}
                    {isSelected && card.requiresTarget && !state.playedCardThisTurn && (
                      <span className="mtg-card__play mtg-card__play--target">
                        Click a desk to target <span aria-hidden>→</span>
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {drawer === "details" && (
          <div className="sim-fs__drawer-panel sim-fs__drawer-panel--details" role="region" aria-label="Game details">
            <div className="sim-fs__details-grid">
              <div className="sim-fs__detail">
                <span className="sim-fs__detail-label">OKR Level</span>
                <span className="sim-fs__detail-value">Lvl {state.okrLevel} / 5</span>
                <span className="sim-fs__detail-hint">+{state.okrLevel * 15}% baseline productivity</span>
              </div>
              <div className="sim-fs__detail">
                <span className="sim-fs__detail-label">Employees</span>
                <span className="sim-fs__detail-value">{state.employees.length}</span>
                <span className="sim-fs__detail-hint">
                  {state.employees.filter(e => e.type === "agent").length} agent · {state.employees.filter(e => e.type === "human").length} human
                </span>
              </div>
              <div className="sim-fs__detail">
                <span className="sim-fs__detail-label">Deck</span>
                <span className="sim-fs__detail-value">{state.cardsDeck.length}</span>
                <span className="sim-fs__detail-hint">{state.cardsDiscard.length} in discard</span>
              </div>
              <div className="sim-fs__detail">
                <span className="sim-fs__detail-label">Hype</span>
                <span className="sim-fs__detail-value">{state.hypeTurnsLeft > 0 ? `${state.hypeTurnsLeft}t left` : "—"}</span>
                <span className="sim-fs__detail-hint">+8× P/E during hype</span>
              </div>
            </div>
          </div>
        )}

        {/* Corporate Event Modal */}
        {state.activeEventId && (
          <div className="sim-overlay" role="dialog" aria-modal="true" aria-labelledby="event-title">
            <div className="sim-modal" style={{ maxWidth: "550px", border: "1px solid var(--color-accent-warm-strong)" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "var(--space-2)" }}>
                <span style={{ fontSize: "24px" }}>⚠️</span>
                <h2 className="sim-modal__title" id="event-title" style={{ margin: 0, color: "var(--color-accent-warm-strong)" }}>
                  {EVENT_DATABASE[state.activeEventId]?.title}
                </h2>
              </div>
              <p className="sim-modal__text" style={{ fontSize: "14px", borderBottom: "1px solid var(--color-fg-4)", paddingBottom: "var(--space-4)", marginBottom: "var(--space-4)" }}>
                {EVENT_DATABASE[state.activeEventId]?.description}
              </p>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "var(--space-4)" }}>
                <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-2)" }}>
                  <button
                    onClick={() => {
                      dispatch({ type: "CHOOSE_EVENT_OPTION", option: "A" });
                    }}
                    className="button button--warm"
                    style={{ padding: "12px", fontSize: "12px", justifyContent: "center", fontWeight: "bold" }}
                  >
                    Option A: {EVENT_DATABASE[state.activeEventId]?.optionALabel}
                  </button>
                  <p style={{ fontSize: "11px", color: "var(--color-fg-3)", fontStyle: "italic", textAlign: "center" }}>
                    &quot;{EVENT_DATABASE[state.activeEventId]?.optionAFlavor}&quot;
                  </p>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-2)" }}>
                  <button
                    onClick={() => {
                      dispatch({ type: "CHOOSE_EVENT_OPTION", option: "B" });
                    }}
                    className="button"
                    style={{ padding: "12px", fontSize: "12px", justifyContent: "center", fontWeight: "bold", background: "var(--color-bg-sunken)", border: "1px solid var(--color-fg-3)" }}
                  >
                    Option B: {EVENT_DATABASE[state.activeEventId]?.optionBLabel}
                  </button>
                  <p style={{ fontSize: "11px", color: "var(--color-fg-3)", fontStyle: "italic", textAlign: "center" }}>
                    &quot;{EVENT_DATABASE[state.activeEventId]?.optionBFlavor}&quot;
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* FEBO Card Automat Modal */}
        {state.draftChoices && (
          <div className="sim-overlay" role="dialog" aria-modal="true" aria-labelledby="draft-title">
            <div className="sim-modal" style={{ maxWidth: "800px", border: "2px solid #e8623e" }}>
              <div style={{ textAlign: "center", marginBottom: "var(--space-4)" }}>
                <span style={{ fontSize: "28px" }}>🍔</span>
                <h2 className="sim-modal__title" id="draft-title" style={{ margin: "5px 0 0 0", color: "#e8623e", fontFamily: "var(--font-display)" }}>
                  FEBO Card Automat
                </h2>
                <p className="sim-modal__text" style={{ fontSize: "12px", color: "var(--color-fg-3)" }}>
                  Pull a window to add one card to your hand. Free to draft — pay the play cost later.
                </p>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "var(--space-4)" }}>
                {state.draftChoices.map((cardId) => {
                  const card = CARD_DATABASE[cardId];
                  if (!card) return null;
                  return (
                    <div
                      key={cardId}
                      className="febo-slot"
                      style={{
                        background: "var(--color-bg-sunken)",
                        borderRadius: "6px",
                        padding: "var(--space-3)",
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        position: "relative",
                        overflow: "hidden",
                        boxShadow: "inset 0 0 10px rgba(0,0,0,0.5)"
                      }}
                    >
                      {/* Compartment frame header */}
                      <div
                        style={{
                          background: "#e8623e",
                          color: "white",
                          width: "100%",
                          textAlign: "center",
                          fontSize: "9px",
                          fontWeight: "bold",
                          fontFamily: "var(--font-mono)",
                          padding: "2px 0",
                          borderRadius: "4px 4px 0 0",
                          marginBottom: "var(--space-3)",
                          letterSpacing: "1px"
                        }}
                      >
                        COMPARTMENT ACTIVE
                      </div>

                      {/* Card rendering inside slot */}
                      <div className={`mtg-card mtg-card--${card.class}`} style={{ transform: "scale(0.85)", transformOrigin: "top center", marginBottom: "-20px" }}>
                        <div className="mtg-card__header">
                          <h3 className="mtg-card__name" style={{ fontSize: "13px" }}>{card.name}</h3>
                          <span className="mtg-card__cost">play ${(card.cost / 1000)}k</span>
                        </div>
                        <div className="mtg-card__type">Sorcery — {card.class}</div>
                        <div className="mtg-card__art-window">
                          {renderCardArt(card.id)}
                        </div>
                        <div className="mtg-card__textbox">
                          <p className="mtg-card__rules" style={{ fontSize: "9px" }}>{card.rulesText}</p>
                        </div>
                      </div>

                      {/* Slot Pull Button */}
                      <button
                        onClick={() => {
                          dispatch({ type: "DRAFT_CARD", cardId });
                        }}
                        className="button button--warm"
                        style={{
                          width: "90%",
                          padding: "8px 0",
                          fontSize: "11px",
                          fontWeight: "bold",
                          justifyContent: "center",
                          borderRadius: "4px",
                          border: "1px solid #ff7e5a",
                          boxShadow: "0 4px 6px rgba(0,0,0,0.2)",
                          marginTop: "var(--space-4)"
                        }}
                      >
                        🚪 Pull Window (Draft)
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* Win/Loss Modal */}
        {state.isGameOver && (
          <div className="sim-overlay" role="dialog" aria-modal="true" aria-labelledby="modal-title">
            <div className="sim-modal">
              {state.gameResult === "win" ? (
                <>
                  <h2 className="sim-modal__title sim-modal__title--win" id="modal-title">🏆 Victory!</h2>
                  <p className="sim-modal__text">
                    You have successfully navigated the exponential AI upgrade timeline! Under your guidance,
                    the company optimized documentation, structured build-plan PDPs, and leveraged agentic version updates
                    to scale performance to the moon without breaking the org&apos;s structural limits.
                  </p>
                </>
              ) : (
                <>
                  <h2 className="sim-modal__title sim-modal__title--lose" id="modal-title">💀 Bankruptcy / Failure</h2>
                  <p className="sim-modal__text">
                    {state.cash < -1000000 ? (
                      "Your cash fell below -$1,000,000. In trying to build wrappers and OKR loops, you neglected documentation hygiene. The token compliance audit fines have forced the business into receivership."
                    ) : (
                      `The 30-turn sprint has expired, and you fell short of the ${state.difficulty === "boardroom" ? "$1.1 Billion" : state.difficulty === "reality" ? "$25 Billion" : "$140 Billion"} valuation target. Your organization could not adapt fast enough to the exponential rate of AI upgrades.`
                    )}
                  </p>
                </>
              )}

              <div className="sim-modal__stats">
                <div className="sim-modal__stat-item">
                  <span className="sim-stat__label">Final Valuation</span>
                  <span className="sim-stat__value" style={{ color: "goldenrod" }}>${state.valuation.toLocaleString()}</span>
                </div>
                <div className="sim-modal__stat-item">
                  <span className="sim-stat__label">Final Cash</span>
                  <span className="sim-stat__value">${state.cash.toLocaleString()}</span>
                </div>
                <div className="sim-modal__stat-item">
                  <span className="sim-stat__label">AI Version</span>
                  <span className="sim-stat__value">v{state.agentVersion}</span>
                </div>
                <div className="sim-modal__stat-item">
                  <span className="sim-stat__label">Turns Survived</span>
                  <span className="sim-stat__value">{state.turn - 1} / 30</span>
                </div>
              </div>

              {/* Share Card Block */}
              <div style={{ background: "var(--color-bg-sunken)", border: "var(--border-hairline)", padding: "var(--space-3)", display: "flex", flexDirection: "column", gap: "var(--space-2)" }}>
                <span className="sim-stat__label" style={{ textAlign: "left" }}>Scorecard</span>
                <textarea
                  readOnly
                  value={getShareableText()}
                  style={{
                    width: "100%",
                    height: "80px",
                    background: "transparent",
                    border: "0",
                    fontFamily: "var(--font-mono)",
                    fontSize: "11px",
                    color: "var(--color-fg-2)",
                    resize: "none",
                    outline: "none"
                  }}
                />
                <button
                  onClick={handleCopyToClipboard}
                  className="button button--warm"
                  style={{ width: "100%", padding: "6px 0", fontSize: "11px", justifyContent: "center" }}
                >
                  {copiedText ? "✓ Copied Scorecard" : "Copy Scorecard"}
                </button>
              </div>

              <button
                onClick={() => setShowDifficultySelector(true)}
                className="sim-btn-primary"
                style={{ width: "100%" }}
              >
                Restart Simulation
              </button>
            </div>
          </div>
        )}

        {/* Difficulty Selector Modal */}
        {showDifficultySelector && (
          <div className="sim-overlay" role="dialog" aria-modal="true" aria-labelledby="diff-title">
            <div className="sim-modal" style={{ maxWidth: "600px" }}>
              <h2 className="sim-modal__title" id="diff-title" style={{ fontFamily: "var(--font-display)", color: "var(--color-fg-1)" }}>
                Choose Your Cognitive Reality
              </h2>
              <p className="sim-modal__text">
                Select your starting difficulty parameters for the Agent Inclusive sprint.
              </p>

              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: "var(--space-3)" }}>
                {/* Boardroom */}
                <button
                  onClick={() => handleDifficultySelect("boardroom")}
                  className="mtg-card"
                  style={{ width: "100%", height: "auto", padding: "var(--space-4)", aspectRatio: "auto" }}
                  aria-label="Boardroom Difficulty: $500,000 cash, AI upgrade every 7 turns"
                >
                  <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-2)", textAlign: "left" }}>
                    <span className="sim-stat__value" style={{ color: "#a3be8c" }}>Boardroom</span>
                    <span className="sim-stat__label">Easy Mode</span>
                    <div className="sim-mode__target">Target <strong>$1.1B</strong></div>
                    <div className="sim-mode__detail">~10 min · ≈80% win rate</div>
                    <p style={{ fontSize: "11px", color: "var(--color-fg-2)", margin: "0" }}>
                      Start with <strong>$500,000</strong> cash.<br />
                      AI upgrades slowly (every <strong>7 turns</strong>).<br />
                      Comfortable room to build clean Markdown documentation before the compliance audits drop.
                    </p>
                  </div>
                </button>

                {/* Reality */}
                <button
                  onClick={() => handleDifficultySelect("reality")}
                  className="mtg-card mtg-card--selected"
                  style={{ width: "100%", height: "auto", padding: "var(--space-4)", aspectRatio: "auto" }}
                  aria-label="Reality Difficulty: $250,000 cash, AI upgrade every 5 turns"
                >
                  <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-2)", textAlign: "left" }}>
                    <span className="sim-stat__value" style={{ color: "goldenrod" }}>Reality</span>
                    <span className="sim-stat__label">Standard Mode</span>
                    <div className="sim-mode__target">Target <strong>$25B</strong></div>
                    <div className="sim-mode__detail">~10 min · ≈45% win rate</div>
                    <p style={{ fontSize: "11px", color: "var(--color-fg-2)", margin: "0" }}>
                      Start with <strong>$250,000</strong> cash.<br />
                      AI upgrades every <strong>5 turns</strong>.<br />
                      The authentic consulting experience. Balance employee loyalty and AI version upgrades.
                    </p>
                  </div>
                </button>

                {/* ZIRP Nightmare */}
                <button
                  onClick={() => handleDifficultySelect("zirp")}
                  className="mtg-card"
                  style={{ width: "100%", height: "auto", padding: "var(--space-4)", aspectRatio: "auto", borderColor: "var(--color-accent-warm)" }}
                  aria-label="ZIRP Nightmare Difficulty: $30,000 cash, AI upgrade every 4 turns"
                >
                  <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-2)", textAlign: "left" }}>
                    <span className="sim-stat__value" style={{ color: "var(--color-accent-warm-strong)" }}>ZIRP Nightmare</span>
                    <span className="sim-stat__label">Hard Mode</span>
                    <div className="sim-mode__target">Target <strong>$140B</strong></div>
                    <div className="sim-mode__detail">~12 min · ≈10% win rate</div>
                    <p style={{ fontSize: "11px", color: "var(--color-fg-2)", margin: "0" }}>
                      Start with <strong>$30,000</strong> cash (only enough to hire exactly 1 worker).<br />
                      AI upgrades at neck-breaking speeds (every <strong>4 turns</strong>).<br />
                      No room for error. One bad OKR redefinition will bankrupt you.
                    </p>
                  </div>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Tutorial / Help Overlay Modal */}
        {showTutorial && (
          <div className="sim-overlay" role="dialog" aria-modal="true" aria-labelledby="tutorial-title">
            <div className="sim-modal" style={{ maxWidth: "600px", textAlign: "left" }}>
              <h2 className="sim-modal__title" id="tutorial-title" style={{ fontFamily: "var(--font-display)", color: "var(--color-fg-1)" }}>
                Interactive Tutorial
              </h2>
              <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-4)", fontSize: "13px", color: "var(--color-fg-2)", maxHeight: "400px", overflowY: "auto", paddingRight: "10px" }}>
                <p>
                  Welcome to <strong>Agent Inclusive Sim</strong>, a corporate resource game that dramatises Rutger&apos;s org leadership principles. 
                  Your goal is to reach the valuation target for your chosen difficulty (Boardroom <strong>$1.1B</strong>, Reality <strong>$25B</strong>, ZIRP <strong>$140B</strong>) within <strong>30 turns</strong>. If you run out of cash (&lt; -$1,000,000), you go bankrupt and lose. Difficulty levels target roughly 80% / 45% / 10% win rates against the same starting strategy. Each turn, you can take <strong>one</strong> hire, <strong>one</strong> OKR redefine, <strong>one</strong> card, and <strong>one</strong> promotion — pacing matters more than spending.
                </p>

                <h3 style={{ fontFamily: "var(--font-mono)", fontSize: "12px", color: "var(--color-fg-1)", textTransform: "uppercase", margin: "0" }}>
                  The Four Thesis Loops
                </h3>
                <ol style={{ paddingLeft: "20px", display: "flex", flexDirection: "column", gap: "var(--space-2)", margin: "0" }}>
                  <li>
                    <strong>Velocity vs. The Clock:</strong> AI frontier versions upgrade automatically. High AI versions provide massive human productivity multipliers, but if you do not have a <em>Markdown Wiki</em> active, they cause <strong>Token Leakage</strong> fines (cash drain) and employee frustration (loyalty loss).
                  </li>
                  <li>
                    <strong>Documentation Hygiene:</strong> Play the <em>Markdown Wiki</em> card. This active documentation cuts employee onboarding times in half (from 6 turns to 3), allows Cognitive Agents to function, and negates compliance audit fees.
                  </li>
                  <li>
                    <strong>Build-Plan PDPs:</strong> You can promote employees to Level 2 or 3 to increase their productivity and inspire teammates. But if you promote them without first playing a <em>Build-Plan PDP</em> card on them, they suffer a <strong>30% productivity penalty</strong> and <strong>double the loyalty decay</strong>.
                  </li>
                  <li>
                    <strong>OKR Churn:</strong> Adjusting OKRs (via the fixed menu or cards) yields permanent multipliers to productivity, but inflicts an immediate **-40% alignment meeting penalty** on productivity for that turn and increases loyalty decay.
                  </li>
                </ol>

                <h3 style={{ fontFamily: "var(--font-mono)", fontSize: "12px", color: "var(--color-fg-1)", textTransform: "uppercase", margin: "0" }}>
                  Personnel Archetypes
                </h3>
                <ul style={{ paddingLeft: "20px", display: "flex", flexDirection: "column", gap: "var(--space-2)", margin: "0" }}>
                  <li>
                    <strong>Humans (Edgar, Jochem, Lous):</strong> Generate revenue based on level. Loyalty decays each turn. Reset loyalty to 100 on promotion. Low loyalty (&lt;= 0) causes resignation.
                  </li>
                  <li>
                    <strong>Cognitive Agents (Hermes):</strong> Hired for $15,000. Under active documentation, they add $50k revenue and boost human teammates by 1.25x. Without documentation, they run amok, cost $10k/turn, and decay human loyalty by -4/turn.
                  </li>
                </ul>

                <h3 style={{ fontFamily: "var(--font-mono)", fontSize: "12px", color: "var(--color-fg-1)", textTransform: "uppercase", margin: "0" }}>
                  Tips for Success
                </h3>
                <p style={{ margin: "0" }}>
                  - Don&apos;t build AI version wrappers (Wrappers card) early on without first playing the <em>Markdown Wiki</em> card.
                  - Keep a close eye on employee loyalty. Feed them a <em>Broodje Kroket Lunch</em> to keep them loyal.
                  - Keep positive cash reserves to compound a <strong>2% dividend yield</strong> every turn.
                </p>
              </div>

              <button
                onClick={() => setShowTutorial(false)}
                className="sim-btn-primary"
                style={{ width: "100%" }}
              >
                Let&apos;s Play
              </button>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
