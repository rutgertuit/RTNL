#!/usr/bin/env node
/**
 * Agent Inclusive Sim — headless balance runner.
 *
 * Mirrors the production reducer in app/technical/agent-game/AgentGameClient.tsx
 * at high enough fidelity to measure win rates per difficulty under a fixed
 * strategic policy. Runs N games per difficulty, reports win rate + avg turn
 * survived + median final valuation.
 *
 * Run:
 *   node scripts/sim_runner.mjs                 # default 25 games per difficulty
 *   node scripts/sim_runner.mjs --runs 100      # custom run count
 *   node scripts/sim_runner.mjs --verbose       # log every game's last turn
 *
 * Target win rates (from build plan):
 *   Boardroom: ~80%
 *   Reality:   ~45%
 *   ZIRP:      ~10%
 */

import process from "node:process";

// -----------------------------------------------------------------------------
// Constants (kept in sync with cards.tsx / AgentGameClient.tsx)
// -----------------------------------------------------------------------------

const DIFFICULTIES = ["boardroom", "reality", "zirp"];

const STARTING_CASH = { boardroom: 500_000, reality: 250_000, zirp: 30_000 };
const AI_CADENCE = { boardroom: 7, reality: 5, zirp: 4 };
const WIN_THRESHOLD = {
  // Tuned from balance runs targeting 80% / 45% / 10% win rates.
  // Boardroom is bounded by the 7-turn AI cadence which caps the AI version
  // at v4 within the 30-turn budget, so the threshold has to respect that
  // economic ceiling. ZIRP starts at $30k cash so the economic ramp punishes
  // immediately — threshold tuned to be reachable in ~1-in-10 lucky runs.
  boardroom:    3_000_000_000,
  reality:     65_000_000_000,
  zirp:       120_000_000_000,
};

const AI_MULT_BY_VERSION = [1, 2, 4, 12, 40, 150, 600]; // index = agentVersion

const BASE_REVENUE_BY_LEVEL = { 1: 20_000, 2: 50_000, 3: 120_000 };
const SALARY_BY_LEVEL = { 1: 8_000, 2: 18_000, 3: 45_000 };

const CARDS = {
  markdown_wiki: { cost: 15_000, kind: "doc" },
  pdp:           { cost:  5_000, kind: "pdp", target: true },
  kroket_lunch:  { cost:  2_500, kind: "kroket", target: true },
  hei_sessie:    { cost: 12_000, kind: "hei", target: true },
  kantoortuin:   { cost: 20_000, kind: "kantoor" },
  gpt5_wrapper:  { cost: 35_000, kind: "wrapper" },
  kroket_lobby:  { cost: 25_000, kind: "lobby" },
  vage_okr:      { cost: 10_000, kind: "okr" },
  auditor:       { cost: 15_000, kind: "audit" },
  powerpoint_clinic: { cost: 8_000, kind: "ppt", target: true },
  koffie_apparaat:   { cost: 15_000, kind: "koffie" },
};

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

// -----------------------------------------------------------------------------
// Engine
// -----------------------------------------------------------------------------

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function createState(difficulty) {
  // Guarantee a Markdown Wiki in the starting hand (same as the production
  // initial-state builder)
  const deckCopy = [...INITIAL_DECK];
  const wikiIdx = deckCopy.indexOf("markdown_wiki");
  deckCopy.splice(wikiIdx, 1);
  const shuffled = shuffle(deckCopy);
  const hand = ["markdown_wiki", ...shuffled.slice(0, 4)];
  const deck = shuffled.slice(4);

  return {
    difficulty,
    turn: 1,
    cash: STARTING_CASH[difficulty],
    valuation: 1_700_000, // approximate (2 onboarded + 1 onboarding * 12 * 7 + cash)
    agentVersion: 0,
    okrLevel: 0,
    employees: [
      { name: "Edgar",  level: 1, loyalty: 100, hasPDP: true,  onboarded: true,  inspirationTurns: 0, asleepTurns: 0, pptTurns: 0 },
      { name: "Jochem", level: 1, loyalty: 85,  hasPDP: false, onboarded: true,  inspirationTurns: 0, asleepTurns: 0, pptTurns: 0 },
      { name: "Lous",   level: 1, loyalty: 90,  hasPDP: false, onboarded: false, onboardingTurnsLeft: 6, inspirationTurns: 0, asleepTurns: 0, pptTurns: 0 },
    ],
    agents: 0,
    hand,
    deck,
    discard: [],
    hasDocumentation: false,
    hasKroketLobby: false,
    hasKoffieApparaat: false,
    kantoortuinPenaltyTurns: 0,
    redefinedOkrsThisTurn: false,
    hypeTurnsLeft: 0,
    isGameOver: false,
    result: null,
  };
}

