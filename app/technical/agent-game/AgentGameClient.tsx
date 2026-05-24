"use client";

import React, { useReducer, useEffect, useState, useRef } from "react";
import Link from "next/link";
import { Nav } from "@/components/nav/Nav";
import { Footer } from "@/components/footer/Footer";
import { AppChrome } from "@/components/chrome/AppChrome";
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
  | { type: "DRAFT_CARD"; cardId: string };

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

  const winThresholdLabel = difficulty === "boardroom" ? "$10B" : difficulty === "reality" ? "$50B" : "$100B";

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
      if (state.isGameOver || !state.draftChoices) return state;
      const card = CARD_DATABASE[action.cardId];
      if (!card) return state;

      const logs = [`🃏 Drafted Card: ${card.name} has been added to your hand and deck discard pile.`];

      // Add to hand and discard pile (deck structure)
      const nextHand = [...state.cardsHand, action.cardId];
      const nextDiscard = [action.cardId, ...state.cardsDiscard];

      return {
        ...state,
        cardsHand: nextHand,
        cardsDiscard: nextDiscard,
        draftChoices: null, // Clear draft overlay blocker
        eventLog: [...state.eventLog, ...logs],
      };
    }

    case "EMPLOY_WORKER": {
      if (state.isGameOver) return state;
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
        eventLog: [
          ...state.eventLog,
          `💼 Hired employee ${name} (${traitInfo.displayName}) for $30,000 (starts onboarding: ${state.hasDocumentation ? "3" : "6"} turns left).`,
        ],
      };
    }

    case "EMPLOY_AGENT": {
      if (state.isGameOver) return state;
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
        eventLog: [
          ...state.eventLog,
          `🤖 Hired AI Cognitive Agent ${name} for $15,000. Required: Markdown Wiki documentation active for proper synergy.`,
        ],
      };
    }

    case "PROMOTE_WORKER": {
      if (state.isGameOver) return state;
      const emp = state.employees.find((e) => e.id === action.employeeId);
      if (!emp) return state;
      if (emp.type === "agent") {
        return {
          ...state,
          eventLog: [...state.eventLog, `Cannot promote ${emp.name}: AI Agents do not receive human title promotions.`],
        };
      }
      if (emp.promotionLevel >= 3) {
        return {
          ...state,
          eventLog: [...state.eventLog, `Cannot promote ${emp.name}: already at max Level 3.`],
        };
      }

      const cost = emp.promotionLevel === 1 ? 15000 : 40000;
      if (state.cash < cost) {
        return {
          ...state,
          eventLog: [
            ...state.eventLog,
            `Cannot promote ${emp.name}: insufficient cash (requires $${cost.toLocaleString()}).`,
          ],
        };
      }

      const nextLevel = (emp.promotionLevel + 1) as 1 | 2 | 3;
      const hasPDP = emp.hasPDP;
      const logs = [`📈 Promoted ${emp.name} to Level ${nextLevel} for $${cost.toLocaleString()}.`];

      if (!hasPDP) {
        logs.push(
          `⚠️ WARNING: ${emp.name} promoted without a Build-Plan PDP! -30% productivity penalty and double loyalty decay applied.`
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
            logs.push(`✨ ${e.name} is inspired by ${emp.name}'s promotion! (+50% productivity for 5 turns)`);
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
        eventLog: [...state.eventLog, ...logs],
      };
    }

    case "REDEFINE_OKRS": {
      if (state.isGameOver) return state;
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
            logs.push(`📋 Applied Build-Plan PDP to ${e.name}. They can now be promoted safely.`);
            return { ...e, hasPDP: true };
          }
          return e;
        });
      } else if (card.id === "kroket_lunch") {
        updatedEmployees = updatedEmployees.map((e) => {
          if (e.id === action.targetEmployeeId) {
            const isMarieFurie = e.traitId === "furie";
            const loyaltyGain = isMarieFurie ? 50 : 35;
            logs.push(`🍔 ${e.name} ate two kroketten. Loyalty +${loyaltyGain}${isMarieFurie ? " (Marie Furie Radical Energy bonus!)" : ""}, but fell asleep ('tapped') for 1 turn.`);
            return { ...e, loyalty: Math.min(100, e.loyalty + loyaltyGain), isAsleep: true };
          }
          return e;
        });
      } else if (card.id === "hei_sessie") {
        const promoter = updatedEmployees.find((e) => e.id === action.targetEmployeeId);
        if (promoter) {
          logs.push(`🌲 Hei-sessie: ${promoter.name} is inspired (+20 Loyalty, +50% productivity for 5 turns).`);
          updatedEmployees = updatedEmployees.map((e) => {
            if (e.id === action.targetEmployeeId) {
              return { ...e, loyalty: Math.min(100, e.loyalty + 20), inspirationTurnsLeft: 5 };
            } else if (e.promotionLevel < promoter.promotionLevel && e.type === "human") {
              logs.push(`✨ ${e.name} is inspired by ${promoter.name}'s leadership!`);
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
              `📊 ${e.name} attended PowerPoint Clinic. Loyalty +40, but PowerPoint Poisoning applied (-20% productivity for 3 turns).`
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
            logs.push(`🎉 ${e.name} is now fully onboarded and ready at 100% capacity.`);
          } else {
            logs.push(`📈 ${e.name} onboarding progress: ${nextOnboard}/${employeeOnboardingTarget} turns.`);
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
            logs.push(`⚠️ ${e.name} is hallucinating due to lack of docs. Core alignment drops.`);
          }
          if (agentLoyalty > 0) {
            activeEmployeesAfterTurn.push({
              ...e,
              loyalty: agentLoyalty,
              isAsleep: false,
            });
          } else {
            logs.push(`❌ CRASH: AI Agent ${e.name} has suffered token collapse and crashed.`);
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
          logs.push(`❌ RESIGNATION: ${e.name} has resigned in protest of corporate alignment meetings.`);
        } else if (nextLoyalty <= 20) {
          logs.push(
            `⚠️ WARNING: ${e.name} loyalty is critical (${Math.floor(nextLoyalty)}%)! Promote them or play Broodje Kroket.`
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

      const winThreshold = state.difficulty === "boardroom" ? 10000000000 : state.difficulty === "reality" ? 50000000000 : 100000000000;
      const winThresholdLabel = state.difficulty === "boardroom" ? "$10 Billion" : state.difficulty === "reality" ? "$50 Billion" : "$100 Billion";

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

const playSound = (soundName: string) => {
  if (typeof window === "undefined") return;
  try {
    const audio = new Audio(`/audio/sfx/${soundName}.mp3`);
    audio.volume = 0.25; // Subtle, non-intrusive volume
    audio.play().catch((err) => {
      if (err.name !== "AbortError") {
        console.warn("Audio playback failed:", err);
      }
    });
  } catch (e) {
    console.warn("Audio init failed:", e);
  }
};

const playVoice = (voiceName: string) => {
  if (typeof window === "undefined") return;
  try {
    const audio = new Audio(`/audio/voice/${voiceName}.mp3`);
    audio.volume = 0.45; // Balanced voiceover volume
    audio.play().catch((err) => {
      if (err.name !== "AbortError") {
        console.warn("Voice playback failed:", err);
      }
    });
  } catch (e) {
    console.warn("Voice init failed:", e);
  }
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

  const [musicPlaying, setMusicPlaying] = useState(false);
  const [musicVolume, setMusicVolume] = useState(0.15);
  const bgMusicRef = useRef<HTMLAudioElement | null>(null);

  // Initialize background music
  useEffect(() => {
    if (typeof window === "undefined") return;
    const audio = new window.Audio("/audio/music/background.mp3");
    audio.loop = true;
    bgMusicRef.current = audio;

    return () => {
      audio.pause();
      bgMusicRef.current = null;
    };
  }, []);

  // Update play state
  useEffect(() => {
    if (!bgMusicRef.current) return;
    if (musicPlaying) {
      bgMusicRef.current.play().catch((err) => {
        if (err.name !== "AbortError") {
          console.warn("Background music play failed:", err);
        }
      });
    } else {
      bgMusicRef.current.pause();
    }
  }, [musicPlaying]);

  // Update volume state
  useEffect(() => {
    if (bgMusicRef.current) {
      bgMusicRef.current.volume = musicVolume;
    }
  }, [musicVolume]);
  
  const logContainerRef = useRef<HTMLDivElement | null>(null);
  const cardElementsRef = useRef<(HTMLDivElement | null)[]>([]);
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

  // 5. Audio effects triggers for turn progression and game ending states
  useEffect(() => {
    if (state.turn > 1 && !state.isGameOver) {
      playSound("card-draw");
    }
  }, [state.turn, state.isGameOver]);

  useEffect(() => {
    if (state.isGameOver) {
      if (state.gameResult === "win") {
        playSound("game-win");
      } else if (state.gameResult === "lose") {
        playSound("game-lose");
      }
    }
  }, [state.isGameOver, state.gameResult]);

  // 6. Voiceover playback when a new employee is hired
  const prevEmployeesCountRef = useRef(state.employees.length);
  useEffect(() => {
    if (state.employees.length > prevEmployeesCountRef.current && state.turn > 1) {
      const newEmp = state.employees[state.employees.length - 1];
      if (newEmp && newEmp.type === "human") {
        const voiceKey = ["edgar", "jochem", "lous"].includes(newEmp.name.toLowerCase())
          ? newEmp.name.toLowerCase()
          : (newEmp.traitId || newEmp.name.toLowerCase());
        setTimeout(() => {
          playVoice(voiceKey);
        }, 300);
      }
    }
    prevEmployeesCountRef.current = state.employees.length;
  }, [state.employees, state.turn]);

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
    playSound("ui-click");
    dispatch({ type: "RESET_GAME", difficulty });
    setShowDifficultySelector(false);
    setSelectedCardId(null);
  };

  const handleCardClick = (cardId: string) => {
    if (state.isGameOver || state.activeEventId || state.draftChoices) return;
    playSound("ui-click");
    if (selectedCardId === cardId) {
      setSelectedCardId(null);
    } else {
      setSelectedCardId(cardId);
    }
  };

  const handlePlayNoTargetCard = () => {
    if (!selectedCardId || state.activeEventId || state.draftChoices) return;
    playSound("card-play");
    dispatch({ type: "PLAY_CARD", cardId: selectedCardId });
    setSelectedCardId(null);
  };

  const handleEmployeeClick = (employeeId: string) => {
    if (state.isGameOver || state.activeEventId || state.draftChoices) return;

    if (selectedCardId) {
      const card = CARD_DATABASE[selectedCardId];
      if (card && card.requiresTarget) {
        playSound("card-play");
        dispatch({ type: "PLAY_CARD", cardId: selectedCardId, targetEmployeeId: employeeId });
        setSelectedCardId(null);
      }
    }
  };

  const handlePromoteWorker = (employeeId: string) => {
    if (state.isGameOver || state.activeEventId || state.draftChoices) return;
    playSound("ui-click");
    dispatch({ type: "PROMOTE_WORKER", employeeId });

    // Play voiceover for promotion
    const emp = state.employees.find((e) => e.id === employeeId);
    if (emp && emp.type === "human") {
      const voiceKey = ["edgar", "jochem", "lous"].includes(emp.name.toLowerCase())
        ? emp.name.toLowerCase()
        : (emp.traitId || emp.name.toLowerCase());
      setTimeout(() => {
        playVoice(voiceKey);
      }, 300);
    }
  };

  const handleHireWorker = () => {
    if (state.activeEventId || state.draftChoices) return;
    playSound("ui-click");
    dispatch({ type: "EMPLOY_WORKER" });
  };

  const handleHireAgent = () => {
    if (state.activeEventId || state.draftChoices) return;
    playSound("ui-click");
    dispatch({ type: "EMPLOY_AGENT" });
  };

  const handleRedefineOkrs = () => {
    if (state.activeEventId || state.draftChoices) return;
    playSound("ui-click");
    dispatch({ type: "REDEFINE_OKRS" });
  };

  const handleEndTurn = () => {
    if (state.activeEventId || state.draftChoices) return;
    playSound("turn-end");
    dispatch({ type: "END_TURN" });
    setSelectedCardId(null);
  };

  const handleCardKeyDown = (e: React.KeyboardEvent, cardId: string) => {
    if (e.key === " " || e.key === "Enter") {
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

  return (
    <div style={{ position: "relative" }}>
      <Nav />

      <main className="sim-container sim-v2" id="game-content">
        <header className="sim-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", flexWrap: "wrap", gap: "var(--space-4)" }}>
          <div>
            <Link href="/#technical" className="sim-header__back" style={{ display: "block" }}>
              <span>←</span> Back to Technical Index
            </Link>
            <h1 className="sim-header__title">Agent Inclusive.</h1>
            <p className="sim-header__desc">
              Organisations take 12 months to restructure. AI models update every 6 weeks. Fulfill the thesis:
              structure your documentation and PDPs so your human employees survive exponential AI upgrades
              and hit a <strong>{state.difficulty === "boardroom" ? "$10 Billion" : state.difficulty === "reality" ? "$50 Billion" : "$100 Billion"} valuation</strong> within a <strong>30-turn sprint</strong>.
            </p>
          </div>
          <div style={{ display: "flex", gap: "var(--space-3)", alignItems: "center", flexWrap: "wrap" }}>
            {/* Background Music Controller */}
            <div style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              padding: "4px 10px",
              background: "rgba(255,255,255,0.03)",
              border: "1px solid rgba(255,255,255,0.08)",
              borderRadius: "20px",
              fontSize: "11px",
              color: "var(--color-fg-2)",
              boxShadow: "inset 0 1px 2px rgba(255,255,255,0.05)"
            }}>
              <button
                onClick={() => setMusicPlaying(prev => !prev)}
                style={{
                  padding: "4px 10px",
                  fontSize: "10px",
                  fontWeight: "bold",
                  borderRadius: "15px",
                  background: musicPlaying ? "var(--color-accent-warm)" : "rgba(255,255,255,0.08)",
                  color: musicPlaying ? "#000" : "var(--color-fg-1)",
                  border: "none",
                  cursor: "pointer",
                  transition: "all 0.2s ease",
                  display: "flex",
                  alignItems: "center",
                  gap: "4px"
                }}
                title={musicPlaying ? "Mute Background Music" : "Play Background Music"}
              >
                <span style={{ fontSize: "12px" }}>{musicPlaying ? "♫" : "🔇"}</span>
                {musicPlaying ? "BGM ON" : "BGM OFF"}
              </button>
              <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                <span style={{ opacity: 0.6, fontSize: "9px", textTransform: "uppercase", letterSpacing: "0.5px" }}>Vol</span>
                <input
                  type="range"
                  min="0"
                  max="0.4"
                  step="0.02"
                  value={musicVolume}
                  onChange={(e) => setMusicVolume(parseFloat(e.target.value))}
                  style={{
                    width: "55px",
                    cursor: "pointer",
                    accentColor: "var(--color-accent-warm)",
                    height: "3px",
                    borderRadius: "2px"
                  }}
                  title={`Music Volume: ${Math.round(musicVolume * 250)}%`}
                />
              </div>
            </div>

            <Link href="/business/agent-inclusive" className="button button--warm" style={{ padding: "6px 12px", fontSize: "11px" }}>
              Read the thesis →
            </Link>
            <button
              onClick={() => setShowTutorial(true)}
              className="button"
              style={{ padding: "6px 12px", fontSize: "11px" }}
            >
              How to Play (Tutorial)
            </button>
          </div>
        </header>

        {/* Global Dashboard */}
        <section className="sim-dashboard" aria-label="Game Dashboard">
          <div className="sim-stat" title="Turns survived out of 30 sprint turns.">
            <span className="sim-stat__label">Sprint Time</span>
            <span className="sim-stat__value sim-stat__value--highlight">
              Turn {state.turn} <span style={{ fontSize: "12px", color: "var(--color-fg-3)" }}>/ 30</span>
            </span>
          </div>
          <div className="sim-stat" title="Available cash. Bankruptcy occurs if this drops below -$1,000,000. Earns a 2% dividend yield at the end of each turn if positive.">
            <span className="sim-stat__label">Company Cash</span>
            <span className={`sim-stat__value ${state.cash < 0 ? "sim-stat__value--negative" : "sim-stat__value--positive"}`}>
              ${state.cash.toLocaleString()}
            </span>
          </div>
          <div className="sim-stat" title={`Valuation is based on (annualized revenue * P/E multiplier) + cash. You win when this hits ${state.difficulty === "boardroom" ? "$10B" : state.difficulty === "reality" ? "$50B" : "$100B"}. P/E multiplier increases with AI updates if documentation is active.`}>
            <span className="sim-stat__label">Valuation (Goal: {state.difficulty === "boardroom" ? "$10B" : state.difficulty === "reality" ? "$50B" : "$100B"})</span>
            <span className="sim-stat__value sim-stat__value--highlight" style={{ color: "goldenrod" }}>
              ${state.valuation.toLocaleString()}
            </span>
          </div>
          <div className="sim-stat" title="Current frontier AI version. Upgrades automatically, accelerating human productivity.">
            <span className="sim-stat__label">AI Version</span>
            <span className="sim-stat__value" style={{ display: "flex", alignItems: "center", gap: "6.5px", flexWrap: "wrap" }}>
              v{state.agentVersion}
              <span style={{ fontSize: "10px", color: "var(--color-accent-warm)" }}>
                ({turnsToUpgrade}t to next)
              </span>
              {state.agentVersion > 2 && !state.hasDocumentation && (
                <span className="sim-stat__warning-badge" title="Token Leakage Active: causing cash fines and loyalty decay!">
                  ⚠️ Leakage
                </span>
              )}
            </span>
          </div>
          <div className="sim-stat" title="Adjust OKRs to permanently increase human productivity. However, redefining OKRs causes an immediate -40% alignment meeting productivity penalty for that turn and increases base loyalty decay.">
            <span className="sim-stat__label">OKR Level</span>
            <span className="sim-stat__value">
              Lvl {state.okrLevel} <span style={{ fontSize: "10px", color: "var(--color-fg-3)" }}>/ 5</span>
            </span>
          </div>
          <div className="sim-stat" title="Markdown Wiki status. Reduces onboarding times from 6 to 3 turns, eliminates compliance fines, and connects homelab AI agents correctly.">
            <span className="sim-stat__label">Documentation</span>
            <span className={`sim-stat__value ${state.hasDocumentation ? "sim-stat__value--positive" : "sim-stat__value--negative"}`}>
              {state.hasDocumentation ? "WIKI ACTIVE" : "NOT READY"}
            </span>
          </div>
        </section>

        {/* Main Grid */}
        <div className="sim-grid">
          {/* Main Left: Board & Hand */}
          <div className="sim-main">
            {/* The Board: Active Employees */}
            <section className="sim-panel" aria-labelledby="board-title">
              <h2 className="sim-panel__title" id="board-title">
                <span>Active Personnel Field</span>
                <span style={{ fontSize: "10px", color: "var(--color-fg-3)" }}>
                  {state.employees.length} Active Node{state.employees.length !== 1 && "s"}
                </span>
              </h2>

              {selectedCard && selectedCard.requiresTarget && (
                <div
                  className="eyebrow eyebrow--warm"
                  style={{
                    padding: "var(--space-2)",
                    background: "rgba(200, 85, 61, 0.1)",
                    border: "var(--border-accent)",
                    textAlign: "center",
                    fontSize: "12px",
                  }}
                >
                  🎯 Select an Employee below to target with <strong>{selectedCard.name}</strong>
                </div>
              )}

              <div className="sim-employees-grid">
                {state.employees.length === 0 ? (
                  <div style={{ gridColumn: "1/-1", textAlign: "center", padding: "var(--space-6)", color: "var(--color-fg-3)" }}>
                    No active personnel. Your productivity is 0%. Hire workers immediately to generate revenue!
                  </div>
                ) : (
                  state.employees.map((emp) => {
                    const onboardingTarget = state.hasDocumentation ? 3 : 6;
                    const employeeOnboardingTarget = emp.traitId === "zweistein" ? Math.max(1, Math.floor(onboardingTarget / 2)) : onboardingTarget;
                    const isOnboarded = emp.turnsOnboarded >= employeeOnboardingTarget;
                    const isCriticalLoyalty = emp.loyalty <= 20;
                    const traitInfo = emp.traitId ? TRAIT_DATABASE[emp.traitId] : undefined;

                    return (
                      <div
                        key={emp.id}
                        onClick={() => handleEmployeeClick(emp.id)}
                        onKeyDown={(e) => handleEmployeeKeyDown(e, emp.id)}
                        tabIndex={selectedCard && selectedCard.requiresTarget ? 0 : -1}
                        className={`mtg-card mtg-card--worker 
                          ${selectedCard && selectedCard.requiresTarget ? "mtg-card--targetable" : ""} 
                          ${emp.type === "agent" && !state.hasDocumentation ? "mtg-card--agent-malfunction" : ""}
                          ${emp.inspirationTurnsLeft > 0 ? "mtg-card--worker-inspired" : ""} 
                          ${emp.isAsleep ? "mtg-card--tapped" : ""}`}
                        role="button"
                        aria-label={`Personnel: ${emp.name}, ${emp.type === "agent" ? "Cognitive Agent" : `Level ${emp.promotionLevel} Human`}, Loyalty ${emp.loyalty} percent`}
                      >
                        <div className="mtg-card__header">
                          <h3 className="mtg-card__name">{emp.name}</h3>
                          <span className="mtg-card__cost">
                            {emp.type === "agent" ? "Hermes" : `Lvl ${emp.promotionLevel}`}
                          </span>
                        </div>

                        <div className="mtg-card__type">
                          {emp.type === "agent" ? "Cognitive AI Agent" : "Legendary Human Employee"}
                        </div>

                        <div className="mtg-card__art-window">
                          {renderEmployeeArt(emp.type)}
                          {emp.isAsleep && (
                            <div className="zzz-container">
                              <span className="zzz-letter zzz-letter--1">Z</span>
                              <span className="zzz-letter zzz-letter--2">z</span>
                              <span className="zzz-letter zzz-letter--3">z</span>
                            </div>
                          )}
                        </div>

                        <div className="mtg-card__textbox">
                          <div className="mtg-card__badge-row">
                            <span className="mtg-card__badge mtg-card__badge--pdp">
                              {emp.hasPDP ? "PDP Locked" : "No PDP"}
                            </span>
                            {traitInfo && (
                              <span className="mtg-card__badge mtg-card__badge--trait" title={traitInfo.description}>
                                {traitInfo.displayName}
                              </span>
                            )}
                            {emp.inspirationTurnsLeft > 0 && (
                              <span className="mtg-card__badge mtg-card__badge--inspired">
                                Inspired ({emp.inspirationTurnsLeft}t)
                              </span>
                            )}
                            {emp.isAsleep && (
                              <span className="mtg-card__badge mtg-card__badge--asleep">
                                Zzz... (Asleep)
                              </span>
                            )}
                            {emp.pptPoisoningTurns > 0 && (
                              <span
                                className="mtg-card__badge mtg-card__badge--asleep"
                                style={{ borderColor: "#ffa000", color: "#ffa000" }}
                              >
                                PPT fine ({emp.pptPoisoningTurns}t)
                              </span>
                            )}
                          </div>

                          <p className="mtg-card__rules" style={{ fontSize: "10px" }}>
                            {emp.type === "agent" ? (
                              state.hasDocumentation ? (
                                <span style={{ color: "#a3be8c" }}>
                                  Documented Synergy: Multiplies human teammates productivity by 1.25x (+$50,000 turn revenue).
                                </span>
                              ) : (
                                <span style={{ color: "var(--color-accent-warm)" }}>
                                  Token Hallucination: Troublemaker. -$10,000/turn maintenance, -4 loyalty decay to humans.
                                </span>
                              )
                            ) : !isOnboarded ? (
                              <span style={{ color: "var(--color-accent-warm)" }}>
                                Onboarding: {emp.turnsOnboarded}/{employeeOnboardingTarget} turns (10% productivity).
                              </span>
                            ) : (
                              <span>
                                Fully onboarded. Base Salary: $
                                {((emp.promotionLevel === 1 ? 8000 : emp.promotionLevel === 2 ? 18000 : 45000) * (emp.traitId === "rump" ? 1.5 : 1)).toLocaleString()}
                                /turn.
                              </span>
                            )}
                          </p>

                          {traitInfo && (
                            <div style={{ borderTop: "1px dashed rgba(255,255,255,0.15)", paddingTop: "4px", marginTop: "4px", marginBottom: "4px" }}>
                              <strong style={{ color: "goldenrod", fontSize: "9px" }}>{traitInfo.passiveName}: </strong>
                              <span style={{ fontSize: "8.5px", color: "var(--color-fg-2)" }}>{traitInfo.description}</span>
                            </div>
                          )}

                          <p className="mtg-card__flavor" style={{ fontSize: "9px" }}>
                            {emp.type === "agent"
                              ? "Een docker container die 'm rauw pakt van de homelab VLAN."
                              : emp.name === "Edgar"
                              ? "Edgar houdt van hiërarchie and bullet points."
                              : emp.name === "Jochem"
                              ? "Jochem is de spil in het koffie-apparaat netwerk."
                              : emp.name === "Lous"
                              ? "Lous documenteert alles in ASCII."
                              : "Zweet op het voorhoofd en neus naar voren."}
                          </p>
                        </div>

                        {/* Promotion Action Button */}
                        {emp.type !== "agent" && (
                          <div className="sim-row__promote" onClick={(e) => e.stopPropagation()}>
                            <button
                              onClick={() => handlePromoteWorker(emp.id)}
                              disabled={emp.promotionLevel >= 3 || state.cash < (emp.promotionLevel === 1 ? 15000 : 40000)}
                              className="sim-btn-fixed"
                              aria-label={`Promote ${emp.name} to Level ${emp.promotionLevel + 1}`}
                            >
                              <span>Promote</span>
                              <span className="sim-btn-fixed__cost">
                                ${ (emp.promotionLevel === 1 ? 15000 : 40000).toLocaleString() }
                              </span>
                            </button>
                          </div>
                        )}

                        <div className={`mtg-card__loyalty ${isCriticalLoyalty ? "mtg-card__loyalty--critical" : ""}`}>
                          {emp.loyalty}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </section>

            {/* Tactical Cards Hand */}
            <section className="sim-panel" aria-labelledby="hand-title">
              <h2 className="sim-panel__title" id="hand-title">
                <span>Tactical Hand Shelf</span>
                <span style={{ fontSize: "10px", color: "var(--color-fg-3)" }}>
                  {state.cardsHand.length} Card{state.cardsHand.length !== 1 && "s"} in Hand (Deck: {state.cardsDeck.length})
                </span>
              </h2>

              {selectedCard && !selectedCard.requiresTarget && (
                <div style={{ display: "flex", justifyContent: "center", marginBottom: "var(--space-2)" }}>
                  <button
                    onClick={handlePlayNoTargetCard}
                    className="sim-btn-primary"
                    style={{ maxWidth: "300px", padding: "8px 16px" }}
                  >
                    Play {selectedCard.name}
                  </button>
                </div>
              )}

              <div className="sim-hand-shelf" role="group" aria-label="Cards in hand">
                {state.cardsHand.map((cardId, index) => {
                  const card = CARD_DATABASE[cardId];
                  if (!card) return null;
                  const isSelected = selectedCardId === cardId;

                  return (
                    <div
                      key={`${cardId}-${index}`}
                      onClick={() => handleCardClick(cardId)}
                      onKeyDown={(e) => handleCardKeyDown(e, cardId)}
                      ref={(el) => { cardElementsRef.current[index] = el; }}
                      tabIndex={0}
                      className={`mtg-card mtg-card--${card.class} ${isSelected ? "mtg-card--selected" : ""}`}
                      onMouseEnter={() => playSound("ui-hover")}
                      role="button"
                      aria-label={`${card.name}, Cost: ${card.cost} cash. ${card.rulesText}`}
                    >
                      <div className="mtg-card__header">
                        <h3 className="mtg-card__name" style={{ fontSize: "13px" }}>{card.name}</h3>
                        <span className="mtg-card__cost">${(card.cost / 1000)}k</span>
                      </div>

                      <div className="mtg-card__type">
                        Sorcery — {card.class}
                      </div>

                      <div className="mtg-card__art-window">
                        {renderCardArt(card.id)}
                      </div>

                      <div className="mtg-card__textbox">
                        <p className="mtg-card__rules">{card.rulesText}</p>
                        <p className="mtg-card__flavor">{card.flavor}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>
          </div>

          {/* Right Column: Actions & Event Log */}
          <aside className="sim-sidebar">
            {/* Fixed Actions Panel */}
            <section className="sim-panel" aria-labelledby="actions-title">
              <h2 className="sim-panel__title" id="actions-title">Fixed Sprint Options</h2>

              {state.freezeHiringNextTurn && (
                <div style={{ color: "var(--color-accent-warm-strong)", fontSize: "11px", marginBottom: "var(--space-2)", fontFamily: "var(--font-mono)", fontWeight: "bold" }}>
                  ❄️ BOARD ORDER: HIRING IS FROZEN THIS TURN
                </div>
              )}

              <div className="sim-actions-grid">
                <button
                  onClick={handleHireWorker}
                  disabled={state.cash < 30000 || state.activeEventId !== null || state.draftChoices !== null || !!state.freezeHiringNextTurn}
                  className="sim-btn-fixed"
                  aria-label="Employ a new human worker for $30,000"
                >
                  <span>Hire Human</span>
                  <span className="sim-btn-fixed__cost">$30,000</span>
                </button>

                <button
                  onClick={handleHireAgent}
                  disabled={state.cash < 15000 || state.activeEventId !== null || state.draftChoices !== null || !!state.freezeHiringNextTurn}
                  className="sim-btn-fixed"
                  aria-label="Hire AI Cognitive Agent for $15,000"
                >
                  <span>Hire Cognitive Agent</span>
                  <span className="sim-btn-fixed__cost">$15,000</span>
                </button>

                <button
                  onClick={handleRedefineOkrs}
                  disabled={state.cash < 10000 || state.okrLevel >= 5 || state.activeEventId !== null || state.draftChoices !== null}
                  className="sim-btn-fixed"
                  aria-label="Redefine corporate OKRs for $10,000"
                >
                  <span>Redefine OKRs</span>
                  <span className="sim-btn-fixed__cost">$10,000</span>
                </button>
              </div>

              <div style={{ marginTop: "var(--space-4)" }}>
                <button
                  onClick={handleEndTurn}
                  disabled={state.activeEventId !== null || state.draftChoices !== null}
                  className="sim-btn-primary"
                  aria-label="End Sprint Turn"
                >
                  End Turn
                </button>
                <div
                  style={{
                    textAlign: "center",
                    marginTop: "var(--space-2)",
                    fontSize: "10px",
                    color: "var(--color-fg-3)",
                    fontFamily: "var(--font-mono)",
                  }}
                >
                  Shortcut:{" "}
                  <kbd
                    style={{
                      background: "var(--color-bg-sunken)",
                      padding: "2px 4px",
                      border: "var(--border-hairline)",
                    }}
                  >
                    Ctrl + Enter
                  </kbd>
                </div>
              </div>
            </section>

            {/* Event Log Panel */}
            <section className="sim-panel" style={{ flexGrow: 1, display: "flex", flexDirection: "column" }} aria-labelledby="log-title">
              <h2 className="sim-panel__title" id="log-title">
                <span>Corporate Ledger Log</span>
                <span style={{ fontSize: "9px", color: "var(--color-fg-3)" }}>↓ CHRONOLOGICAL (NEWEST AT BOTTOM)</span>
              </h2>

              <div className="sim-log-box" ref={logContainerRef}>
                <div style={{ color: "var(--color-fg-3)", borderBottom: "1px dashed var(--color-fg-4)", paddingBottom: "var(--space-2)", marginBottom: "var(--space-2)" }}>
                  [ --- START SPRINT LEDGER --- ]
                </div>
                {state.eventLog.map((log, index) => (
                  <div key={index} className="sim-log-entry">
                    {log}
                  </div>
                ))}
              </div>

              {/* Invisible live region for screen readers */}
              <div className="sr-only" aria-live="polite">
                {state.eventLog[state.eventLog.length - 1]}
              </div>

              <div style={{ marginTop: "var(--space-4)", display: "flex", gap: "var(--space-2)" }}>
                <button
                  onClick={handleResetInitiate}
                  className="sim-btn-fixed"
                  style={{
                    width: "100%",
                    textAlign: "center",
                    fontSize: "11px",
                    background: resetConfirmMode ? "var(--color-accent-warm-strong)" : "var(--color-bg-sunken)",
                    borderColor: resetConfirmMode ? "var(--color-fg-1)" : "var(--color-fg-4)",
                    color: "var(--color-fg-1)"
                  }}
                  aria-label={resetConfirmMode ? "Click again to confirm reset" : "Reset simulation and restart"}
                >
                  {resetConfirmMode ? "⚠️ TAP AGAIN TO RESET" : "Wipe & Restart"}
                </button>
              </div>
            </section>
          </aside>
        </div>

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
                      playSound("ui-click");
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
                      playSound("ui-click");
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
                  Insert alignment credits. Pull the glass window to draft your 5th card for this sprint turn.
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
                          <span className="mtg-card__cost">${(card.cost / 1000)}k</span>
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
                          playSound("card-draw");
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
                      `The 30-turn sprint has expired, and you fell short of the ${state.difficulty === "boardroom" ? "$10 Billion" : state.difficulty === "reality" ? "$50 Billion" : "$100 Billion"} valuation target. Your organization could not adapt fast enough to the exponential rate of AI upgrades.`
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
                  Your goal is to reach a <strong>$100 Billion valuation</strong> within <strong>30 turns</strong>. If you run out of cash (&lt; -$1,000,000), you go bankrupt and lose.
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
      </main>

      <Footer />
      <AppChrome />
    </div>
  );
}
