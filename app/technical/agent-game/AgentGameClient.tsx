"use client";

import React, { useReducer, useEffect, useState, useRef, useMemo } from "react";
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
// Reducer + initial-state + gating constants live in a pure (React-free) module
// so the headless sim harness (sim/headless.ts) can drive them too. Anything
// the UI references below is re-exported from ./reducer.
import {
  gameReducer,
  TURN_AGENT_UNLOCKED,
  TURN_CARDS_UNLOCKED,
  TURN_PROMOTION_UNLOCKED,
  MAX_PROMOTIONS_PER_TURN,
} from "./reducer";
import { nextTier, setupCostOf, rentOf, type OfficeTier } from "./office";


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
      seed: 0,
      rngTick: 0,
      nextEntityId: 1,
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
      officeTier: "home" as OfficeTier,
      overcapacityCollapseTurns: 0,
      upgradedOfficeThisTurn: false,
      hangoverTurnsLeft: 0,
      saunaActiveTurnsLeft: 0,
      hasIso9001: false,
    };
  });

  const [selectedCardId, setSelectedCardId] = useState<string | null>(null);
  const [showDifficultySelector, setShowDifficultySelector] = useState(false);
  const [showTutorial, setShowTutorial] = useState(false);
  const [copiedText, setCopiedText] = useState(false);
  // Full-screen v3: bottom-drawer state — at most one drawer open at a time.
  const [drawer, setDrawer] = useState<"log" | "cards" | "details" | null>(null);
  // Fix FF: trait popover open state per employee id
  const [traitPopoverOpen, setTraitPopoverOpen] = useState<Record<string, boolean>>({});
  // Sub-step 4: help modal open state (separate from showTutorial which is the full tutorial)
  const [helpOpen, setHelpOpen] = useState(false);

  const logContainerRef = useRef<HTMLDivElement | null>(null);
  const cardElementsRef = useRef<(HTMLButtonElement | null)[]>([]);

  // 1. Initial Load from LocalStorage (with schema validation guard)
  useEffect(() => {
    const savedState = localStorage.getItem("agent_inclusive_game_state_v1");
    if (savedState) {
      try {
        const parsed = JSON.parse(savedState);
        // Schema v1 guard
        if (parsed && parsed.version === 1 && parsed.difficulty) {
          // Backfill 5a.4 fields for saves predating state-seeded RNG.
          // Existing employees may have Date.now()-based IDs — pick a
          // nextEntityId comfortably past anything they could collide with.
          const hydrated: GameState = {
            ...parsed,
            seed: typeof parsed.seed === "number" ? parsed.seed : Math.floor(Math.random() * 2 ** 31),
            rngTick: typeof parsed.rngTick === "number" ? parsed.rngTick : 0,
            nextEntityId:
              typeof parsed.nextEntityId === "number"
                ? parsed.nextEntityId
                : (parsed.employees?.length ?? 0) + 1000,
            // Phase 5b.2 / 5b.3 backfill for saves predating the office tier.
            officeTier:
              parsed.officeTier === "home" || parsed.officeTier === "coworking" || parsed.officeTier === "kantoorpand"
                ? parsed.officeTier
                : "home",
            overcapacityCollapseTurns:
              typeof parsed.overcapacityCollapseTurns === "number" ? parsed.overcapacityCollapseTurns : 0,
            upgradedOfficeThisTurn:
              typeof parsed.upgradedOfficeThisTurn === "boolean" ? parsed.upgradedOfficeThisTurn : false,
            // Phase 5b.5 backfill for saves predating the pre-AI era counters.
            hangoverTurnsLeft:
              typeof parsed.hangoverTurnsLeft === "number" ? parsed.hangoverTurnsLeft : 0,
            saunaActiveTurnsLeft:
              typeof parsed.saunaActiveTurnsLeft === "number" ? parsed.saunaActiveTurnsLeft : 0,
            hasIso9001:
              typeof parsed.hasIso9001 === "boolean" ? parsed.hasIso9001 : false,
          };
          dispatch({ type: "LOAD_STATE", state: hydrated });
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

  // 4. Keyboard Listener for Ctrl + Enter and Escape (closes trait popovers)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.key === "Enter") {
        if (state && (state.activeEventId !== null || state.draftChoices !== null)) return;
        e.preventDefault();
        dispatch({ type: "END_TURN" });
        setSelectedCardId(null);
      }
      if (e.key === "Escape") {
        setTraitPopoverOpen({});
        setHelpOpen(false);
        setShowTutorial(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [state]);

  // Sub-step 13: H/O/C/P keyboard shortcuts for game actions
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      // Don't fire when typing in a form input
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      // Don't fire when any modal/tutorial is open
      if (helpOpen || showTutorial || showDifficultySelector || state.activeEventId || state.draftChoices || state.isGameOver) return;

      switch (e.key.toLowerCase()) {
        case "h": {
          const canHire = !state.hiredThisTurn && state.cash >= 30000 && !state.freezeHiringNextTurn;
          if (canHire) {
            e.preventDefault();
            dispatch({ type: "EMPLOY_WORKER" });
          }
          break;
        }
        case "o": {
          const canOkr = !state.redefinedOkrsThisTurn && state.cash >= 10000 && state.okrLevel < 5;
          if (canOkr) {
            e.preventDefault();
            dispatch({ type: "REDEFINE_OKRS" });
          }
          break;
        }
        case "c": {
          if (state.turn >= TURN_CARDS_UNLOCKED && state.cardsHand.length > 0) {
            e.preventDefault();
            setDrawer((d) => (d === "cards" ? null : "cards"));
          }
          break;
        }
        case "p": {
          // Open promote: find first promotable fully-onboarded human at < L3 that isn't already at max
          const promotable = state.employees.find(
            (emp) =>
              emp.type === "human" &&
              emp.promotionLevel < 3 &&
              emp.turnsOnboarded >= (state.hasDocumentation ? 3 : 6) &&
              state.turn >= TURN_PROMOTION_UNLOCKED
          );
          if (promotable && (state.promotionsThisTurn ?? 0) < MAX_PROMOTIONS_PER_TURN) {
            const cost = promotable.promotionLevel === 1 ? 15000 : 40000;
            if (state.cash >= cost) {
              e.preventDefault();
              dispatch({ type: "PROMOTE_WORKER", employeeId: promotable.id });
            }
          }
          break;
        }
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [helpOpen, showTutorial, showDifficultySelector, state, drawer]);

  // Sub-step 2: Group log entries by turn for display
  const logsByTurn = useMemo(() => {
    const groups = new Map<number, string[]>();
    let currentTurn = 0;
    for (const entry of state.eventLog) {
      // Detect "--- TURN N SUMMARY ---" sentinel lines written by END_TURN
      const turnMatch = /--- TURN (\d+) SUMMARY ---/.exec(entry);
      if (turnMatch) {
        currentTurn = Number(turnMatch[1]);
      }
      if (!groups.has(currentTurn)) groups.set(currentTurn, []);
      groups.get(currentTurn)!.push(entry);
    }
    return Array.from(groups.entries()).sort((a, b) => b[0] - a[0]); // most recent first
  }, [state.eventLog]);


  // Helper: compact money format for both reset confirm and post-mortem
  const formatCash = (n: number): string => {
    if (Math.abs(n) >= 1_000_000_000) return `$${(n / 1_000_000_000).toFixed(1)}B`;
    if (Math.abs(n) >= 1_000_000) return `$${(n / 1_000_000).toFixed(1)}M`;
    return `$${Math.round(n / 1000)}k`;
  };

  // Fix GG.1: Reset with window.confirm for safety
  const handleResetInitiate = () => {
    const ok = window.confirm(
      `Reset this run? You're on turn ${state.turn} with ${formatCash(state.cash)} cash. This cannot be undone.`
    );
    if (ok) {
      setShowDifficultySelector(true);
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

  // Cash delta — difference between current cash and the cash at start of last turn.
  // Only meaningful after the first END_TURN (prevCash is undefined on turn 1).
  const cashDelta = state.prevCash !== undefined ? state.cash - state.prevCash : null;

  // Helper: compact money format matching the HUD tiles.
  const formatDelta = (n: number): string => {
    const abs = Math.abs(n);
    if (abs >= 1_000_000) return `$${(n / 1_000_000).toFixed(1)}M`;
    return `$${Math.round(n / 1000)}k`;
  };

  // P/E multiplier breakdown (mirrors the END_TURN computation in the reducer).
  const peBase = 7;
  const peDocBonus = state.hasDocumentation ? 3 + state.agentVersion * 4 : 0;
  const peHypeBonus = state.hypeTurnsLeft > 0 ? 8 : 0;
  const peBoardPenalty = (state.boardAngerTurns ?? 0) > 0 ? -10 : 0;
  const peTotal = Math.max(1, peBase + peDocBonus + peHypeBonus + peBoardPenalty);

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
              onClick={() => setHelpOpen(true)}
              title="Show help / tutorial"
              aria-label="Show help"
            >
              ?
            </button>
            <button
              type="button"
              className="sim-fs__head-btn sim-fs__head-btn--reset"
              onClick={handleResetInitiate}
              title="Restart the simulation"
            >
              Reset
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
            {cashDelta !== null && (
              <div
                className={`sim-hud__delta ${cashDelta >= 0 ? "is-positive" : "is-negative"}`}
                aria-label={`Cash change this turn: ${cashDelta >= 0 ? "+" : ""}${formatDelta(cashDelta)}`}
              >
                {cashDelta >= 0 ? "▲" : "▼"} {formatDelta(Math.abs(cashDelta))}
              </div>
            )}
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
                          <div className="sim-desk__name-row">
                            <span className="sim-desk__name">{displayName}</span>
                            {traitInfo && (
                              <button
                                type="button"
                                className="sim-desk__trait-btn"
                                aria-label={`${displayName} trait: ${traitInfo.passiveName}`}
                                aria-expanded={!!traitPopoverOpen[emp.id]}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setTraitPopoverOpen((prev) => ({
                                    ...prev,
                                    [emp.id]: !prev[emp.id],
                                  }));
                                }}
                              >i</button>
                            )}
                          </div>
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
                        {traitPopoverOpen[emp.id] && traitInfo && (
                          <div
                            role="dialog"
                            aria-label={`${displayName} trait detail`}
                            className="sim-desk__popover"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <strong>{traitInfo.passiveName}</strong>
                            <p>{traitInfo.description}</p>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setTraitPopoverOpen((prev) => ({ ...prev, [emp.id]: false }));
                              }}
                              className="sim-desk__popover-close"
                            >Close</button>
                          </div>
                        )}
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
              title={state.hiredThisTurn ? "Already hired this turn — pacing matters." : "Hires a human employee ($30,000 upfront). Generates revenue at their level once fully onboarded (6 turns, or 3 with Markdown Wiki). Salary: $8k/turn at L1, $18k at L2, $45k at L3."}
              aria-describedby="hire-human-help"
            >
              <span className="sim-fs__move-btn-name">
                {state.hiredThisTurn ? "✓ Hired this turn" : "Hire Human"}
              </span>
              <span className="sim-fs__move-btn-cost">$30k</span>
            </button>
            <div id="hire-human-help" className="sr-only">
              Hires a human employee ($30,000 upfront). Generates revenue at their level once fully onboarded (6 turns, or 3 with Markdown Wiki). Salary: $8k/turn at L1, $18k at L2, $45k at L3.
            </div>
            {state.turn >= TURN_AGENT_UNLOCKED ? (
              <>
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
                title={state.hiredThisTurn ? "Already hired this turn — pacing matters." : "Deploys a Cognitive Agent ($15,000 upfront, no ongoing salary). With Markdown Wiki: boosts each human +25% productivity. Without docs: costs $10k/turn maintenance and drains team loyalty."}
                aria-describedby="hire-agent-help"
              >
                <span className="sim-fs__move-btn-name">
                  {state.hiredThisTurn ? "✓ Hired this turn" : "Hire Cognitive Agent"}
                </span>
                <span className="sim-fs__move-btn-cost">$15k</span>
              </button>
              <div id="hire-agent-help" className="sr-only">
                Deploys a Cognitive Agent ($15,000 upfront, no ongoing salary). With Markdown Wiki: boosts each human +25% productivity. Without docs: costs $10k/turn maintenance and drains team loyalty.
              </div>
              </>
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
            {(() => {
              const target = nextTier(state.officeTier);
              if (!target) return null;
              const cost = setupCostOf(target) + rentOf(target);
              const disabled =
                !!state.upgradedOfficeThisTurn ||
                state.cash < cost ||
                state.isGameOver ||
                state.activeEventId !== null ||
                state.draftChoices !== null;
              return (
                <button
                  type="button"
                  className={`sim-fs__move-btn ${state.upgradedOfficeThisTurn ? "is-used" : ""}`}
                  disabled={disabled}
                  onClick={() => dispatch({ type: "UPGRADE_OFFICE", tier: target })}
                  title={
                    state.upgradedOfficeThisTurn
                      ? "Already upgraded the office this turn."
                      : `Upgrade office: ${state.officeTier} → ${target}. Cost: $${cost.toLocaleString()} (setup + first month's rent).`
                  }
                >
                  <span className="sim-fs__move-btn-name">
                    {state.upgradedOfficeThisTurn ? "✓ Office upgraded" : `🏢 Upgrade → ${target}`}
                  </span>
                  <span className="sim-fs__move-btn-cost">${(cost / 1000).toLocaleString()}k</span>
                </button>
              );
            })()}
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
              title={state.redefinedOkrsThisTurn ? "Already redefined this turn — the team can't handle two alignment meetings." : "Adds one OKR Level ($10,000). Permanently increases global productivity by +15% per level. Costs 40% productivity this turn (alignment meeting penalty)."}
              aria-describedby="okr-help"
            >
              <span className="sim-fs__move-btn-name">
                {state.redefinedOkrsThisTurn ? "✓ OKRs redefined" : "Redefine OKRs"}
              </span>
              <span className="sim-fs__move-btn-cost">$10k</span>
            </button>
            <div id="okr-help" className="sr-only">
              Adds one OKR Level ($10,000). Permanently increases global productivity by +15% per level. Costs 40% productivity this turn (alignment meeting penalty).
            </div>
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
          {state.lastSnapshot && (
            <button
              type="button"
              className="sim-undo"
              onClick={() => dispatch({ type: "UNDO" })}
              aria-label="Undo last action"
            >
              ↶ Undo
            </button>
          )}
          <div className="sim-fs__next-hint sim-next-shortcut">
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
            {/* Sub-step 8: aria-live for most recent log entry (screen readers) */}
            {state.eventLog.length > 0 && (
              <div className="sr-only" aria-live="polite" aria-atomic="true" role="status">
                {state.eventLog[state.eventLog.length - 1] ?? ""}
              </div>
            )}
            {/* Sub-step 2: grouped log by turn using <details> */}
            <div className="sim-log sim-log-box" ref={logContainerRef}>
              <div style={{ color: "var(--color-fg-3)", borderBottom: "1px dashed var(--color-fg-4)", paddingBottom: "var(--space-2)", marginBottom: "var(--space-2)" }}>
                [ --- LIVE SPRINT LEDGER --- ]
              </div>
              {logsByTurn.map(([turn, entries]) => (
                <details key={turn} open={turn === state.turn - 1 || turn === 0}>
                  <summary>
                    {turn === 0 ? "Setup" : `Turn ${turn}`} ({entries.length} {entries.length === 1 ? "event" : "events"})
                  </summary>
                  <ul>
                    {entries.map((entry, i) => (
                      <li key={`${turn}-${i}`} className="sim-log-entry">{entry}</li>
                    ))}
                  </ul>
                </details>
              ))}
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
            <div className="sim-details__pe-breakdown">
              <strong>P/E breakdown</strong>
              <ul>
                <li>Base {peBase}×</li>
                {state.hasDocumentation && (
                  <li>Docs + AI v{state.agentVersion} → +{peDocBonus}×</li>
                )}
                {state.hypeTurnsLeft > 0 && (
                  <li>Hype window → +{peHypeBonus}× ({state.hypeTurnsLeft}t left)</li>
                )}
                {(state.boardAngerTurns ?? 0) > 0 && (
                  <li>Board anger → {peBoardPenalty}× ({state.boardAngerTurns}t left)</li>
                )}
                <li><strong>Current {peTotal}×</strong></li>
              </ul>
            </div>
            {/* Sub-step 9: Onboarding badge legend */}
            <p className="sim-details__legend">
              Legend: <code>1/6T</code> = onboarding turn 1 of 6.
              With Markdown Wiki active: <code>1/3T</code>.
            </p>
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

              {/* Sub-step 7: febo-cards wrapper for mobile carousel snap */}
              <div className="febo-cards" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "var(--space-4)" }}>
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
              {/* GG.3: Skip draft — dismiss FEBO without taking a card */}
              <div style={{ textAlign: "center", marginTop: "var(--space-4)" }}>
                <button
                  type="button"
                  className="sim-febo__skip"
                  onClick={() => dispatch({ type: "SKIP_DRAFT" })}
                >
                  Skip draft
                </button>
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

              {/* Sub-step 11: Post-mortem run summary */}
              <div className="sim-postmortem">
                <h4>Run summary</h4>
                <dl>
                  <dt>Final cash</dt>
                  <dd>{formatCash(state.cash)}</dd>
                  <dt>Final valuation</dt>
                  <dd>{formatCash(state.valuation)}</dd>
                  <dt>Turns played</dt>
                  <dd>{state.turn - 1} / 30</dd>
                  <dt>AI version</dt>
                  <dd>v{state.agentVersion}</dd>
                  <dt>Docs active</dt>
                  <dd>{state.hasDocumentation ? "Yes" : "No"}</dd>
                  <dt>Team size</dt>
                  <dd>{state.employees.length}</dd>
                </dl>
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

              {/* Sub-step 1: 3-column mode grid via .sim-mode__grid */}
              <div className="sim-mode__grid">
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

        {/* Tutorial / Help Overlay Modal — Sub-step 4: helpOpen + Escape close + × button */}
        {helpOpen && (
          <div className="sim-overlay" role="dialog" aria-modal="true" aria-labelledby="tutorial-title">
            <div className="sim-modal" style={{ maxWidth: "600px", textAlign: "left", position: "relative" }}>
              {/* Sub-step 4: visible × close button */}
              <button
                type="button"
                className="dialog-close"
                aria-label="Close help"
                onClick={() => setHelpOpen(false)}
              >×</button>
              <h2 className="sim-modal__title" id="tutorial-title" style={{ fontFamily: "var(--font-display)", color: "var(--color-fg-1)" }}>
                Help &amp; Tutorial
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

              {/* Sub-step 3: Per-turn tutorial replay submenu */}
              <details className="sim-help__replay">
                <summary>Re-read turn primers</summary>
                <ul>
                  {Object.entries(TUTORIAL_STEPS).map(([turnStr, step]) => (
                    <li key={turnStr}>
                      <button
                        type="button"
                        onClick={() => {
                          setHelpOpen(false);
                          // Dismiss any existing tutorial for that turn so it re-shows
                          // (the banner renders when turn matches and it isn't dismissed)
                          // We can't replay past turns, so just show what we have:
                          // inform player to navigate to that turn. For current turn only.
                          if (Number(turnStr) === state.turn) {
                            dispatch({ type: "DISMISS_TUTORIAL", turn: -999 }); // No-op sentinel; banner shows if not dismissed
                          }
                        }}
                      >
                        Turn {turnStr} — {step.title.replace(/^Day \w+ — /, "")}
                      </button>
                    </li>
                  ))}
                </ul>
              </details>

              <button
                onClick={() => setHelpOpen(false)}
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