function targetableEmployees(s) {
  return s.employees.filter((e) => e.loyalty > 0);
}

function playCard(s, cardId, targetIdx = -1) {
  const card = CARDS[cardId];
  if (!card) return false;
  if (s.cash < card.cost) return false;

  s.cash -= card.cost;
  // Remove from hand → discard
  const idx = s.hand.indexOf(cardId);
  if (idx >= 0) s.hand.splice(idx, 1);
  s.discard.push(cardId);

  switch (card.kind) {
    case "doc":
      s.hasDocumentation = true;
      // Re-bound onboarding for in-progress employees to 3 turns max
      for (const e of s.employees) {
        if (!e.onboarded && e.onboardingTurnsLeft > 3) {
          e.onboardingTurnsLeft = 3;
        }
      }
      break;
    case "pdp": {
      const t = s.employees[targetIdx];
      if (t) t.hasPDP = true;
      break;
    }
    case "kroket": {
      const t = s.employees[targetIdx];
      if (t) {
        t.loyalty = Math.min(100, t.loyalty + 35);
        t.asleepTurns = 1;
      }
      break;
    }
    case "hei": {
      const t = s.employees[targetIdx];
      if (t) {
        t.inspirationTurns = 5;
        t.loyalty = Math.min(100, t.loyalty + 20);
        for (const other of s.employees) {
          if (other !== t && other.level < t.level) {
            other.inspirationTurns = Math.max(other.inspirationTurns, 5);
          }
        }
      }
      break;
    }
    case "kantoor":
      for (const e of s.employees) e.loyalty = Math.min(100, e.loyalty + 15);
      s.kantoortuinPenaltyTurns = 2;
      break;
    case "wrapper":
      s.agentVersion = Math.min(6, s.agentVersion + 1);
      if (s.hasDocumentation) s.hypeTurnsLeft = 3;
      break;
    case "lobby":
      s.hasKroketLobby = true;
      break;
    case "okr":
      s.okrLevel = Math.min(5, s.okrLevel + 1);
      s.redefinedOkrsThisTurn = true;
      break;
    case "audit":
      // Just removes a leakage hit this turn; for sim we model as a small cash recovery
      s.cash += 20_000;
      break;
    case "ppt": {
      const t = s.employees[targetIdx];
      if (t) {
        t.loyalty = Math.min(100, t.loyalty + 40);
        t.pptTurns = 3;
      }
      break;
    }
    case "koffie":
      s.hasKoffieApparaat = true;
      break;
  }
  return true;
}

function hireWorker(s) {
  if (s.cash < 30_000) return false;
  s.cash -= 30_000;
  s.employees.push({
    name: `Hire${s.employees.length + 1}`,
    level: 1,
    loyalty: 100,
    hasPDP: false,
    onboarded: false,
    onboardingTurnsLeft: s.hasDocumentation ? 3 : 6,
    inspirationTurns: 0,
    asleepTurns: 0,
    pptTurns: 0,
  });
  return true;
}

function hireAgent(s) {
  if (s.cash < 15_000) return false;
  s.cash -= 15_000;
  s.agents += 1;
  return true;
}

function promote(s, idx) {
  const e = s.employees[idx];
  if (!e || e.level >= 3) return false;
  const cost = e.level === 1 ? 15_000 : 40_000;
  if (s.cash < cost) return false;
  s.cash -= cost;
  e.level += 1;
  e.loyalty = 100; // promotion resets loyalty
  return true;
}

function endTurn(s) {
  // 1. Onboarding tick
  for (const e of s.employees) {
    if (!e.onboarded) {
      e.onboardingTurnsLeft -= 1;
      if (e.onboardingTurnsLeft <= 0) e.onboarded = true;
    }
  }

  // 2. AI version upgrade
  const cadence = AI_CADENCE[s.difficulty];
  if (s.turn % cadence === 0) {
    s.agentVersion = Math.min(6, s.agentVersion + 1);
  }

  // 3. Kroket lobby passive
  if (s.hasKroketLobby) {
    for (const e of s.employees) e.loyalty = Math.min(100, e.loyalty + 2);
  }

  // 4. Revenue / salary calculation
  let revenue = 0;
  let salaries = 0;
  const hasLeakage = s.agentVersion > 2 && !s.hasDocumentation;
  const baseDecay = 4 + s.okrLevel * 3 + (hasLeakage ? 4 : 0) + (!s.hasDocumentation && s.agents > 0 ? 5 : 0);
  const aiMult = AI_MULT_BY_VERSION[s.agentVersion] ?? 1;
  const agentSynergy = s.hasDocumentation && s.agents > 0 ? 1 + s.agents * 0.25 : 1;
  const kantoorMult = s.kantoortuinPenaltyTurns > 0 ? 0.9 : 1;
  const okrMeetingMult = s.redefinedOkrsThisTurn ? 0.6 : 1;
  const koffieMult = s.hasKoffieApparaat ? 1.1 : 1;

  const stillEmployed = [];
  for (const e of s.employees) {
    salaries += SALARY_BY_LEVEL[e.level];

    const onboardingMult = e.onboarded ? 1.0 : 0.1;
    const okrMult = 1 + s.okrLevel * 0.15;
    const inspirationMult = e.inspirationTurns > 0 ? 1.5 : 1.0;
    const asleepMult = e.asleepTurns > 0 ? 0.0 : 1.0;
    const pdpMult = e.level > 1 && !e.hasPDP ? 0.7 : 1.0;
    const pptMult = e.pptTurns > 0 ? 0.8 : 1.0;
    const prod =
      BASE_REVENUE_BY_LEVEL[e.level] *
      onboardingMult * okrMult * aiMult *
      inspirationMult * asleepMult * pdpMult *
      kantoorMult * okrMeetingMult * koffieMult *
      pptMult * agentSynergy;
    revenue += prod;

    const decayMult = e.level > 1 && !e.hasPDP ? 2 : 1;
    const decay = baseDecay * decayMult;
    const nextLoyalty = Math.max(0, e.loyalty - decay);

    if (nextLoyalty > 0) {
      stillEmployed.push({
        ...e,
        loyalty: Math.floor(nextLoyalty),
        inspirationTurns: Math.max(0, e.inspirationTurns - 1),
        asleepTurns: Math.max(0, e.asleepTurns - 1),
        pptTurns: Math.max(0, e.pptTurns - 1),
      });
    }
  }
  s.employees = stillEmployed;

  // 5. Overhead + agent costs + leakage cost
  let overhead = 15_000 + (s.hasKoffieApparaat ? 1_000 : 0);
  if (!s.hasDocumentation && s.agents > 0) overhead += s.agents * 10_000;
  if (hasLeakage) overhead += (s.agentVersion - 2) * 20_000;

  s.cash = s.cash + revenue - salaries - overhead;

  // 6. Dividend
  if (s.cash > 0) {
    s.cash += Math.floor(s.cash * 0.02);
  }

  // 7. Valuation
  let pe = s.hasDocumentation ? 10 + s.agentVersion * 4 : 7;
  if (s.hypeTurnsLeft > 0) pe += 8;
  const annualRev = revenue * 12;
  s.valuation = annualRev * pe + s.cash;
  s.hypeTurnsLeft = Math.max(0, s.hypeTurnsLeft - 1);

  s.kantoortuinPenaltyTurns = Math.max(0, s.kantoortuinPenaltyTurns - 1);
  s.redefinedOkrsThisTurn = false;

  // 8. Draw up to 4
  while (s.hand.length < 4) {
    if (s.deck.length === 0) {
      if (s.discard.length === 0) break;
      s.deck = shuffle(s.discard);
      s.discard = [];
    }
    s.hand.push(s.deck.shift());
  }

  // 9. Win/loss check
  const winThreshold = WIN_THRESHOLD[s.difficulty];
  if (s.cash < -1_000_000) {
    s.isGameOver = true;
    s.result = "lose";
    s.reason = "bankrupt";
  } else if (s.valuation >= winThreshold) {
    s.isGameOver = true;
    s.result = "win";
    s.reason = "valuation";
  } else if (s.turn >= 30) {
    s.isGameOver = true;
    s.result = "lose";
    s.reason = "timeout";
  }

  s.turn += 1;
  return s;
}

// -----------------------------------------------------------------------------
// Strategy policy — plays a reasonable game so we measure design balance,
// not random-policy failure.
// -----------------------------------------------------------------------------

// Tutorial gates — mirror AgentGameClient.tsx constants so the simulator
// honours the progressive-disclosure unlocks introduced in turns 1..5.
const TURN_AGENT_UNLOCKED = 4;
const TURN_CARDS_UNLOCKED = 5;
const TURN_PROMOTION_UNLOCKED = 3;
const MAX_PROMOTIONS_PER_TURN = 1;

function policyTurn(s) {
  let safety = 20;
  let promotionsUsed = 0;

  while (safety-- > 0) {
    const cardsUnlocked = s.turn >= TURN_CARDS_UNLOCKED;
    const promotionUnlocked = s.turn >= TURN_PROMOTION_UNLOCKED;
    const agentUnlocked = s.turn >= TURN_AGENT_UNLOCKED;

    // 1. Play markdown_wiki the first turn it's in hand AND cards are unlocked
    if (cardsUnlocked && !s.hasDocumentation && s.hand.includes("markdown_wiki") && s.cash >= 15_000) {
      playCard(s, "markdown_wiki");
      continue;
    }

    // 2. Save critical loyalty with kroket
    const critical = s.employees.findIndex((e) => e.loyalty <= 30 && e.asleepTurns === 0);
    if (cardsUnlocked && critical >= 0 && s.hand.includes("kroket_lunch") && s.cash >= 2_500) {
      playCard(s, "kroket_lunch", critical);
      continue;
    }

    // 3. PDP a high-loyalty L1 before promoting
    const pdpTarget = s.employees.findIndex((e) => !e.hasPDP && e.onboarded && e.level === 1 && e.loyalty > 50);
    if (cardsUnlocked && pdpTarget >= 0 && s.hand.includes("pdp") && s.cash >= 5_000) {
      playCard(s, "pdp", pdpTarget);
      continue;
    }

    // 4. Promote — only after unlock, capped at one per turn (rule from turn 3 tutorial)
    if (promotionUnlocked && promotionsUsed < MAX_PROMOTIONS_PER_TURN) {
      const promoteIdx = s.employees.findIndex((e) => e.hasPDP && e.onboarded && e.level === 1);
      if (promoteIdx >= 0 && s.cash >= 50_000) {
        promote(s, promoteIdx);
        promotionsUsed += 1;
        continue;
      }
    }

    // 5. Permanent boosts (cards)
    if (cardsUnlocked && !s.hasKoffieApparaat && s.hand.includes("koffie_apparaat") && s.cash >= 80_000) {
      playCard(s, "koffie_apparaat");
      continue;
    }
    if (cardsUnlocked && !s.hasKroketLobby && s.hand.includes("kroket_lobby") && s.cash >= 120_000) {
      playCard(s, "kroket_lobby");
      continue;
    }

    // 6. Hire humans while onboarding budget exists
    if (s.turn < 22 && s.employees.length < 6 && s.cash >= 100_000) {
      hireWorker(s);
      continue;
    }

    // 7. Late-game GPT-5 wrapper push
    if (cardsUnlocked && s.turn >= 12 && s.hasDocumentation && s.hand.includes("gpt5_wrapper") && s.cash >= 60_000) {
      playCard(s, "gpt5_wrapper");
      continue;
    }

    // 8. Hire agents once docs are active AND the unlock turn has passed
    if (agentUnlocked && s.hasDocumentation && s.agents < 2 && s.cash >= 80_000) {
      hireAgent(s);
      continue;
    }

    // 9. OKR bump when loyalty buffer is healthy
    if (cardsUnlocked && s.okrLevel < 3 && s.hand.includes("vage_okr") && s.cash >= 80_000) {
      const anyLowLoyalty = s.employees.some((e) => e.loyalty < 50);
      if (!anyLowLoyalty) {
        playCard(s, "vage_okr");
        continue;
      }
    }

    break;
  }
}

// -----------------------------------------------------------------------------
// Run loop
// -----------------------------------------------------------------------------

function runOne(difficulty) {
  const s = createState(difficulty);
  while (!s.isGameOver) {
    policyTurn(s);
    endTurn(s);
  }
  return { result: s.result, turn: s.turn - 1, valuation: s.valuation, reason: s.reason };
}

function median(arr) {
  if (arr.length === 0) return 0;
  const sorted = [...arr].sort((a, b) => a - b);
  const m = Math.floor(sorted.length / 2);
  return sorted.length % 2 ? sorted[m] : (sorted[m - 1] + sorted[m]) / 2;
}

function fmtMoney(n) {
  if (Math.abs(n) >= 1e9) return `$${(n / 1e9).toFixed(2)}B`;
  if (Math.abs(n) >= 1e6) return `$${(n / 1e6).toFixed(2)}M`;
  if (Math.abs(n) >= 1e3) return `$${(n / 1e3).toFixed(0)}k`;
  return `$${Math.round(n)}`;
}

function main() {
  const args = process.argv.slice(2);
  const runsArg = args.indexOf("--runs");
  const runs = runsArg >= 0 ? parseInt(args[runsArg + 1], 10) : 25;
  const verbose = args.includes("--verbose");

  const target = { boardroom: 80, reality: 45, zirp: 10 };

  console.log(`\n=== Agent Inclusive Sim — Balance Run (${runs} games per difficulty) ===\n`);
  console.log("Target win rates: Boardroom 80% · Reality 45% · ZIRP 10%\n");

  const summary = {};
  for (const difficulty of DIFFICULTIES) {
    const results = [];
    for (let i = 0; i < runs; i++) results.push(runOne(difficulty));
    const wins = results.filter((r) => r.result === "win");
    const losses = results.filter((r) => r.result === "lose");
    const bankrupt = losses.filter((r) => r.reason === "bankrupt").length;
    const timeout = losses.filter((r) => r.reason === "timeout").length;
    const winRate = (wins.length / runs) * 100;
    const medianTurns = median(results.map((r) => r.turn));
    const medianVal = median(results.map((r) => r.valuation));
    const targetRate = target[difficulty];
    const delta = winRate - targetRate;
    const verdict =
      Math.abs(delta) < 10 ? "✓ on target" :
      delta > 0 ? `↑ ${delta.toFixed(0)} too easy` :
      `↓ ${(-delta).toFixed(0)} too hard`;

    summary[difficulty] = { winRate, medianTurns, medianVal, bankrupt, timeout };

    console.log(
      `${difficulty.padEnd(10)} | win ${winRate.toFixed(0)}% (target ${targetRate}%) | ${verdict}`
    );
    console.log(
      `${"".padEnd(10)} | median turns ${medianTurns}  median valuation ${fmtMoney(medianVal)}  bankrupt ${bankrupt}  timeout ${timeout}`
    );
    if (verbose) {
      console.log(
        `${"".padEnd(10)} | sample results: ${results
          .slice(0, 5)
          .map((r) => `${r.result === "win" ? "W" : "L"}@t${r.turn}/${fmtMoney(r.valuation)}`)
          .join("  ")}`
      );
    }
    console.log("");
  }

  // Recommendations
  console.log("--- Balance recommendations ---");
  for (const d of DIFFICULTIES) {
    const r = summary[d];
    const targetRate = target[d];
    const delta = r.winRate - targetRate;
    if (Math.abs(delta) < 10) continue;
    if (delta > 0) {
      console.log(`${d}: too easy. Suggest lowering starting cash, faster AI cadence, or raising win threshold.`);
    } else {
      if (r.bankrupt > r.timeout) {
        console.log(`${d}: too many bankruptcies. Suggest raising starting cash or lowering salaries.`);
      } else {
        console.log(`${d}: too many timeouts. Suggest lowering win threshold or boosting late-game AI mult.`);
      }
    }
  }
}

main();
